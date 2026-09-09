<?php

namespace Zoventic\Geo\Pro;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class MultisiteHandler
 * Manages WordPress Multisite (WPMU) network activation, per-subsite table migrations,
 * and agency-level feed isolation across up to 25+ connected storefronts.
 */
class MultisiteHandler {

    public static function init() {
        if ( ! is_multisite() ) {
            return;
        }

        add_action( 'wpmu_new_blog', [ __CLASS__, 'on_new_blog' ], 10, 1 );
    }

    /**
     * Automatically provision tables and rewrite rules when a new subsite is created
     *
     * @param int $blog_id
     */
    public static function on_new_blog( $blog_id ) {
        if ( is_plugin_active_for_network( ZGEO_PLUGIN_BASENAME ) ) {
            switch_to_blog( $blog_id );
            \Zoventic\Geo\Core\Activator::activate();
            restore_current_blog();
        }
    }

    /**
     * Run table creation across all network sites on network-wide activation
     */
    public static function network_activate() {
        if ( ! is_multisite() ) {
            \Zoventic\Geo\Core\Activator::activate();
            return;
        }

        if ( function_exists( 'get_sites' ) ) {
            $blog_ids = get_sites( [ 'fields' => 'ids', 'number' => 0 ] );
        } else {
            global $wpdb;
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $blog_ids = $wpdb->get_col( "SELECT blog_id FROM {$wpdb->blogs}" );
        }

        foreach ( $blog_ids as $blog_id ) {
            switch_to_blog( (int) $blog_id );
            \Zoventic\Geo\Core\Activator::activate();
            restore_current_blog();
        }
    }

    /**
     * Clean up all network sites on network-wide deactivation
     */
    public static function network_deactivate() {
        if ( ! is_multisite() ) {
            \Zoventic\Geo\Core\Activator::deactivate();
            return;
        }

        if ( function_exists( 'get_sites' ) ) {
            $blog_ids = get_sites( [ 'fields' => 'ids', 'number' => 0 ] );
        } else {
            global $wpdb;
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $blog_ids = $wpdb->get_col( "SELECT blog_id FROM {$wpdb->blogs}" );
        }

        foreach ( $blog_ids as $blog_id ) {
            switch_to_blog( (int) $blog_id );
            \Zoventic\Geo\Core\Activator::deactivate();
            restore_current_blog();
        }
    }
}
