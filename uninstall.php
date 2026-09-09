<?php
/**
 * Zoventic GEO Uninstall Script
 *
 * Triggered only when the plugin is deleted via the WordPress Admin.
 * Cleans up custom database tables, options, transients, and physical fallback files.
 *
 * @package Zoventic\Geo
 */

// If uninstall not called from WordPress, exit
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

/**
 * Execute clean uninstallation
 */
function zgeo_uninstall() {
    global $wpdb;

    // 1. Drop custom crawler logs database table
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}zgeo_crawler_logs" );

    // 2. Delete all plugin options
    $options_to_delete = [
        'zoventic_geo_version',
        'zoventic_geo_settings',
        'zoventic_geo_llms_txt_etag',
        'zoventic_geo_db_version',
        'zoventic_geo_active_subfeeds',
        'zoventic_geo_threats_neutralized',
    ];

    foreach ( $options_to_delete as $option_name ) {
        delete_option( $option_name );
        delete_site_option( $option_name ); // For multisite setups
    }

    // 3. Delete all cached transients
    delete_transient( 'zgeo_remote_bot_manifest' );
    delete_transient( 'zgeo_llms_txt_catalog_cache' );
    delete_transient( 'zgeo_ai_revenue_summary' );
    delete_transient( 'zgeo_rdns_verified_ips' );

    // 4. Remove physical fallback llms.txt file in root if created by plugin
    $physical_llms = ABSPATH . 'llms.txt';
    if ( file_exists( $physical_llms ) ) {
        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
        $file_content = file_get_contents( $physical_llms );
        if ( $file_content && strpos( $file_content, 'Zoventic GEO' ) !== false ) {
            wp_delete_file( $physical_llms );
        }
    }

    // 5. Flush rewrite rules
    flush_rewrite_rules();
}

zgeo_uninstall();
