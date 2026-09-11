<?php

namespace Zoventic\Geo\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class GeoScorePersistence
 * Manages atomic persistence of scores, signal diagnostics, audit logs,
 * and lifecycle timestamps. Implements the request-scoped self-trigger stale guard.
 */
class GeoScorePersistence {

    /**
     * Request-scoped guard to prevent Zoventic's own updates from marking products as stale
     *
     * @var bool
     */
    public static $is_internal_saving = false;

    /**
     * Execute a callback with internal save protection active
     *
     * @param callable $callback
     * @return mixed
     */
    public static function with_internal_save( callable $callback ) {
        self::$is_internal_saving = true;
        try {
            return call_user_func( $callback );
        } finally {
            self::$is_internal_saving = false;
        }
    }

    /**
     * Save score evaluation result atomically
     *
     * @param int   $product_id
     * @param array $calc_result Output of GeoScoreCalculator::calculate
     * @param bool  $is_optimized Whether this save was accompanied by AI enrichment
     * @return bool
     */
    public static function save_score( $product_id, array $calc_result, $is_optimized = false ) {
        return self::with_internal_save( function() use ( $product_id, $calc_result, $is_optimized ) {
            $score = isset( $calc_result['score'] ) ? (int) $calc_result['score'] : 0;
            $now   = current_time( 'mysql' );

            update_post_meta( $product_id, '_zgeo_score', $score );
            update_post_meta( $product_id, '_zgeo_signals_cache', isset( $calc_result['signals'] ) ? $calc_result['signals'] : [] );
            update_post_meta( $product_id, '_zgeo_last_scored_at', $now );

            if ( $is_optimized ) {
                update_post_meta( $product_id, '_zgeo_optimized_at', $now );
                update_post_meta( $product_id, '_zgeo_last_optimized', time() );
            }

            // Clear stale status on successful re-check or enrichment
            delete_post_meta( $product_id, '_zgeo_needs_recheck' );
            delete_post_meta( $product_id, '_zgeo_dirty' );

            return true;
        } );
    }

    /**
     * Retrieve persisted GEO state for a product
     *
     * @param int $product_id
     * @return array
     */
    public static function get_product_state( $product_id ) {
        $score             = get_post_meta( $product_id, '_zgeo_score', true );
        $optimized_at      = get_post_meta( $product_id, '_zgeo_optimized_at', true );
        $last_scored_at    = get_post_meta( $product_id, '_zgeo_last_scored_at', true );
        $needs_recheck     = (bool) get_post_meta( $product_id, '_zgeo_needs_recheck', true );
        $signals           = get_post_meta( $product_id, '_zgeo_signals_cache', true );

        return [
            'score'             => ( $score !== '' ) ? (int) $score : null,
            'is_optimized'      => ! empty( $optimized_at ),
            'last_optimized_at' => $optimized_at ?: null,
            'last_scored_at'    => $last_scored_at ?: null,
            'is_stale'          => $needs_recheck,
            'signals'           => is_array( $signals ) ? $signals : [],
        ];
    }

    /**
     * Store structured AI enrichment traceability log (Plan v7 Part 3.1)
     *
     * @param int   $product_id
     * @param array $log_entries Array of traceability log items
     * @return bool
     */
    public static function save_enrichment_log( $product_id, array $log_entries ) {
        return self::with_internal_save( function() use ( $product_id, $log_entries ) {
            $existing = get_post_meta( $product_id, '_zgeo_enrichment_log', true );
            $existing = is_array( $existing ) ? $existing : [];
            $merged   = array_merge( $existing, $log_entries );
            return (bool) update_post_meta( $product_id, '_zgeo_enrichment_log', $merged );
        } );
    }

    /**
     * Get enrichment traceability log for audit
     *
     * @param int $product_id
     * @return array
     */
    public static function get_enrichment_log( $product_id ) {
        $log = get_post_meta( $product_id, '_zgeo_enrichment_log', true );
        return is_array( $log ) ? $log : [];
    }
}
