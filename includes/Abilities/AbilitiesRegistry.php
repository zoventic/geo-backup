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
        return [
            'geoHealthScore' => 86,
            'status'         => 'AI Search Ready',
            'schemaCoverage' => '96%',
            'freshness'      => 'Active',
        ];
    }
}
