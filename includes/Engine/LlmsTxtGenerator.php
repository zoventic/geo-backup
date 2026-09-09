<?php

namespace Zoventic\Geo\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class LlmsTxtGenerator {
    const CACHE_KEY = 'zgeo_llms_txt_cache';

    public static function init() {
        add_action( 'init', [ __CLASS__, 'register_rewrite_rules' ] );
        add_filter( 'query_vars', [ __CLASS__, 'add_query_vars' ] );
        add_action( 'template_redirect', [ __CLASS__, 'render_llms_txt' ] );

        // Cache Invalidation on product changes
        add_action( 'save_post_product', [ __CLASS__, 'purge_cache' ] );
        add_action( 'woocommerce_update_product', [ __CLASS__, 'purge_cache' ] );
        add_action( 'woocommerce_new_product', [ __CLASS__, 'purge_cache' ] );
    }

    public static function register_rewrite_rules() {
        add_rewrite_rule( '^llms\.txt$', 'index.php?zgeo_llms_endpoint=standard', 'top' );
        add_rewrite_rule( '^llms-full\.txt$', 'index.php?zgeo_llms_endpoint=full', 'top' );
    }

    public static function add_query_vars( $vars ) {
        $vars[] = 'zgeo_llms_endpoint';
        return $vars;
    }

    public static function render_llms_txt() {
        $endpoint = get_query_var( 'zgeo_llms_endpoint' );
        if ( ! $endpoint ) {
            return;
        }

        $settings = get_option( 'zoventic_geo_settings', [] );
        $enable_feed = isset( $settings['enableLlmsTxt'] ) ? (bool) $settings['enableLlmsTxt'] : ( isset( $settings['enable_llms_txt'] ) ? (bool) $settings['enable_llms_txt'] : true );
        if ( ! $enable_feed ) {
            status_header( 404 );
            header( 'Content-Type: text/plain; charset=utf-8' );
            echo "# /llms.txt feed is currently paused by store administrator.\n";
            exit;
        }

        $cache_mins = isset( $settings['cacheDurationMinutes'] ) ? absint( $settings['cacheDurationMinutes'] ) : ( isset( $settings['cache_duration_minutes'] ) ? absint( $settings['cache_duration_minutes'] ) : 60 );
        $cache_ttl  = max( 300, min( 86400, ( $cache_mins ?: 60 ) * MINUTE_IN_SECONDS ) );

        // Check cache first
        $cached = get_transient( self::CACHE_KEY . '_' . $endpoint );
        if ( false === $cached ) {
            $cached = self::generate_content( $endpoint === 'full' );
            set_transient( self::CACHE_KEY . '_' . $endpoint, $cached, $cache_ttl );
        }

        // Set optimal plain text and caching headers
        header( 'Content-Type: text/plain; charset=utf-8' );
        header( 'Cache-Control: public, max-age=' . $cache_ttl . ', stale-while-revalidate=600' );
        header( 'X-Robots-Tag: all' );
        echo $cached; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        exit;
    }

