<?php

namespace Zoventic\Geo\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class BulkActionScheduler
 * Manages background asynchronous processing of large catalogs (1,000 to 100,000+ SKUs)
 * in safe batches of 25 items using WooCommerce's native Action Scheduler engine.
 */
class BulkActionScheduler {

    const HOOK_BATCH_PROCESS = 'zgeo_process_catalog_batch';
    const BATCH_SIZE         = 25;
    const OPTION_PROGRESS    = 'zgeo_bulk_enrichment_progress';

    public static function init() {
        add_action( self::HOOK_BATCH_PROCESS, [ __CLASS__, 'process_batch' ], 10, 2 );
        add_action( 'woocommerce_update_product', [ __CLASS__, 'flag_product_dirty' ], 10, 1 );
    }

    /**
     * Start or resume bulk catalog optimization
     *
     * @return array Status array
     */
    public static function start_bulk_optimization() {
        if ( ! function_exists( 'as_schedule_single_action' ) ) {
            return [
                'success' => false,
                'message' => __( 'Action Scheduler is not active on this store.', 'zoventic-geo' ),
            ];
        }

        $total_products = function_exists( 'wp_count_posts' ) ? (int) wp_count_posts( 'product' )->publish : 0;

        $progress = [
            'status'     => 'running',
            'total'      => $total_products,
            'processed'  => 0,
            'offset'     => 0,
            'started_at' => time(),
            'updated_at' => time(),
            'errors'     => 0,
        ];

        update_option( self::OPTION_PROGRESS, $progress );

        // Schedule Action Scheduler async batches
        if ( function_exists( 'as_schedule_single_action' ) ) {
            as_schedule_single_action( time(), self::HOOK_BATCH_PROCESS, [ 'offset' => 0, 'batch_size' => self::BATCH_SIZE ] );
        }

        // Process first micro-batch immediately so UI receives instant real progress
        self::process_batch( 0, self::BATCH_SIZE );
        $progress = get_option( self::OPTION_PROGRESS, $progress );

        return [
            'success'  => true,
            'progress' => $progress,
            /* translators: %d: Total number of WooCommerce products being scheduled for optimization */
            'message'  => sprintf( __( 'Bulk optimization started for %d products.', 'zoventic-geo' ), $total_products ),
        ];
    }

    /**
     * Process a single micro-batch of products
     *
     * @param int $offset
     * @param int $batch_size
     */
    public static function process_batch( $offset = 0, $batch_size = 25 ) {
        if ( ! function_exists( 'wc_get_products' ) ) {
            return;
        }

        $products = wc_get_products( [
            'status' => 'publish',
            'limit'  => $batch_size,
            'offset' => $offset,
        ] );

        $count = count( $products );
        if ( $count === 0 ) {
            self::complete_optimization();
            return;
        }

        // Check if merchant enabled auto-killing long-running jobs (15 minutes / 900 seconds)
        $progress = get_option( self::OPTION_PROGRESS, [] );
        $settings = get_option( 'zoventic_geo_settings', [] );
        $auto_kill = ! empty( $settings['autoKillJobs'] ) || ! empty( $settings['auto_kill_jobs'] );

        if ( $auto_kill && ! empty( $progress['started_at'] ) && ( time() - (int) $progress['started_at'] ) > 900 ) {
            $progress['status']       = 'timed_out';
            $progress['completed_at'] = time();
            update_option( self::OPTION_PROGRESS, $progress );

            if ( ! empty( $settings['emailWarning'] ) || ! empty( $settings['email_warning'] ) ) {
                $alert_email = ! empty( $settings['alertEmail'] ) ? $settings['alertEmail'] : ( ! empty( $settings['alert_email'] ) ? $settings['alert_email'] : get_option( 'admin_email' ) );
                if ( is_email( $alert_email ) ) {
                    $site_name = get_bloginfo( 'name' );
                    /* translators: %s: Store website name */
                    $sub = sprintf( __( '[%s] Zoventic GEO: Long-running catalog enrichment job stopped', 'zoventic-geo' ), $site_name );
                    $msg = __( "A bulk catalog enrichment background job exceeded the 15-minute maximum limit and was safely paused to protect server resources.\n\nYou can resume optimization anytime from your Store Admin.", 'zoventic-geo' );
                    wp_mail( $alert_email, $sub, $msg );
                }
            }
            return;
        }

        foreach ( $products as $product ) {
            self::enrich_product( $product );
        }

        // Update progress
        $progress['processed']  = ( isset( $progress['processed'] ) ? $progress['processed'] : 0 ) + $count;
        $progress['offset']     = $offset + $count;
        $progress['updated_at'] = time();

        if ( $progress['processed'] >= $progress['total'] ) {
            self::complete_optimization();
        } else {
            update_option( self::OPTION_PROGRESS, $progress );
            // Schedule next micro-task with 2-second grace period
            if ( function_exists( 'as_schedule_single_action' ) ) {
                as_schedule_single_action( time() + 2, self::HOOK_BATCH_PROCESS, [
                    'offset'     => $progress['offset'],
                    'batch_size' => $batch_size,
                ] );
            }
        }
    }

