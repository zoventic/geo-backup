<?php

namespace Zoventic\Geo\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class GeoScoreCalculator
 * Normalizes signal evaluations into the final Content Readiness Score
 * according to Implementation Plan v7 (Part 2.1).
 *
 * Excludes N/A signals from both numerator and denominator.
 * Applies signal-level partial rounding to 0.1 and final integer rounding.
 */
class GeoScoreCalculator {

    const VERSION = 7;

    /**
     * Calculate score and statistics from an array of evaluated signals
     *
     * @param array $signals Array of signal contract objects from GeoSignalEvaluator
     * @return array Calculated score result
     */
    public static function calculate( array $signals ) {
        $earned_points     = 0.0;
        $applicable_weight = 0.0;

        foreach ( $signals as $sig ) {
            $is_applicable = ! empty( $sig['applicable'] );
            $weight        = isset( $sig['weight'] ) ? (float) $sig['weight'] : 0.0;
            $earned        = isset( $sig['earned'] ) ? (float) $sig['earned'] : 0.0;

            if ( $is_applicable ) {
                $applicable_weight += $weight;
                $earned_points     += round( $earned, 1 );
            }
        }

        $raw_score = ( $applicable_weight > 0 )
            ? ( $earned_points / $applicable_weight ) * 100
            : 0.0;

        $final_score = (int) round( $raw_score );
        $final_score = min( 100, max( 0, $final_score ) );

        $status = 'needs_attention';
        if ( $final_score >= 85 ) {
            $status = 'optimal';
        } elseif ( $final_score >= 70 ) {
            $status = 'moderate';
        }

        return [
            'score'             => $final_score,
            'raw_score'         => round( $raw_score, 4 ),
            'earned_points'     => round( $earned_points, 1 ),
            'applicable_weight' => round( $applicable_weight, 1 ),
            'status'            => $status,
            'signals'           => $signals,
            'calculated_at'     => current_time( 'mysql' ),
            'version'           => self::VERSION,
        ];
    }
}
