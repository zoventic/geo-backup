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
                'enable_llms_txt'         => true,
                'enableLlmsTxt'           => true,
                'enable_json_ld_enhancer' => true,
                'enableJsonLdEnhancer'    => true,
                'enable_bot_logging'      => true,
                'enableBotLogging'        => true,
                'block_aggressive_bots'   => true,
                'blockAggressiveBots'     => true,
                'rate_limit_hits'         => 120,
                'rateLimitCrawlerHits'    => 120,
                'cache_duration_minutes'  => 60,
                'cacheDurationMinutes'    => 60,
                'auto_purge_out_of_stock' => true,
                'autoPurgeOutOfStock'     => true,
                'enable_abilities_api'    => true,
                'enableAbilitiesApi'      => true,
                'enable_index_now'        => true,
                'enableIndexNow'          => true,
                'enable_email_digest'     => true,
                'enableEmailDigest'       => true,
                'rank_radar_frequency'    => '24h',
                'rankRadarFrequency'     => '24h',
                'auto_kill_jobs'          => true,
                'autoKillJobs'            => true,
                'email_warning'           => true,
                'emailWarning'            => true,
                'selected_model'          => 'gpt4o',
                'selectedModel'           => 'gpt4o',
                'monthly_budget_cap'      => 5,
                'monthlyBudgetCap'        => 5,
                'feed_rules'              => [
                    'variations' => true,
                    'reviews'    => true,
                    'inStock'    => true,
                    'coupons'    => true,
                ],
                'feedRules'               => [
                    'variations' => true,
                    'reviews'    => true,
                    'inStock'    => true,
                    'coupons'    => true,
                ],
                'crawler_permissions'     => [
                    'gptbot'         => true,
                    'perplexity'     => true,
                    'claudebot'      => true,
                    'googleExtended' => true,
                    'amazonbot'      => true,
                    'meta'           => true,
                    'applebot'       => true,
                    'bytespider'     => true,
                ],
                'crawlerPermissions'     => [
                    'gptbot'         => true,
                    'perplexity'     => true,
                    'claudebot'      => true,
                    'googleExtended' => true,
                    'amazonbot'      => true,
                    'meta'           => true,
                    'applebot'       => true,
                    'bytespider'     => true,
                ],
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
