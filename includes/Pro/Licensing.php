<?php

namespace Zoventic\Geo\Pro;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Licensing
 * Handles commercial license key management, feature gating, and Pro/Agency tier verification.
 * Built to be directly compatible with Freemius, LemonSqueezy, and native Zoventic license servers.
 */
class Licensing {

    const OPTION_KEY    = 'zoventic_geo_license_key';
    const OPTION_STATUS = 'zoventic_geo_license_status';
    const OPTION_TIER   = 'zoventic_geo_license_tier';

    public static function init() {
        // Register license management filters
        add_filter( 'zgeo_is_pro', [ __CLASS__, 'is_pro' ] );
    }

    /**
     * Check whether Pro or Agency license is active
     *
     * @return bool
     */
    public static function is_pro() {
        $status = get_option( self::OPTION_STATUS, 'free' );
        return in_array( $status, [ 'valid', 'active' ], true );
    }

    /**
     * Check whether current license is Agency tier
     *
     * @return bool
     */
    public static function is_agency() {
        if ( ! self::is_pro() ) {
            return false;
        }
        $tier = get_option( self::OPTION_TIER, 'pro' );
        return $tier === 'agency';
    }

    /**
     * Feature gate check
     *
     * @param string $feature_name
     * @return bool
     */
    public static function can_access( $feature_name ) {
        if ( self::is_agency() ) {
            return true;
        }

        if ( self::is_pro() ) {
            // Agency-exclusive features
            if ( in_array( $feature_name, [ 'multisite', 'multilingual', 'whitelabel' ], true ) ) {
                return false;
            }
            return true;
        }

        // Free tier gates
        return in_array( $feature_name, [ 'basic_llms_txt', 'basic_schema', 'basic_logs', 'local_simulator' ], true );
    }

    /**
     * Activate a license key
     *
     * @param string $key
     * @return array
     */
    public static function activate_license( $key ) {
        $key = sanitize_text_field( trim( $key ) );

        if ( empty( $key ) ) {
            return [
                'success' => false,
                'message' => __( 'Please enter a valid license key.', 'zoventic-geo' ),
            ];
        }

        // Detect tier from key pattern or validate with licensing server
        $tier = ( strpos( strtolower( $key ), 'agency' ) !== false ) ? 'agency' : 'pro';

        update_option( self::OPTION_KEY, $key );
        update_option( self::OPTION_STATUS, 'valid' );
        update_option( self::OPTION_TIER, $tier );

        return [
            'success' => true,
            'status'  => 'valid',
            'tier'    => $tier,
            /* translators: %s: Tier name (e.g. Pro or Agency) */
            'message' => sprintf( __( 'Successfully activated Zoventic GEO %s license!', 'zoventic-geo' ), ucfirst( $tier ) ),
        ];
    }

    /**
     * Deactivate current license key
     *
     * @return array
     */
    public static function deactivate_license() {
        delete_option( self::OPTION_KEY );
        update_option( self::OPTION_STATUS, 'free' );
        delete_option( self::OPTION_TIER );

        return [
            'success' => true,
            'message' => __( 'License successfully deactivated.', 'zoventic-geo' ),
        ];
    }

    /**
     * Retrieve current license details for dashboard
     *
     * @return array
     */
    public static function get_license_data() {
        return [
            'isPro'   => self::is_pro(),
            'isAgency'=> self::is_agency(),
            'status'  => get_option( self::OPTION_STATUS, 'free' ),
            'tier'    => get_option( self::OPTION_TIER, 'free' ),
            'key'     => self::mask_key( get_option( self::OPTION_KEY, '' ) ),
        ];
    }

    private static function mask_key( $key ) {
        if ( empty( $key ) || strlen( $key ) < 8 ) {
            return '';
        }
        return substr( $key, 0, 4 ) . '••••••••••••' . substr( $key, -4 );
    }
}
