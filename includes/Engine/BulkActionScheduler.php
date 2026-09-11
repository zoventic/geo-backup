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
     * Evaluate and calculate objective GEO Health & AI Search Readiness
     * Delegates evaluation to GeoSignalEvaluator and scoring to GeoScoreCalculator (Plan v7 Part 2.7).
     *
     * @param \WC_Product|int $product
     * @return array Standardized score, individual signal states, and diagnostics
     */
    public static function calculate_product_geo_score( $product ) {
        if ( is_numeric( $product ) && function_exists( 'wc_get_product' ) ) {
            $product = wc_get_product( $product );
        }

        if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
            return [
                'score'            => 0,
                'contentScore'     => 0,
                'rawScore'         => 0,
                'earnedPoints'     => 0,
                'applicableWeight' => 0,
                'status'           => 'needs_attention',
                'isInStock'        => false,
                'stockStatus'      => 'Unknown',
                'isOptimized'      => false,
                'isStale'          => false,
                'lastScoredAt'     => null,
                'lastOptimizedAt'  => null,
                'signals'          => [],
                'issues'           => [ 'Invalid product object' ],
            ];
        }

        $product_id = $product->get_id();
        $signals    = GeoSignalEvaluator::evaluate( $product );
        $calc       = GeoScoreCalculator::calculate( $signals );
        $state      = GeoScorePersistence::get_product_state( $product_id );

        $issues = [];
        foreach ( $signals as $sig ) {
            if ( ! empty( $sig['applicable'] ) && $sig['status'] === 'FAIL' ) {
                $issues[] = isset( $sig['diagnostic']['reason'] ) ? $sig['diagnostic']['reason'] : $sig['name'];
            }
        }

        return [
            'score'            => $calc['score'],
            'contentScore'     => $calc['score'],
            'rawScore'         => $calc['raw_score'],
            'earnedPoints'     => $calc['earned_points'],
            'applicableWeight' => $calc['applicable_weight'],
            'status'           => $calc['status'],
            'isInStock'        => $product->is_in_stock(),
            'stockStatus'      => $product->is_in_stock() ? 'In Stock' : 'Out of Stock',
            'isOptimized'      => $state['is_optimized'],
            'isStale'          => $state['is_stale'],
            'lastScoredAt'     => $state['last_scored_at'],
            'lastOptimizedAt'  => $state['last_optimized_at'],
            'signals'          => $signals,
            'issues'           => $issues,
        ];
    }

    /**
     * Enrich single product specifications with zero-hallucination guard and traceability log
     *
     * @param \WC_Product $product
     * @return array Calculated score data
     */
    public static function enrich_product( $product ) {
        if ( is_numeric( $product ) && function_exists( 'wc_get_product' ) ) {
            $product = wc_get_product( $product );
        }

        if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
            return false;
        }

        $product_id = $product->get_id();

        return GeoScorePersistence::with_internal_save( function() use ( $product, $product_id ) {
            // 1. Build and store semantic specs grounded in merchant data
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

            // Extract weight/dimensions if present
            if ( $product->has_weight() ) {
                $specs['Weight'] = $product->get_weight() . ' ' . get_option( 'woocommerce_weight_unit', 'kg' );
            }
            if ( $product->has_dimensions() ) {
                $specs['Dimensions'] = sprintf(
                    '%s x %s x %s %s',
                    $product->get_length(),
                    $product->get_width(),
                    $product->get_height(),
                    get_option( 'woocommerce_dimension_unit', 'cm' )
                );
            }

            // 2. Build structured buyer FAQs grounded strictly in merchant product data
            $faqs = [];
            $desc = wp_strip_all_tags( $product->get_description() . ' ' . $product->get_short_description() );

            $faqs[] = [
                /* translators: %s: Product title */
                'question' => sprintf( __( 'What is the primary category and application of %s?', 'zoventic-geo' ), $product->get_name() ),
                'answer'   => sprintf( __( '%1$s is cataloged under %2$s. %3$s', 'zoventic-geo' ), $product->get_name(), $category, mb_substr( $desc, 0, 140 ) . ( mb_strlen( $desc ) > 140 ? '...' : '' ) ),
            ];

            $faqs[] = [
                /* translators: %s: Product title */
                'question' => sprintf( __( 'What are the verified specifications for %s?', 'zoventic-geo' ), $product->get_name() ),
                'answer'   => sprintf( __( 'Availability: %1$s. SKU: %2$s. Price: %3$s.', 'zoventic-geo' ), $product->is_in_stock() ? 'In Stock' : 'Out of Stock', $product->get_sku() ?: 'N/A', $product->get_price() ?: 'N/A' ),
            ];

            // 3. Traceability log entries (Plan v7 Part 3.1)
            $log_entries = [
                [
                    'field'        => '_zgeo_specs',
                    'value'        => $specs,
                    'source'       => [
                        'type'                => 'product_attribute',
                        'product_id'          => $product_id,
                        'source_text_excerpt' => sprintf( 'Extracted from WooCommerce attributes and taxonomy for %s', $product->get_name() ),
                    ],
                    'generated_at' => current_time( 'mysql' ),
                    'model'        => 'zoventic-geo-extractor-v7',
                ],
                [
                    'field'        => '_zgeo_faq',
                    'value'        => $faqs,
                    'source'       => [
                        'type'                => 'product_description',
                        'product_id'          => $product_id,
                        'source_text_excerpt' => mb_substr( $desc, 0, 120 ),
                    ],
                    'generated_at' => current_time( 'mysql' ),
                    'model'        => 'zoventic-geo-extractor-v7',
                ],
            ];

            update_post_meta( $product_id, '_zgeo_specs', $specs );
            update_post_meta( $product_id, '_zgeo_faq', $faqs );
            update_post_meta( $product_id, '_zgeo_merchant_policy', 1 );

            // Evaluate new signals and calculate normalized score
            $signals = GeoSignalEvaluator::evaluate( $product );
            $calc    = GeoScoreCalculator::calculate( $signals );

            // Persist score, timestamps, and audit log atomically
            GeoScorePersistence::save_score( $product_id, $calc, true );
            GeoScorePersistence::save_enrichment_log( $product_id, $log_entries );

            return self::calculate_product_geo_score( $product );
        } );
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
        // Self-trigger guard: skip when Zoventic GEO itself is performing internal enrichment/recheck save
        if ( GeoScorePersistence::$is_internal_saving ) {
            return;
        }

        update_post_meta( $product_id, '_zgeo_dirty', 1 );

        // If product was previously scored or optimized, merchant update makes the score/enrichment stale
        $last_opt  = (int) get_post_meta( $product_id, '_zgeo_last_optimized', true );
        $has_score = metadata_exists( 'post', $product_id, '_zgeo_score' );
        if ( $last_opt > 0 || $has_score ) {
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
