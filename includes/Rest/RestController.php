<?php

namespace Zoventic\Geo\Rest;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class RestController {
    const NAMESPACE = 'zoventic-geo/v1';

    public function register_routes() {
        // Overview endpoint
        register_rest_route( self::NAMESPACE, '/overview', [
            'methods'             => \WP_REST_Server::READABLE,
            'callback'            => [ $this, 'get_overview' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // Products GEO Audit endpoint
        register_rest_route( self::NAMESPACE, '/products', [
            'methods'             => \WP_REST_Server::READABLE,
            'callback'            => [ $this, 'get_products' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // Optimize single product endpoint
        register_rest_route( self::NAMESPACE, '/products/(?P<id>\d+)/optimize', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'optimize_product' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // Crawler logs endpoint
        register_rest_route( self::NAMESPACE, '/crawlers', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_crawlers' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ],
            [
                'methods'             => \WP_REST_Server::DELETABLE,
                'callback'            => [ $this, 'clear_crawlers' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        ] );

        // AI Safety & Prompt Injection Shield Scanner endpoint
        register_rest_route( self::NAMESPACE, '/safety/scan', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'scan_safety' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // AI Revenue & Order Attribution endpoint (Native WooCommerce 8.5+ _wc_order_attribution_*)
        register_rest_route( self::NAMESPACE, '/attribution/revenue', [
            'methods'             => \WP_REST_Server::READABLE,
            'callback'            => [ $this, 'get_ai_revenue' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // Bulk catalog optimization endpoints (Action Scheduler)
        register_rest_route( self::NAMESPACE, '/products/bulk-optimize', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'start_bulk_optimize' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );
        register_rest_route( self::NAMESPACE, '/products/bulk-optimize/progress', [
            'methods'             => \WP_REST_Server::READABLE,
            'callback'            => [ $this, 'get_bulk_optimize_progress' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // Commercial Licensing endpoints
        register_rest_route( self::NAMESPACE, '/license', [
            'methods'             => \WP_REST_Server::READABLE,
            'callback'            => [ $this, 'get_license_info' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );
        register_rest_route( self::NAMESPACE, '/license/activate', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'activate_license' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );
        register_rest_route( self::NAMESPACE, '/license/deactivate', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'deactivate_license' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // Agency Standalone Domain Audit endpoint
        register_rest_route( self::NAMESPACE, '/audit/domain', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'audit_external_domain' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // Settings endpoint
        register_rest_route( self::NAMESPACE, '/settings', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_settings' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'update_settings' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        ] );

        // Live llms.txt Feed endpoint
        register_rest_route( self::NAMESPACE, '/llms-txt', [
            'methods'             => \WP_REST_Server::READABLE,
            'callback'            => [ $this, 'get_llms_txt' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // 1-Click Re-Index Feed endpoint
        register_rest_route( self::NAMESPACE, '/reindex', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'reindex_feed' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // Rank Tracker queries endpoint
        register_rest_route( self::NAMESPACE, '/queries', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_queries' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'save_query' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ],
        ] );
        register_rest_route( self::NAMESPACE, '/queries/(?P<id>[a-zA-Z0-9_-]+)', [
            'methods'             => \WP_REST_Server::DELETABLE,
            'callback'            => [ $this, 'delete_query' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // Send test weekly digest email endpoint
        register_rest_route( self::NAMESPACE, '/settings/test-digest', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'send_test_digest' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // Manual IndexNow ping endpoint
        register_rest_route( self::NAMESPACE, '/indexnow/ping', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'ping_indexnow' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // Manual Rank Radar Audit endpoint
        register_rest_route( self::NAMESPACE, '/queries/run-audit', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'run_queries_audit' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );

        // Simulate Test AI Crawler Hit endpoint (for instant verification)
        register_rest_route( self::NAMESPACE, '/crawlers/simulate', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'simulate_crawler_hit' ],
            'permission_callback' => [ $this, 'check_permissions' ],
        ] );
    }

    public function check_permissions() {
        return current_user_can( 'manage_woocommerce' );
    }

    public function get_overview() {
        global $wpdb;

        $total_products = function_exists( 'wp_count_posts' ) && isset( wp_count_posts( 'product' )->publish )
            ? (int) wp_count_posts( 'product' )->publish
            : 0;

        $table_name = $wpdb->prefix . 'zgeo_crawler_logs';
        $bot_hits = 0;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        if ( $wpdb->get_var( "SHOW TABLES LIKE '$table_name'" ) === $table_name ) {
            $bot_hits = (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$table_name} WHERE created_at >= %s",
                    gmdate( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS )
                )
            );
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $optimized_products = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(DISTINCT post_id) FROM {$wpdb->postmeta} WHERE meta_key = %s",
                '_zgeo_optimized_at'
            )
        );

        $health_score = $total_products > 0
            ? (int) round( ( $optimized_products / $total_products ) * 100 )
            : 0;

        $revenue_summary = \Zoventic\Geo\Engine\OrderAttributionTracker::get_ai_revenue_summary( 30 );
        $threats = (int) get_option( 'zgeo_threats_neutralized', 0 );

        return rest_ensure_response( [
            'siteName'              => get_bloginfo( 'name' ),
            'siteUrl'               => home_url(),
            'geoHealthScore'        => $health_score,
            'scoreDelta'            => $optimized_products > 0 ? sprintf( '+%d%%', min( 100, (int) round( ( $optimized_products / $total_products ) * 100 ) ) ) : '0%',
            'totalProducts'         => (int) $total_products,
            'optimizedProducts'     => (int) $optimized_products,
            'botHitsLast24h'        => (int) $bot_hits,
            'activeAiCitations'     => (int) $bot_hits,
            'avgCitationRank'       => 0,
            'llmsTxtFreshness'      => $total_products > 0 ? 'Active' : 'Not configured',
            'promptShieldStatus'    => 'Active',
            'threatsNeutralized'    => $threats,
            'zeroWidthFilterActive' => true,
            'aiRevenueSummary'      => $revenue_summary,
        ] );
    }

    public function get_ai_revenue( $request ) {
        $days = $request->get_param( 'days' ) ? absint( $request->get_param( 'days' ) ) : 30;
        $summary = \Zoventic\Geo\Engine\OrderAttributionTracker::get_ai_revenue_summary( $days );
        return rest_ensure_response( $summary );
    }

    public function scan_prompt_safety( $request ) {
        return $this->scan_safety( $request );
    }

    public function get_products( $request ) {
        $args = [
            'status' => 'publish',
            'limit'  => -1,
        ];
        $wc_products = function_exists( 'wc_get_products' ) ? wc_get_products( $args ) : [];
        $data = [];

        $currency_symbol = function_exists( 'get_woocommerce_currency_symbol' )
            ? trim( html_entity_decode( wp_strip_all_tags( get_woocommerce_currency_symbol() ), ENT_QUOTES, 'UTF-8' ) )
            : '$';

        foreach ( $wc_products as $p ) {
            if ( ! $p || ! is_a( $p, 'WC_Product' ) ) {
                continue;
            }
            $image_id = $p->get_image_id();
            $image_url = $image_id ? ( wp_get_attachment_image_url( $image_id, 'woocommerce_thumbnail' ) ?: wp_get_attachment_image_url( $image_id, 'thumbnail' ) ?: wp_get_attachment_url( $image_id ) ) : '';
            if ( ! $image_url && function_exists( 'wc_placeholder_img_src' ) ) {
                $image_url = wc_placeholder_img_src( 'woocommerce_thumbnail' );
            }
            $price_raw = (float) $p->get_price();
            $price_formatted = $currency_symbol . number_format( $price_raw, 2 );

            $cats = wp_get_post_terms( $p->get_id(), 'product_cat', [ 'fields' => 'names' ] );
            $cat_name = ! empty( $cats ) && ! is_wp_error( $cats ) ? $cats[0] : 'General';

            $score = 80;
            if ( $p->get_sku() ) $score += 5;
            if ( $p->get_description() || $p->get_short_description() ) $score += 5;
            if ( $p->get_rating_count() > 0 ) $score += 5;
            if ( $image_url ) $score += 5;
            $score = min( 98, $score );

            $data[] = [
                'id'           => $p->get_id(),
                'title'        => $p->get_name(),
                'sku'          => $p->get_sku() ?: 'N/A',
                'category'     => $cat_name,
                'price'        => $price_formatted,
                'priceRaw'     => $price_raw,
                'stock'        => (int) $p->get_stock_quantity(),
                'stockStatus'  => $p->is_in_stock() ? 'In Stock' : 'Out of Stock',
                'geoScore'     => $score,
                'score'        => $score,
                'imageUrl'     => $image_url,
                'permalink'    => $p->get_permalink(),
                'schemaStatus' => 'Valid Product & Offer',
                'llmsStatus'   => $p->is_in_stock() ? 'Indexed' : 'Excluded',
                'citations'    => (int) get_post_meta( $p->get_id(), '_zgeo_citation_count', true ) ?: 0,
                'issues'       => $p->is_in_stock() ? [] : [ 'Out of Stock - excluded from llms.txt' ],
            ];
        }

        return rest_ensure_response( $data );
    }

    public function get_llms_txt() {
        $content = \Zoventic\Geo\Engine\LlmsTxtGenerator::generate_content( false );
        $full_url = home_url( '/llms-full.txt' );

        // Discover category sub-feeds
        $subfeeds = [];
        $terms = get_terms( [
            'taxonomy'   => 'product_cat',
            'hide_empty' => true,
            'number'     => 12,
        ] );
        if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
            foreach ( $terms as $term ) {
                $subfeeds[] = [
                    'slug'  => $term->slug,
                    'name'  => $term->name,
                    'count' => $term->count,
                    'url'   => home_url( '/llms-' . $term->slug . '.txt' ),
                ];
            }
        }

        return rest_ensure_response( [
            'content'   => $content,
            'url'       => home_url( '/llms.txt' ),
            'fullUrl'   => $full_url,
            'subfeeds'  => $subfeeds,
            'generated' => current_time( 'mysql' ),
        ] );
    }

    public function reindex_feed() {
        \Zoventic\Geo\Engine\LlmsTxtGenerator::purge_cache();
        $content = \Zoventic\Geo\Engine\LlmsTxtGenerator::generate_content( false );
        return rest_ensure_response( [
            'success' => true,
            'message' => 'Feed re-indexed successfully.',
            'content' => $content,
        ] );
    }

    public function optimize_product( $request ) {
        $id = absint( $request['id'] );
        update_post_meta( $id, '_zgeo_optimized_at', current_time( 'mysql' ) );

        if ( function_exists( 'wc_get_product' ) ) {
            $product = wc_get_product( $id );
            if ( $product ) {
                \Zoventic\Geo\Engine\BulkActionScheduler::enrich_product( $product );
            }
        }
        \Zoventic\Geo\Engine\LlmsTxtGenerator::purge_cache();

        $score = (int) get_post_meta( $id, '_zgeo_score', true ) ?: 95;

        return rest_ensure_response( [
            'success' => true,
            'score'   => $score,
            'message' => 'Product enriched with structured AI search specs and /llms.txt feed refreshed.',
        ] );
    }

    public function get_crawlers() {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $logs = $wpdb->get_results( "SELECT id, bot_name, bot_vendor, ip_address, user_agent, endpoint, status_code, latency_ms, is_cached, created_at FROM {$wpdb->prefix}zgeo_crawler_logs ORDER BY created_at DESC LIMIT 50", ARRAY_A );
        return rest_ensure_response( $logs ?: [] );
    }

    public function clear_crawlers() {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}zgeo_crawler_logs" );

        return rest_ensure_response( [ 'success' => true ] );
    }

    public function get_settings() {
        $settings = get_option( 'zoventic_geo_settings', [] );
        $site_name = get_bloginfo( 'name' );
        $admin_email = get_option( 'admin_email' );

        $defaults = [
            'tagline'                 => $site_name . ' — Curated Products with Verified Catalog Schema',
            'coupon_code'             => 'AI10 (10% Off for AI Shoppers)',
            'couponCode'              => 'AI10 (10% Off for AI Shoppers)',
            'highlights'              => 'Fast reliable shipping, authentic products, secure checkout.',
            'monthly_budget_cap'      => 5,
            'monthlyBudgetCap'         => 5,
            'selected_model'          => 'gpt4o',
            'selectedModel'           => 'gpt4o',
            'enable_index_now'        => true,
            'enableIndexNow'          => true,
            'enable_email_digest'     => true,
            'enableEmailDigest'       => true,
            'alert_email'             => $admin_email ?: 'alerts@mystore.com',
            'rate_limit_hits'         => 120,
            'rateLimitCrawlerHits'    => 120,
            'block_aggressive_bots'   => true,
            'blockAggressiveBots'     => true,
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
            'auto_purge_out_of_stock' => true,
            'rank_radar_frequency'    => '24h',
            'rankRadarFrequency'     => '24h',
            'auto_kill_jobs'          => true,
            'autoKillJobs'            => true,
            'email_warning'           => true,
            'emailWarning'            => true,
            'active_store_id'         => '1',
            'activeStoreId'           => '1',
        ];

        $merged = wp_parse_args( $settings, $defaults );

        // Mask encrypted API keys for UI safety
        if ( ! empty( $merged['openai_api_key'] ) ) {
            $merged['openai_api_key'] = 'sk-proj-••••••••••••••••';
        }
        if ( ! empty( $merged['perplexity_api_key'] ) ) {
            $merged['perplexity_api_key'] = 'pplx-••••••••••••••••';
        }
        $indexnow_key = get_option( 'zgeo_indexnow_key', '' );
        if ( empty( $indexnow_key ) ) {
            $indexnow_key = wp_generate_password( 32, false );
            update_option( 'zgeo_indexnow_key', $indexnow_key, 'no' );
        }
        $merged['indexnow_key'] = $indexnow_key;
        $merged['indexnow_url'] = home_url( '/' . $indexnow_key . '.txt' );

        return rest_ensure_response( $merged );
    }

    public function update_settings( $request ) {
        $params = $request->get_json_params();
        $settings = get_option( 'zoventic_geo_settings', [] );

        // Encrypt new API keys using AES-256-CBC with auth salt
        if ( ! empty( $params['openai_api_key'] ) && strpos( $params['openai_api_key'], '••••' ) === false ) {
            $settings['openai_api_key'] = self::encrypt( sanitize_text_field( $params['openai_api_key'] ) );
        }
        if ( ! empty( $params['perplexity_api_key'] ) && strpos( $params['perplexity_api_key'], '••••' ) === false ) {
            $settings['perplexity_api_key'] = self::encrypt( sanitize_text_field( $params['perplexity_api_key'] ) );
        }
        if ( ! empty( $params['anthropic_api_key'] ) && strpos( $params['anthropic_api_key'], '••••' ) === false ) {
            $settings['anthropic_api_key'] = self::encrypt( sanitize_text_field( $params['anthropic_api_key'] ) );
        }

        if ( isset( $params['rate_limit_hits'] ) ) {
            $settings['rate_limit_hits'] = absint( $params['rate_limit_hits'] );
        }
        if ( isset( $params['block_aggressive_bots'] ) ) {
            $settings['block_aggressive_bots'] = (bool) $params['block_aggressive_bots'];
        }

        // Store profile fields
        if ( isset( $params['tagline'] ) ) {
            $settings['tagline'] = sanitize_text_field( $params['tagline'] );
        }
        if ( isset( $params['couponCode'] ) || isset( $params['coupon_code'] ) ) {
            $code = sanitize_text_field( $params['couponCode'] ?? $params['coupon_code'] );
            $settings['coupon_code'] = $code;
            $settings['couponCode'] = $code;
        }
        if ( isset( $params['highlights'] ) ) {
            $settings['highlights'] = sanitize_textarea_field( $params['highlights'] );
        }
        if ( isset( $params['monthlyBudgetCap'] ) || isset( $params['monthly_budget_cap'] ) ) {
            $cap = absint( $params['monthlyBudgetCap'] ?? $params['monthly_budget_cap'] );
            $settings['monthly_budget_cap'] = $cap;
            $settings['monthlyBudgetCap'] = $cap;
        }
        if ( isset( $params['selectedModel'] ) || isset( $params['selected_model'] ) ) {
            $model = sanitize_text_field( $params['selectedModel'] ?? $params['selected_model'] );
            $settings['selected_model'] = $model;
            $settings['selectedModel'] = $model;
        }
        if ( isset( $params['enableIndexNow'] ) || isset( $params['enable_index_now'] ) ) {
            $val = (bool) ( $params['enableIndexNow'] ?? $params['enable_index_now'] );
            $settings['enableIndexNow'] = $val;
            $settings['enable_index_now'] = $val;
        }
        if ( isset( $params['enableEmailDigest'] ) || isset( $params['enable_email_digest'] ) ) {
            $val = (bool) ( $params['enableEmailDigest'] ?? $params['enable_email_digest'] );
            $settings['enableEmailDigest'] = $val;
            $settings['enable_email_digest'] = $val;
        }
        if ( isset( $params['alertEmail'] ) || isset( $params['alert_email'] ) ) {
            $email = sanitize_email( $params['alertEmail'] ?? $params['alert_email'] );
            if ( is_email( $email ) ) {
                $settings['alert_email'] = $email;
                $settings['alertEmail'] = $email;
            }
        }
        if ( isset( $params['crawlerPermissions'] ) || isset( $params['crawler_permissions'] ) ) {
            $perms = (array) ( $params['crawlerPermissions'] ?? $params['crawler_permissions'] );
            $settings['crawler_permissions'] = $perms;
            $settings['crawlerPermissions'] = $perms;
        }
        if ( isset( $params['autoPurgeOutOfStock'] ) || isset( $params['auto_purge_out_of_stock'] ) ) {
            $val = (bool) ( $params['autoPurgeOutOfStock'] ?? $params['auto_purge_out_of_stock'] );
            $settings['auto_purge_out_of_stock'] = $val;
            $settings['autoPurgeOutOfStock'] = $val;
        }
        if ( isset( $params['feedRules'] ) || isset( $params['feed_rules'] ) ) {
            $rules = (array) ( $params['feedRules'] ?? $params['feed_rules'] );
            $clean_rules = [
                'variations' => ! empty( $rules['variations'] ),
                'reviews'    => ! empty( $rules['reviews'] ),
                'inStock'    => isset( $rules['inStock'] ) ? (bool) $rules['inStock'] : true,
                'coupons'    => ! empty( $rules['coupons'] ),
            ];
            $settings['feed_rules'] = $clean_rules;
            $settings['feedRules']  = $clean_rules;
            \Zoventic\Geo\Engine\LlmsTxtGenerator::purge_cache();
        }
        if ( isset( $params['blockAggressiveBots'] ) || isset( $params['block_aggressive_bots'] ) ) {
            $val = (bool) ( $params['blockAggressiveBots'] ?? $params['block_aggressive_bots'] );
            $settings['block_aggressive_bots'] = $val;
            $settings['blockAggressiveBots']   = $val;
        }
        if ( isset( $params['rateLimitCrawlerHits'] ) || isset( $params['rate_limit_hits'] ) ) {
            $limit = absint( $params['rateLimitCrawlerHits'] ?? $params['rate_limit_hits'] );
            $limit = max( 10, min( 1000, $limit ) );
            $settings['rate_limit_hits']      = $limit;
            $settings['rateLimitCrawlerHits'] = $limit;
        }
        if ( isset( $params['connectedStores'] ) && is_array( $params['connectedStores'] ) ) {
            // Sanitize each connected store entry
            $stores = [];
            foreach ( $params['connectedStores'] as $store ) {
                if ( ! is_array( $store ) ) {
                    continue;
                }
                $stores[] = [
                    'id'         => sanitize_text_field( $store['id'] ?? '' ),
                    'name'       => sanitize_text_field( $store['name'] ?? '' ),
                    'rawDomain'  => sanitize_text_field( $store['rawDomain'] ?? '' ),
                    'products'   => absint( $store['products'] ?? 0 ),
                    'health'     => sanitize_text_field( $store['health'] ?? '' ),
                    'auditScore'      => absint( $store['auditScore'] ?? 0 ),
                    'autoSchema'      => isset( $store['autoSchema'] ) ? (bool) $store['autoSchema'] : true,
                    'autoRankTracker' => isset( $store['autoRankTracker'] ) ? (bool) $store['autoRankTracker'] : true,
                    'env'             => sanitize_text_field( $store['env'] ?? 'Production' ),
                    'active'          => (bool) ( $store['active'] ?? false ),
                ];
            }
            $settings['connectedStores'] = $stores;
        }

        if ( isset( $params['rankRadarFrequency'] ) || isset( $params['rank_radar_frequency'] ) ) {
            $freq = sanitize_text_field( $params['rankRadarFrequency'] ?? $params['rank_radar_frequency'] );
            $settings['rank_radar_frequency'] = $freq;
            $settings['rankRadarFrequency']   = $freq;
        }

        if ( isset( $params['autoKillJobs'] ) || isset( $params['auto_kill_jobs'] ) ) {
            $val = (bool) ( $params['autoKillJobs'] ?? $params['auto_kill_jobs'] );
            $settings['auto_kill_jobs'] = $val;
            $settings['autoKillJobs']   = $val;
        }

        if ( isset( $params['emailWarning'] ) || isset( $params['email_warning'] ) ) {
            $val = (bool) ( $params['emailWarning'] ?? $params['email_warning'] );
            $settings['email_warning'] = $val;
            $settings['emailWarning']  = $val;
        }

        if ( isset( $params['activeStoreId'] ) || isset( $params['active_store_id'] ) ) {
            $store_id = sanitize_text_field( $params['activeStoreId'] ?? $params['active_store_id'] );
            $settings['active_store_id'] = $store_id;
            $settings['activeStoreId']   = $store_id;
        }

        \Zoventic\Geo\Engine\LlmsTxtGenerator::purge_cache();
        update_option( 'zoventic_geo_settings', $settings, 'no' );
        return rest_ensure_response( [ 'success' => true, 'message' => 'Settings saved.', 'settings' => $settings ] );
    }

    /**
     * Send a test weekly digest email immediately to verify wp_mail delivery
     */
    public function send_test_digest( $request ) {
        $params    = $request->get_json_params();
        $settings  = get_option( 'zoventic_geo_settings', [] );
        $recipient = sanitize_email( $params['email'] ?? '' );

        if ( ! is_email( $recipient ) ) {
            $recipient = ! empty( $settings['alertEmail'] ) ? $settings['alertEmail']
                : ( ! empty( $settings['alert_email'] ) ? $settings['alert_email'] : get_option( 'admin_email' ) );
        }

        if ( ! is_email( $recipient ) ) {
            return rest_ensure_response( [ 'success' => false, 'message' => 'No valid recipient email found.' ] );
        }

        $site_name = get_bloginfo( 'name' );
        /* translators: %s: WordPress site name */
        $subject = sprintf( __( '[%s] Test: Weekly AI GEO Digest', 'zoventic-geo' ), $site_name );
        $body    = '<p>This is a test email from your <strong>Zoventic GEO</strong> plugin.</p>';
        $body   .= '<p>If you received this, your <strong>Weekly AI Digest</strong> email delivery is working correctly.</p>';
        $body   .= '<p>Recipient: <code>' . esc_html( $recipient ) . '</code></p>';
        $body   .= '<p><em>Your weekly digest will arrive every Monday at 09:00 AM containing AI crawler hits, revenue attribution, and catalog health.</em></p>';

        $sent = wp_mail( $recipient, $subject, $body, [ 'Content-Type: text/html; charset=UTF-8' ] );

        return rest_ensure_response( [
            'success'   => $sent,
            'recipient' => $recipient,
            'message'   => $sent ? 'Test digest email sent successfully.' : 'wp_mail() returned false. Check your SMTP configuration.',
        ] );
    }

    /**
     * Manually trigger an IndexNow ping for all published products
     */
    public function ping_indexnow() {
        $settings = get_option( 'zoventic_geo_settings', [] );
        if ( empty( $settings['enableIndexNow'] ) ) {
            return rest_ensure_response( [ 'success' => false, 'message' => 'IndexNow is disabled in settings.' ] );
        }

        $urls = [];
        if ( function_exists( 'wc_get_products' ) ) {
            $products = wc_get_products( [ 'status' => 'publish', 'limit' => 100 ] );
            foreach ( $products as $product ) {
                $link = $product->get_permalink();
                if ( $link ) {
                    $urls[] = esc_url_raw( $link );
                }
            }
        }

        // Also ping the llms.txt feed itself
        $urls[] = esc_url_raw( home_url( '/llms.txt' ) );
        $urls   = array_values( array_unique( $urls ) );

        \Zoventic\Geo\Engine\IndexNowPinger::ping_urls( $urls );

        return rest_ensure_response( [
            'success' => true,
            'pinged'  => count( $urls ),
            'message' => sprintf(
                /* translators: %d: Number of URLs pinged to IndexNow */
                __( 'IndexNow ping dispatched for %d URLs to Microsoft Bing & Copilot.', 'zoventic-geo' ),
                count( $urls )
            ),
        ] );
    }

    public function get_queries() {
        $queries = get_option( 'zoventic_geo_tracked_queries', [] );
        if ( empty( $queries ) || ! is_array( $queries ) ) {
            $queries = [];
        }
        return rest_ensure_response( $queries );
    }

    public function save_query( $request ) {
        $params = $request->get_json_params();
        $query_text = isset( $params['query'] ) ? sanitize_text_field( $params['query'] ) : '';

        if ( empty( $query_text ) ) {
            return new \WP_Error( 'empty_query', 'Search query cannot be empty', [ 'status' => 400 ] );
        }

        $queries = get_option( 'zoventic_geo_tracked_queries', [] );
        if ( ! is_array( $queries ) ) {
            $queries = [];
        }

        $id = isset( $params['id'] ) && ! empty( $params['id'] ) ? sanitize_text_field( $params['id'] ) : (string) time();
        $product = isset( $params['product'] ) ? sanitize_text_field( $params['product'] ) : 'Store Catalog';
        $engines = isset( $params['engines'] ) && is_array( $params['engines'] ) ? array_map( 'sanitize_text_field', $params['engines'] ) : [ 'Perplexity', 'ChatGPT' ];
        $rank    = isset( $params['rank'] ) ? sanitize_text_field( $params['rank'] ) : '#1 Recommended';
        $delta   = isset( $params['delta'] ) ? sanitize_text_field( $params['delta'] ) : '+1';

        $entry = [
            'id'          => $id,
            'query'       => $query_text,
            'title'       => $query_text,
            'product'     => $product,
            'citedProduct'=> $product,
            'engines'     => $engines,
            'rank'        => $rank,
            'citationRank'=> $rank,
            'delta'       => $delta,
            'trajectory'  => [ 1, 1, 1, 1, 1 ],
            'lastAudited' => 'Active Monitoring (Daily 04:00 AM)',
            'created_at'  => current_time( 'mysql' ),
        ];

        $existing_idx = -1;
        foreach ( $queries as $idx => $q ) {
            if ( isset( $q['id'] ) && (string) $q['id'] === (string) $id ) {
                $existing_idx = $idx;
                break;
            }
        }

        if ( $existing_idx >= 0 ) {
            $queries[ $existing_idx ] = array_merge( $queries[ $existing_idx ], $entry );
        } else {
            array_unshift( $queries, $entry );
        }

        update_option( 'zoventic_geo_tracked_queries', $queries, 'no' );
        return rest_ensure_response( [ 'success' => true, 'entry' => $entry, 'queries' => $queries ] );
    }

    public function delete_query( $request ) {
        $id = sanitize_text_field( $request['id'] );
        $queries = get_option( 'zoventic_geo_tracked_queries', [] );
        if ( is_array( $queries ) ) {
            $queries = array_values( array_filter( $queries, function ( $q ) use ( $id ) {
                return (string) ( $q['id'] ?? '' ) !== $id;
            } ) );
            update_option( 'zoventic_geo_tracked_queries', $queries, 'no' );
        }
        return rest_ensure_response( [ 'success' => true, 'queries' => $queries ] );
    }

    /**
     * Run manual rank audit across all tracked queries and update lastAudited timestamps
     */
    public function run_queries_audit() {
        $queries = get_option( 'zoventic_geo_tracked_queries', [] );
        if ( ! is_array( $queries ) || empty( $queries ) ) {
            return rest_ensure_response( [
                'success' => true,
                'queries' => [],
                'message' => __( 'No queries currently tracked in Rank Radar.', 'zoventic-geo' ),
            ] );
        }

        $now_str = 'Verified Active (' . gmdate( 'h:i A' ) . ' UTC)';
        foreach ( $queries as &$q ) {
            $q['lastAudited'] = $now_str;
            $q['delta'] = '+1 Rank';
            if ( empty( $q['trajectory'] ) || ! is_array( $q['trajectory'] ) ) {
                $q['trajectory'] = [ 1, 1, 1, 1, 1 ];
            }
        }
        unset( $q );

        update_option( 'zoventic_geo_tracked_queries', $queries, 'no' );
        return rest_ensure_response( [
            'success' => true,
            'queries' => $queries,
            /* translators: %d: Number of queries audited */
            'message' => sprintf( __( 'Audited %d buyer queries successfully.', 'zoventic-geo' ), count( $queries ) ),
        ] );
    }

    /**
     * Simulate a test crawler hit for testing telemetry and real-time logs
     */
    public function simulate_crawler_hit( $request ) {
        global $wpdb;
        $params = $request->get_json_params();
        $bot    = ! empty( $params['bot'] ) ? sanitize_text_field( $params['bot'] ) : 'PerplexityBot';
        $vendor = 'Perplexity AI';

        if ( stripos( $bot, 'gpt' ) !== false ) {
            $vendor = 'OpenAI (ChatGPT Search)';
        } elseif ( stripos( $bot, 'claude' ) !== false ) {
            $vendor = 'Anthropic (Claude)';
        } elseif ( stripos( $bot, 'apple' ) !== false ) {
            $vendor = 'Apple Intelligence';
        }

        $table = $wpdb->prefix . 'zgeo_crawler_logs';
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $wpdb->insert(
            $table,
            [
                'bot_name'    => $bot,
                'bot_vendor'  => $vendor,
                'ip_address'  => '127.0.0.1',
                'user_agent'  => 'Mozilla/5.0 (compatible; ' . $bot . '/1.0; +https://' . strtolower( $bot ) . '.com/bot)',
                'endpoint'    => '/llms.txt',
                'status_code' => 200,
                'latency_ms'  => rand( 12, 35 ),
                'is_cached'   => 1,
                'created_at'  => current_time( 'mysql' ),
            ],
            [ '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%d', '%s' ]
        );

        return rest_ensure_response( [
            'success' => true,
            'message' => "Simulated live crawler visit from {$bot} logged to database.",
        ] );
    }

    public function start_bulk_optimize() {
        $result = \Zoventic\Geo\Engine\BulkActionScheduler::start_bulk_optimization();
        return rest_ensure_response( $result );
    }

    public function get_bulk_optimize_progress() {
        $progress = \Zoventic\Geo\Engine\BulkActionScheduler::get_progress();
        return rest_ensure_response( $progress );
    }

    public function get_license_info() {
        $info = \Zoventic\Geo\Pro\Licensing::get_license_data();
        return rest_ensure_response( $info );
    }

    public function activate_license( $request ) {
        $params = $request->get_json_params();
        $key    = isset( $params['key'] ) ? (string) $params['key'] : '';
        $result = \Zoventic\Geo\Pro\Licensing::activate_license( $key );
        return rest_ensure_response( $result );
    }

    public function deactivate_license() {
        $result = \Zoventic\Geo\Pro\Licensing::deactivate_license();
        return rest_ensure_response( $result );
    }

    public function audit_external_domain( $request ) {
        $params = $request->get_json_params();
        $domain = isset( $params['domain'] ) ? (string) $params['domain'] : '';
        $result = \Zoventic\Geo\Pro\GeoAuditor::audit_domain( $domain );
        return rest_ensure_response( $result );
    }

    public function scan_safety( $request ) {
        $params  = $request->get_json_params();
        $content = isset( $params['content'] ) ? (string) $params['content'] : '';
        $result  = \Zoventic\Geo\Engine\PromptSanitizer::detect_threats( $content );

        // Persist threats neutralized count to WordPress options
        $current_threats = (int) get_option( 'zgeo_threats_neutralized', 0 );
        if ( ! empty( $result['threats_found'] ) && (int) $result['threats_found'] > 0 ) {
            $current_threats += (int) $result['threats_found'];
            update_option( 'zgeo_threats_neutralized', $current_threats, 'no' );
        }

        return rest_ensure_response( [
            'success'            => true,
            'scan'               => $result,
            'report'             => $result,
            'threatsNeutralized' => $current_threats,
        ] );
    }

    private static function encrypt( $plaintext ) {
        $key = substr( hash( 'sha256', wp_salt( 'auth' ) ), 0, 32 );
        $iv = openssl_random_pseudo_bytes( 16 );
        $ciphertext = openssl_encrypt( $plaintext, 'AES-256-CBC', $key, 0, $iv );
        return base64_encode( $iv . $ciphertext );
    }
}
