<?php

namespace Zoventic\Geo\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class BotDetector {
    private static $known_bots = [
        'GPTBot'             => 'OpenAI (ChatGPT Search)',
        'ChatGPT-User'       => 'OpenAI (ChatGPT Browse)',
        'PerplexityBot'      => 'Perplexity AI',
        'ClaudeBot'          => 'Anthropic (Claude)',
        'Anthropic-AI'       => 'Anthropic Research',
        'Google-Extended'    => 'Google (Gemini AI Overviews)',
        'Bytespider'         => 'ByteDance (TikTok AI)',
        'Applebot-Extended'  => 'Apple Intelligence',
        'cohere-ai'          => 'Cohere AI',
    ];

    public static function init() {
        add_action( 'template_redirect', [ __CLASS__, 'inspect_request' ], 1 );
        add_filter( 'robots_txt', [ __CLASS__, 'filter_robots_txt' ], 10, 2 );
    }

    /**
     * Filter the robots.txt output to enforce AI Crawler directives and provide /llms.txt discovery
     *
     * @param string $output
     * @param bool   $public
     * @return string
     */
    public static function filter_robots_txt( $output, $public ) {
        $settings = get_option( 'zoventic_geo_settings', [] );
        $perms    = isset( $settings['crawler_permissions'] ) && is_array( $settings['crawler_permissions'] )
            ? $settings['crawler_permissions']
            : ( isset( $settings['crawlerPermissions'] ) && is_array( $settings['crawlerPermissions'] ) ? $settings['crawlerPermissions'] : [] );

        $bots_map = [
            'gptbot'         => 'GPTBot',
            'perplexity'     => 'PerplexityBot',
            'claudebot'      => 'ClaudeBot',
            'googleExtended' => 'Google-Extended',
            'amazonbot'      => 'Amazonbot',
            'meta'           => 'Meta-ExternalAgent',
            'applebot'       => 'Applebot-Extended',
            'bytespider'     => 'Bytespider',
        ];

        $rules  = "\n# ----------------------------------------\n";
        $rules .= "# Zoventic GEO - AI Crawler Directives\n";
        $rules .= "# ----------------------------------------\n\n";

        foreach ( $bots_map as $key => $bot_agent ) {
            $is_allowed = ! isset( $perms[ $key ] ) || ! empty( $perms[ $key ] );
            $rules .= "User-agent: {$bot_agent}\n";
            if ( $is_allowed ) {
                $rules .= "Allow: /llms.txt\n";
                $rules .= "Allow: /llms-*.txt\n";
            } else {
                $rules .= "Disallow: /\n";
            }
            $rules .= "\n";
        }

        $rules .= "Sitemap: " . esc_url( home_url( '/llms.txt' ) ) . "\n\n";

        return $output . $rules;
    }

    public static function inspect_request() {
        if ( is_admin() ) {
            return;
        }

        $user_agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';
        if ( empty( $user_agent ) ) {
            return;
        }

        $detected_bot = null;
        $bot_vendor = '';

        foreach ( self::$known_bots as $pattern => $vendor ) {
            if ( stripos( $user_agent, $pattern ) !== false ) {
                $detected_bot = $pattern;
                $bot_vendor = $vendor;
                break;
            }
        }

        if ( ! $detected_bot ) {
            return;
        }

        $ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '127.0.0.1';
        $endpoint = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/';
        $settings = get_option( 'zoventic_geo_settings', [] );

        // 1. Check Crawler Permissions Matrix (Active Block)
        $perms = isset( $settings['crawler_permissions'] ) && is_array( $settings['crawler_permissions'] )
            ? $settings['crawler_permissions']
            : ( isset( $settings['crawlerPermissions'] ) && is_array( $settings['crawlerPermissions'] ) ? $settings['crawlerPermissions'] : [] );

        $bot_perm_map = [
            'GPTBot'            => 'gptbot',
            'ChatGPT-User'      => 'gptbot',
            'PerplexityBot'     => 'perplexity',
            'ClaudeBot'         => 'claudebot',
            'Anthropic-AI'      => 'claudebot',
            'Google-Extended'   => 'googleExtended',
            'Bytespider'        => 'bytespider',
            'Applebot-Extended' => 'applebot',
            'cohere-ai'         => 'cohere',
        ];

        $matched_key = isset( $bot_perm_map[ $detected_bot ] ) ? $bot_perm_map[ $detected_bot ] : '';
        if ( $matched_key && isset( $perms[ $matched_key ] ) && false === (bool) $perms[ $matched_key ] ) {
            self::log_crawler( $detected_bot, $bot_vendor, $ip, $user_agent, $endpoint, 403 );
            status_header( 403 );
            header( 'Content-Type: text/plain; charset=utf-8' );
            echo "403 Forbidden: {$detected_bot} access disallowed by store policy (Zoventic GEO).";
            exit;
        }

        // 2. Check Rate Limiter
        $rate_limit = isset( $settings['rate_limit_hits'] ) ? (int) $settings['rate_limit_hits'] : 120;
        $block_aggressive = ! empty( $settings['block_aggressive_bots'] );

        $rate_transient_key = 'zgeo_bot_rate_' . md5( $ip );
        $current_hits = (int) get_transient( $rate_transient_key );

        if ( $block_aggressive && $current_hits >= $rate_limit ) {
            self::log_crawler( $detected_bot, $bot_vendor, $ip, $user_agent, $endpoint, 429 );
            status_header( 429 );
            header( 'Retry-After: 3600' );
            echo '429 Too Many Requests (AI Crawler Rate Limited by Zoventic GEO)';
            exit;
        }

        // Increment hit count (1 hour window)
        set_transient( $rate_transient_key, $current_hits + 1, HOUR_IN_SECONDS );

        // Log crawler hit
        self::log_crawler( $detected_bot, $bot_vendor, $ip, $user_agent, $endpoint, 200 );
    }

    private static function log_crawler( $bot, $vendor, $ip, $ua, $endpoint, $status ) {
        global $wpdb;
        $table = $wpdb->prefix . 'zgeo_crawler_logs';

        $start_time = isset( $_SERVER['REQUEST_TIME_FLOAT'] ) ? (float) $_SERVER['REQUEST_TIME_FLOAT'] : microtime( true );
        $latency_ms = max( 1, (int) round( ( microtime( true ) - $start_time ) * 1000 ) );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $wpdb->insert(
            $table,
            [
                'bot_name'    => $bot,
                'bot_vendor'  => $vendor,
                'ip_address'  => $ip,
                'user_agent'  => substr( $ua, 0, 255 ),
                'endpoint'    => substr( $endpoint, 0, 255 ),
                'status_code' => $status,
                'latency_ms'  => $latency_ms,
                'is_cached'   => strpos( $endpoint, 'llms' ) !== false ? 1 : 0,
                'created_at'  => current_time( 'mysql' ),
            ],
            [ '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%d', '%s' ]
        );
    }
}
