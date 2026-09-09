<?php

namespace Zoventic\Geo\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class AbilitiesRegistry {
    public static function init() {
        // Register agent abilities when WordPress Abilities API is available
        add_action( 'wp_abilities_init', [ __CLASS__, 'register_abilities' ] );
        add_filter( 'zoventic_geo_available_abilities', [ __CLASS__, 'get_abilities_manifest' ] );
    }

    public static function is_abilities_enabled() {
        $settings = get_option( 'zoventic_geo_settings', [] );
        if ( isset( $settings['enableAbilitiesApi'] ) ) {
            return (bool) $settings['enableAbilitiesApi'];
        }
        if ( isset( $settings['enable_abilities_api'] ) ) {
            return (bool) $settings['enable_abilities_api'];
        }
        return true;
    }

    public static function register_abilities() {
        if ( ! self::is_abilities_enabled() || ! function_exists( 'wp_register_ability' ) ) {
            return;
        }

        // Ability 1: Catalog Context Retrieval for AI Agents
        wp_register_ability( 'zoventic_geo/get_store_context', [
            'label'       => __( 'Get WooCommerce AI Catalog Context', 'zoventic-geo' ),
            'description' => __( 'Provides curated llms.txt product catalog and in-stock inventory for AI shopping agents.', 'zoventic-geo' ),
            'permission'  => 'manage_woocommerce',
            'annotations' => [ 'readonly' => true, 'idempotent' => true ],
            'callback'    => [ __CLASS__, 'ability_get_store_context' ],
        ] );

        // Ability 2: Run GEO Readiness Audit
        wp_register_ability( 'zoventic_geo/run_geo_audit', [
            'label'       => __( 'Run GEO Catalog Readiness Audit', 'zoventic-geo' ),
            'description' => __( 'Audits product schema, prices, and knowledge graph entities for AI citation scoring.', 'zoventic-geo' ),
            'permission'  => 'manage_woocommerce',
            'annotations' => [ 'readonly' => true, 'idempotent' => true ],
            'callback'    => [ __CLASS__, 'ability_run_audit' ],
        ] );
    }

    public static function get_abilities_manifest( $manifest = [] ) {
        if ( ! self::is_abilities_enabled() ) {
            return $manifest;
        }
        return array_merge( $manifest, [
            [
                'name'        => 'zoventic_geo/get_store_context',
                'intent'      => 'Query structured store catalog and llms.txt for shopping recommendations',
                'permission'  => 'manage_woocommerce',
                'annotations' => [ 'readonly' => true, 'idempotent' => true ],
            ],
            [
                'name'        => 'zoventic_geo/run_geo_audit',
                'intent'      => 'Evaluate store GEO health score and schema completeness',
                'permission'  => 'manage_woocommerce',
                'annotations' => [ 'readonly' => true, 'idempotent' => true ],
            ]
        ] );
    }

    public static function ability_get_store_context() {
        return \Zoventic\Geo\Engine\LlmsTxtGenerator::generate_content( false );
    }

    public static function ability_run_audit() {
        $total_products = function_exists( 'wp_count_posts' ) && isset( wp_count_posts( 'product' )->publish )
            ? (int) wp_count_posts( 'product' )->publish
            : 0;

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $optimized = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(DISTINCT post_id) FROM {$wpdb->postmeta} WHERE meta_key = %s",
                '_zgeo_optimized_at'
            )
        );

        $score = $total_products > 0 ? (int) round( ( $optimized / $total_products ) * 100 ) : 100;

        return [
            'geoHealthScore'    => $score,
            'status'            => $score >= 70 ? 'AI Search Ready' : 'Optimization Recommended',
            'totalProducts'     => $total_products,
            'optimizedProducts' => $optimized,
            'schemaCoverage'    => $score . '%',
            'timestamp'         => current_time( 'mysql' ),
        ];
    }

    public static function execute_ability( $ability_name ) {
        if ( $ability_name === 'zoventic_geo/get_store_context' ) {
            return [
                'success' => true,
                'ability' => $ability_name,
                'type'    => 'text/markdown',
                'result'  => self::ability_get_store_context(),
            ];
        }

        if ( $ability_name === 'zoventic_geo/run_geo_audit' ) {
            return [
                'success' => true,
                'ability' => $ability_name,
                'type'    => 'application/json',
                'result'  => self::ability_run_audit(),
            ];
        }

        return [
            'success' => false,
            'error'   => __( 'Unknown agent ability specified.', 'zoventic-geo' ),
        ];
    }
}
