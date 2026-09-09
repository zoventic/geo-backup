<?php

namespace Zoventic\Geo\Core;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Activator {
    public static function activate() {
        global $wpdb;

        // 1. Create Crawler Logs table with optimal indexing
        $table_name = $wpdb->prefix . 'zgeo_crawler_logs';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            bot_name varchar(64) NOT NULL DEFAULT '',
            bot_vendor varchar(128) NOT NULL DEFAULT '',
            ip_address varchar(45) NOT NULL DEFAULT '',
            user_agent text NOT NULL,
            endpoint text NOT NULL,
            status_code smallint(5) unsigned NOT NULL DEFAULT 200,
            latency_ms smallint(5) unsigned NOT NULL DEFAULT 0,
            is_cached tinyint(1) NOT NULL DEFAULT 0,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY bot_name (bot_name),
            KEY status_code (status_code),
            KEY created_at (created_at)
        ) {$charset_collate};";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );

        // 2. Set default settings if not already present
        if ( ! get_option( 'zoventic_geo_settings' ) ) {
            $defaults = [
                'enable_llms_txt'       => true,
                'enable_json_ld'        => true,
                'enable_bot_logging'    => true,
                'block_aggressive_bots' => true,
                'rate_limit_hits'       => 120,
                'cache_duration_mins'   => 60,
                'auto_purge_oos'        => true,
                'enable_abilities_api'  => true,
            ];
            add_option( 'zoventic_geo_settings', $defaults, '', 'no' );
        }

        // 3. Register rewrite rules for /llms.txt
        \Zoventic\Geo\Engine\LlmsTxtGenerator::register_rewrite_rules();
        flush_rewrite_rules();
    }

    public static function deactivate() {
        flush_rewrite_rules();
    }
}