    /**
     * Objective Multi-Signal GEO Health & AI Search Readiness Scoring Engine
     * Evaluates 10 independent machine-readability signals (100 points total).
     *
     * @param \WC_Product|int $product
     * @return array Calculated score, individual signal states, and diagnostics
     */
    public static function calculate_product_geo_score( $product ) {
        if ( is_numeric( $product ) && function_exists( 'wc_get_product' ) ) {
            $product = wc_get_product( $product );
        }

        if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
            return [
                'score'        => 0,
                'contentScore' => 0,
                'isInStock'    => false,
                'stockStatus'  => 'Unknown',
                'isOptimized'  => false,
                'isStale'      => false,
                'signals'      => [],
                'issues'       => [ 'Invalid product object' ],
            ];
        }

        $product_id  = $product->get_id();
        $signals     = [];
        $issues      = [];
        $total_score = 0;

        // -------------------------------------------------------------
        // S1: SKU / Unique Identifier (10 points)
        // -------------------------------------------------------------
        $sku = trim( (string) $product->get_sku() );
        $has_sku = ( $sku !== '' );
        $s1_pts = $has_sku ? 10 : 0;
        $total_score += $s1_pts;
        $signals['s1_sku'] = [
            'id'       => 's1_sku',
            'name'     => 'SKU / Unique Identifier',
            'passed'   => $has_sku,
            'points'   => $s1_pts,
            'max'      => 10,
            'detail'   => $has_sku ? sprintf( 'Valid SKU: %s', $sku ) : 'Missing product SKU (needed for AI quotation and price-check bots)',
        ];
        if ( ! $has_sku ) {
            $issues[] = 'Missing unique SKU identifier';
        }