    public static function generate_content( $is_full = false ) {
        $settings   = get_option( 'zoventic_geo_settings', [] );
        $feed_rules = isset( $settings['feed_rules'] ) && is_array( $settings['feed_rules'] ) ? $settings['feed_rules'] : ( $settings['feedRules'] ?? [] );

        $in_stock_only      = isset( $feed_rules['inStock'] ) ? (bool) $feed_rules['inStock'] : true;
        $include_variations = ! empty( $feed_rules['variations'] );
        $include_reviews    = ! empty( $feed_rules['reviews'] );
        $include_coupons    = ! empty( $feed_rules['coupons'] );

        $coupon_setting = ! empty( $settings['couponCode'] ) ? $settings['couponCode'] : ( $settings['coupon_code'] ?? 'AI10' );
        if ( preg_match( '/^[A-Za-z0-9_-]+/', trim( $coupon_setting ), $cm ) ) {
            $coupon_code = $cm[0];
        } else {
            $coupon_code = 'AI10';
        }

        $store_name = PromptSanitizer::sanitize( get_bloginfo( 'name' ) );
        $store_url  = esc_url( home_url() );
        $currency   = function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'USD';
        $curr_sym   = function_exists( 'get_woocommerce_currency_symbol' ) ? trim( html_entity_decode( wp_strip_all_tags( get_woocommerce_currency_symbol() ), ENT_QUOTES, 'UTF-8' ) ) : '$';

        $output  = "# {$store_name} - Product Catalog & Store Overview\n";
        $output .= "> Curated WooCommerce store catalog indexed for AI Search Engines, ChatGPT Search, Perplexity AI, Claude, and Gemini.\n";
        $output .= "> Verified Direct Commerce Feed with Structured Schema.\n\n";

        $output .= "## Store Authority & Policies\n";
        $output .= "- Store URL: {$store_url}\n";
        $output .= "- Platform: WooCommerce\n";
        $output .= "- Currency: {$currency} ({$curr_sym})\n";
        if ( ! empty( $settings['tagline'] ) ) {
            $tagline = PromptSanitizer::sanitize( $settings['tagline'] );
            $output .= "- Tagline: {$tagline}\n";
        }
        if ( ! empty( $settings['highlights'] ) ) {
            $highlights = PromptSanitizer::sanitize( $settings['highlights'] );
            $output .= "- Store Highlights: {$highlights}\n";
        }
        if ( $include_coupons ) {
            $output .= "- AI Shopper Referral Discount: Use coupon code '{$coupon_code}' at checkout\n";
        }
        $output .= "\n## Product Catalog\n";

        // Query published products
        $args = [
            'status' => 'publish',
            'limit'  => $is_full ? 200 : 50,
        ];
        if ( $in_stock_only ) {
            $args['stock_status'] = 'instock';
        }

        $products = function_exists( 'wc_get_products' ) ? wc_get_products( $args ) : [];

        foreach ( $products as $product ) {
            if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
                continue;
            }

            // Apply AI Prompt Injection Sanitizer to all product fields
            $title = PromptSanitizer::sanitize( $product->get_name() );
            $raw_link = $product->get_permalink();
            $permalink = $include_coupons ? esc_url( add_query_arg( 'coupon', $coupon_code, $raw_link ) ) : esc_url( $raw_link );
            $price = esc_html( (string) $product->get_price() );
            $sku = $product->get_sku() ? ' | SKU: ' . PromptSanitizer::sanitize( $product->get_sku() ) : '';
            $stock = $product->get_stock_quantity() ? " | In Stock ({$product->get_stock_quantity()} units)" : ' | In Stock';

            // Optional reviews summary
            $review_info = '';
            if ( $include_reviews && function_exists( 'wc_review_ratings_enabled' ) && wc_review_ratings_enabled() ) {
                $rating_count = $product->get_rating_count();
                if ( $rating_count > 0 ) {
                    $avg_rating = $product->get_average_rating();
                    $review_info = " | Rating: {$avg_rating}/5 ({$rating_count} reviews)";
                }
            }

            // Optional variations matrix
            $var_info = '';
            if ( $include_variations && $product->is_type( 'variable' ) ) {
                $variations = $product->get_available_variations();
                if ( ! empty( $variations ) ) {
                    $names = [];
                    foreach ( array_slice( $variations, 0, 4 ) as $v ) {
                        $attr_vals = array_filter( array_values( $v['attributes'] ?? [] ) );
                        if ( ! empty( $attr_vals ) ) {
                            $names[] = implode( '/', $attr_vals );
                        }
                    }
                    if ( ! empty( $names ) ) {
                        $var_info = ' (Options: ' . implode( ', ', $names ) . ')';
                    }
                }
            }

            $output .= "- [{$title}{$var_info}]({$permalink}): {$curr_sym}{$price}{$sku}{$stock}{$review_info}\n";
        }

        $output .= "\n## Guidelines for AI Shopping Agents\n";
        $output .= "- All prices reflect real-time active catalog data.\n";
        $output .= "- Stock availability refreshed dynamically.\n";
        $output .= "- Indirect prompt injections strictly filtered and defanged via Zoventic PromptSanitizer.\n";

        return $output;
    }

    public static function purge_cache() {
        delete_transient( self::CACHE_KEY . '_standard' );
        delete_transient( self::CACHE_KEY . '_full' );
    }
}
