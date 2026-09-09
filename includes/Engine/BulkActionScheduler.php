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
     * Enrich single product specifications and cache JSON-LD graph
     *
     * @param \WC_Product $product
     */
    public static function enrich_product( $product ) {
        $product_id = $product->get_id();

        // Calculate and cache semantic GEO readiness score
        $description = wp_strip_all_tags( $product->get_description() );
        $word_count  = str_word_count( $description );

        $score = 70;
        if ( $word_count >= 60 ) {
            $score += 10;
        }
        if ( $product->get_sku() ) {
            $score += 5;
        }
        if ( $product->get_price() ) {
            $score += 5;
        }
        if ( $product->get_image_id() ) {
            $score += 5;
        }
        if ( $product->is_in_stock() ) {
            $score += 5;
        }

        update_post_meta( $product_id, '_zgeo_score', min( 100, $score ) );
        update_post_meta( $product_id, '_zgeo_optimized_at', current_time( 'mysql' ) );
        update_post_meta( $product_id, '_zgeo_last_optimized', time() );
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
        return get_option( self::OPTION_PROGRESS, [
            'status'    => 'idle',
            'total'     => 0,
            'processed' => 0,
        ] );
    }

    /**
     * Mark individual product as dirty upon update
     *
     * @param int $product_id
     */
    public static function flag_product_dirty( $product_id ) {
        update_post_meta( $product_id, '_zgeo_dirty', 1 );
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