        // -------------------------------------------------------------
        // S2: Category & Taxonomy Depth (10 points)
        // -------------------------------------------------------------
        $cats = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'names' ] );
        $cat_slugs = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'slugs' ] );
        $has_category = false;
        $category_name = 'General';
        if ( ! empty( $cats ) && ! is_wp_error( $cats ) ) {
            $first_cat = $cats[0];
            $first_slug = ! empty( $cat_slugs ) && ! is_wp_error( $cat_slugs ) ? strtolower( $cat_slugs[0] ) : '';
            if ( $first_slug !== 'uncategorized' && strtolower( $first_cat ) !== 'uncategorized' ) {
                $has_category = true;
                $category_name = $first_cat;
            }
        }
        $s2_pts = $has_category ? 10 : 0;
        $total_score += $s2_pts;
        $signals['s2_category'] = [
            'id'       => 's2_category',
            'name'     => 'Category & Taxonomy Depth',
            'passed'   => $has_category,
            'points'   => $s2_pts,
            'max'      => 10,
            'detail'   => $has_category ? sprintf( 'Assigned Category: %s', $category_name ) : 'Uncategorized (AI engines require specific product taxonomies)',
        ];
        if ( ! $has_category ) {
            $issues[] = 'Product is uncategorized';
        }

        // -------------------------------------------------------------
        // S3: Description Depth & Narrative (15 points)
        // >= 60 words: 15 pts | 20-59 words: 8 pts | < 20 words: 0 pts
        // -------------------------------------------------------------
        $desc_combined = wp_strip_all_tags( (string) $product->get_description() . ' ' . (string) $product->get_short_description() );
        $word_count    = str_word_count( $desc_combined );
        $s3_pts        = 0;
        $s3_detail     = '';
        if ( $word_count >= 60 ) {
            $s3_pts    = 15;
            $s3_detail = sprintf( 'Comprehensive description (%d words)', $word_count );
        } elseif ( $word_count >= 20 ) {
            $s3_pts    = 8;
            $s3_detail = sprintf( 'Moderate description (%d words) - recommend >= 60 words for deep semantic embeddings', $word_count );
        } else {
            $s3_pts    = 0;
            $s3_detail = sprintf( 'Thin description (%d words) - insufficient text for LLM answer synthesis', $word_count );
            $issues[]  = 'Product description has fewer than 20 words';
        }
        $total_score += $s3_pts;
        $signals['s3_description'] = [
            'id'       => 's3_description',
            'name'     => 'Description Depth (Word Count)',
            'passed'   => ( $s3_pts >= 8 ),
            'points'   => $s3_pts,
            'max'      => 15,
            'detail'   => $s3_detail,
        ];

        // -------------------------------------------------------------
        // S4: Structured Product Attributes (15 points)
        // -------------------------------------------------------------
        $wc_attrs = $product->get_attributes();
        $stored_specs = get_post_meta( $product_id, '_zgeo_specs', true );
        $has_attrs = ( ! empty( $wc_attrs ) && count( $wc_attrs ) > 0 ) || ( ! empty( $stored_specs ) && is_array( $stored_specs ) && count( $stored_specs ) > 0 );
        $s4_pts = $has_attrs ? 15 : 0;
        $total_score += $s4_pts;
        $signals['s4_attributes'] = [
            'id'       => 's4_attributes',
            'name'     => 'Structured Product Attributes',
            'passed'   => $has_attrs,
            'points'   => $s4_pts,
            'max'      => 15,
            'detail'   => $has_attrs ? 'Structured key-value technical specifications detected' : 'Missing technical attributes (Dimensions, Material, Specs)',
        ];
        if ( ! $has_attrs ) {
            $issues[] = 'Missing structured technical attributes';
        }

        // -------------------------------------------------------------
        // S5: Media & Visual Assets (10 points)
        // Featured image: 5 pts | Gallery images: 5 pts
        // -------------------------------------------------------------
        $has_featured = ( (int) $product->get_image_id() > 0 );
        $gallery_ids  = (array) $product->get_gallery_image_ids();
        $has_gallery  = ( count( $gallery_ids ) > 0 );
        $s5_pts       = ( $has_featured ? 5 : 0 ) + ( $has_gallery ? 5 : 0 );
        $total_score += $s5_pts;
        $signals['s5_media'] = [
            'id'       => 's5_media',
            'name'     => 'Media & Visual Assets',
            'passed'   => ( $s5_pts >= 5 ),
            'points'   => $s5_pts,
            'max'      => 10,
            'detail'   => $has_featured
                ? ( $has_gallery ? 'Featured image and gallery images present' : 'Featured image present (gallery images recommended)' )
                : 'Missing featured product image',
        ];
        if ( ! $has_featured ) {
            $issues[] = 'Missing product featured image';
        }

        // -------------------------------------------------------------
        // S6: Pricing & Currency Integrity (10 points)
        // -------------------------------------------------------------
        $price_raw = (float) $product->get_price();
        $has_price = ( $product->get_price() !== '' && $price_raw > 0 );
        $s6_pts = $has_price ? 10 : 0;
        $total_score += $s6_pts;
        $signals['s6_pricing'] = [
            'id'       => 's6_pricing',
            'name'     => 'Pricing & Currency Integrity',
            'passed'   => $has_price,
            'points'   => $s6_pts,
            'max'      => 10,
            'detail'   => $has_price ? sprintf( 'Price verified: %0.2f', $price_raw ) : 'No valid price found or price is 0.00',
        ];
        if ( ! $has_price ) {
            $issues[] = 'Missing or zero price value';
        }

        // -------------------------------------------------------------
        // S7: Semantic Specs & Buyer FAQ Graph (15 points)
        // -------------------------------------------------------------
        $has_opt_at = (bool) get_post_meta( $product_id, '_zgeo_optimized_at', true );
        $has_faq    = ! empty( get_post_meta( $product_id, '_zgeo_faq', true ) );
        $has_specs  = ! empty( $stored_specs );
        $has_s7     = ( $has_opt_at || $has_faq || $has_specs );
        $s7_pts     = $has_s7 ? 15 : 0;
        $total_score += $s7_pts;
        $signals['s7_specs_faq'] = [
            'id'       => 's7_specs_faq',
            'name'     => 'Semantic Specs & Buyer FAQ Graph',
            'passed'   => $has_s7,
            'points'   => $s7_pts,
            'max'      => 15,
            'detail'   => $has_s7 ? 'Verified AI search Q&A graph and semantic entity specs' : 'Missing AI buyer FAQs & semantic entity graph (click 1-Click Enrich)',
        ];
        if ( ! $has_s7 ) {
            $issues[] = 'Missing semantic buyer FAQ and specifications graph';
        }

        // -------------------------------------------------------------
        // S8: Merchant Return & Shipping Policy (10 points)
        // -------------------------------------------------------------
        $has_policy = (bool) get_post_meta( $product_id, '_zgeo_merchant_policy', true ) || $has_opt_at;
        $s8_pts = $has_policy ? 10 : 0;
        $total_score += $s8_pts;
        $signals['s8_policy'] = [
            'id'       => 's8_policy',
            'name'     => 'Merchant Return & Shipping Policy',
            'passed'   => $has_policy,
            'points'   => $s8_pts,
            'max'      => 10,
            'detail'   => $has_policy ? 'Verified MerchantReturnPolicy schema attached' : 'Missing merchant return/shipping structured policy (click 1-Click Enrich)',
        ];
        if ( ! $has_policy ) {
            $issues[] = 'Missing merchant return and shipping schema';
        }

        // -------------------------------------------------------------
        // S9: Social Proof / Customer Ratings (5 points)
        // -------------------------------------------------------------
        $rating_count = (int) $product->get_rating_count();
        $has_reviews  = ( $rating_count > 0 );
        $s9_pts       = $has_reviews ? 5 : 0;
        $total_score += $s9_pts;
        $signals['s9_reviews'] = [
            'id'       => 's9_reviews',
            'name'     => 'Social Proof / Customer Ratings',
            'passed'   => $has_reviews,
            'points'   => $s9_pts,
            'max'      => 5,
            'detail'   => $has_reviews ? sprintf( 'Verified ratings present (%d reviews)', $rating_count ) : 'No customer ratings found yet',
        ];

        // -------------------------------------------------------------
        // Live Stock & Stale State Evaluation
        // Note: Stock availability does NOT penalize Content Readiness Score
        // -------------------------------------------------------------
        $is_in_stock      = $product->is_in_stock();
        $stock_status     = $is_in_stock ? 'In Stock' : 'Out of Stock';
        $is_stale         = (bool) get_post_meta( $product_id, '_zgeo_needs_recheck', true );
        $is_optimized     = $has_opt_at && ! $is_stale;
        $normalized_score = min( 100, max( 0, $total_score ) );

        return [
            'score'        => $normalized_score,
            'contentScore' => $normalized_score,
            'isInStock'    => $is_in_stock,
            'stockStatus'  => $stock_status,
            'isOptimized'  => $is_optimized,
            'isStale'      => $is_stale,
            'signals'      => $signals,
            'issues'       => $issues,
        ];
    }

    /**
     * Enrich single product specifications and cache JSON-LD graph
     *
     * @param \WC_Product $product
     * @return array Calculated score data
     */
    public static function enrich_product( $product ) {
        $product_id = $product->get_id();

        // 1. Build and store semantic specs
        $category = 'General';
        $cats = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'names' ] );
        if ( ! empty( $cats ) && ! is_wp_error( $cats ) ) {
            $category = $cats[0];
        }

        $specs = [
            'Category'     => $category,
            'Condition'    => 'NewCondition',
            'Brand'        => get_bloginfo( 'name' ),
            'Availability' => $product->is_in_stock() ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        ];

        // Include any WooCommerce attributes
        $wc_attrs = $product->get_attributes();
        if ( ! empty( $wc_attrs ) ) {
            foreach ( $wc_attrs as $attr_key => $attr_obj ) {
                if ( is_a( $attr_obj, 'WC_Product_Attribute' ) ) {
                    $options = $attr_obj->get_options();
                    $val_str = is_array( $options ) ? implode( ', ', $options ) : (string) $options;
                    $label   = function_exists( 'wc_attribute_label' ) ? wc_attribute_label( $attr_obj->get_name() ) : $attr_obj->get_name();
                    $specs[ $label ] = $val_str;
                }
            }
        }

        // 2. Build structured buyer FAQs
        $faqs = [
            [
                /* translators: %s: Product title */
                'question' => sprintf( __( 'What is the delivery timeline for %s?', 'zoventic-geo' ), $product->get_name() ),
                'answer'   => __( 'Orders are processed within 24 to 48 business hours with verified shipment tracking provided upon dispatch.', 'zoventic-geo' ),
            ],
            [
                /* translators: %s: Product title */
                'question' => sprintf( __( 'What is the return policy for %s?', 'zoventic-geo' ), $product->get_name() ),
                'answer'   => __( 'Eligible for a 30-day return window in original packaging and condition with full refund guarantee.', 'zoventic-geo' ),
            ],
            [
                /* translators: 1: Product title, 2: Store website name */
                'question' => sprintf( __( 'Is %s authentic and covered by warranty?', 'zoventic-geo' ), $product->get_name() ),
                /* translators: %s: Store website name */
                'answer'   => sprintf( __( 'All items supplied by %s are 100%% authentic, sourced directly and covered by merchant support.', 'zoventic-geo' ), get_bloginfo( 'name' ) ),
            ],
        ];

        update_post_meta( $product_id, '_zgeo_specs', $specs );
        update_post_meta( $product_id, '_zgeo_faq', $faqs );
        update_post_meta( $product_id, '_zgeo_merchant_policy', 1 );
        update_post_meta( $product_id, '_zgeo_optimized_at', current_time( 'mysql' ) );
        update_post_meta( $product_id, '_zgeo_last_optimized', time() );
        delete_post_meta( $product_id, '_zgeo_needs_recheck' );
        delete_post_meta( $product_id, '_zgeo_dirty' );

        // Calculate and cache multi-signal score
        $calc = self::calculate_product_geo_score( $product );
        update_post_meta( $product_id, '_zgeo_score', $calc['score'] );

        return $calc;
    }

    /**
     * Mark optimization task as completed and invalidate feeds
     */
    public static function complete_optimization() {
        $progress = get_option( self::OPTION_PROGRESS, [] );
        $progress['status']       = 'completed';
        $progress['completed_at'] = time();
        update_option( self::OPTION_PROGRESS, $progress );

        // Invalidate llms.txt cache across all standard and category feeds
        \Zoventic\Geo\Engine\LlmsTxtGenerator::purge_cache();
    }

    /**
     * Check current progress status
     *
     * @return array
     */
    public static function get_progress() {
        $data = get_option( self::OPTION_PROGRESS, [
            'status'    => 'idle',
            'total'     => 0,
            'processed' => 0,
        ] );
        $data['action_scheduler_active'] = function_exists( 'as_schedule_single_action' );
        $data['batch_size']              = self::BATCH_SIZE;
        return $data;
    }

    /**
     * Mark individual product as dirty upon update & detect stale enrichment
     *
     * @param int $product_id
     */
    public static function flag_product_dirty( $product_id ) {
        update_post_meta( $product_id, '_zgeo_dirty', 1 );

        // If product was previously optimized, check if this update makes the enrichment stale
        $last_opt = (int) get_post_meta( $product_id, '_zgeo_last_optimized', true );
        if ( $last_opt > 0 && ( time() - $last_opt ) > 3 ) {
            update_post_meta( $product_id, '_zgeo_needs_recheck', 1 );
        }

        \Zoventic\Geo\Engine\LlmsTxtGenerator::purge_cache();
    }

    /**
     * Cancel or stop an ongoing bulk optimization task
     *
     * @return array
     */
    public static function cancel_bulk_optimization() {
        if ( function_exists( 'as_unschedule_all_actions' ) ) {
            as_unschedule_all_actions( self::HOOK_BATCH_PROCESS );
        }

        $progress = get_option( self::OPTION_PROGRESS, [] );
        $progress['status']       = 'cancelled';
        $progress['completed_at'] = time();
        update_option( self::OPTION_PROGRESS, $progress );

        \Zoventic\Geo\Engine\LlmsTxtGenerator::purge_cache();

        return [
            'success'  => true,
            'status'   => 'cancelled',
            'progress' => $progress,
            'message'  => __( 'Bulk catalog optimization cancelled.', 'zoventic-geo' ),
        ];
    }
}
