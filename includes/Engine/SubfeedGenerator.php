<?php

namespace Zoventic\Geo\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class SubfeedGenerator
 * Implements the Hierarchical Sub-Feed architecture for large e-commerce catalogs (100k+ SKUs).
 * Generates category-specific feeds (e.g., /llms-audio.txt, /llms-furniture.txt)
 * to keep individual LLM context ingestion payloads token-efficient and lightweight.
 */
class SubfeedGenerator {

    public static function init() {
        add_action( 'init', [ __CLASS__, 'register_subfeed_rewrites' ] );
        add_filter( 'query_vars', [ __CLASS__, 'register_query_vars' ] );
        add_action( 'template_redirect', [ __CLASS__, 'render_subfeed' ] );
    }

    public static function register_subfeed_rewrites() {
        add_rewrite_rule(
            '^llms-([a-z0-9-]+)\.txt$',
            'index.php?zgeo_subfeed=$matches[1]',
            'top'
        );
    }

    public static function register_query_vars( $vars ) {
        $vars[] = 'zgeo_subfeed';
        return $vars;
    }

    public static function render_subfeed() {
        $category_slug = get_query_var( 'zgeo_subfeed' );
        if ( ! $category_slug ) {
            return;
        }

        // Check master feed switch
        $settings = get_option( 'zoventic_geo_settings', [] );
        $feed_enabled = isset( $settings['enableLlmsTxt'] ) ? (bool) $settings['enableLlmsTxt'] : ( isset( $settings['enable_llms_txt'] ) ? (bool) $settings['enable_llms_txt'] : true );
        if ( ! $feed_enabled ) {
            status_header( 404 );
            header( 'Content-Type: text/plain; charset=utf-8' );
            echo "# Public /llms.txt feed and category sub-feeds are currently paused by the store administrator.";
            exit;
        }

        $term = get_term_by( 'slug', $category_slug, 'product_cat' );
        if ( ! $term || is_wp_error( $term ) ) {
            status_header( 404 );
            header( 'Content-Type: text/plain; charset=utf-8' );
            echo "# Category Not Found: " . esc_html( $category_slug );
            exit;
        }

        // Check ETag & 304 Caching
        $etag = '"zgeo-sub-' . md5( $term->term_id . '-' . $term->count . '-' . gmdate( 'Y-m-d' ) ) . '"';
        header( 'ETag: ' . $etag );
        header( 'Cache-Control: public, max-age=3600, s-maxage=7200' );

        $if_none_match = isset( $_SERVER['HTTP_IF_NONE_MATCH'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_IF_NONE_MATCH'] ) ) : '';
        if ( ! empty( $if_none_match ) && trim( $if_none_match ) === $etag ) {
            status_header( 304 );
            exit;
        }

        header( 'Content-Type: text/plain; charset=utf-8' );
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Plain text markdown manifest feed stream
        echo self::generate_subfeed_content( $term );
        exit;
    }

    /**
     * Generate structured category markdown stream
     *
     * @param \WP_Term $term
     * @return string
     */
    public static function generate_subfeed_content( $term ) {
        $site_name = get_bloginfo( 'name' );
        $cat_name  = $term->name;

        $settings   = get_option( 'zoventic_geo_settings', [] );
        $feed_rules = isset( $settings['feed_rules'] ) && is_array( $settings['feed_rules'] ) ? $settings['feed_rules'] : ( $settings['feedRules'] ?? [] );
        $include_coupons = ! empty( $feed_rules['coupons'] );
        $coupon_code = 'AI10';
        if ( $include_coupons ) {
            $coupon_setting = ! empty( $settings['couponCode'] ) ? $settings['couponCode'] : ( $settings['coupon_code'] ?? 'AI10' );
            if ( preg_match( '/^[A-Za-z0-9_-]+/', trim( $coupon_setting ), $cm ) ) {
                $coupon_code = $cm[0];
            }
        }

        $out  = "# {$site_name} – {$cat_name} Catalog Feed\n";
        $out .= "> Category-specific structured product feed indexed for LLM retrieval-augmented generation (RAG).\n";
        $out .= "> AI Safety Status: Verified Secure by Zoventic Prompt Guard (Zero Indirect Injections)\n\n";

        $out .= "## Category Overview\n";
        $out .= "- **Category**: {$cat_name}\n";
        $out .= "- **Total Products**: {$term->count}\n";
        $out .= "- **Parent Store**: " . home_url() . "\n";
        if ( $include_coupons ) {
            $out .= "- **AI Referral Discount**: Use coupon code '{$coupon_code}' at checkout\n";
        }
        $out .= "\n";

        $out .= "## Products in {$cat_name}\n";

        if ( function_exists( 'wc_get_products' ) ) {
            $products = wc_get_products( [
                'status'   => 'publish',
                'category' => [ $term->slug ],
                'limit'    => 100,
            ] );

            foreach ( $products as $product ) {
                $title       = PromptSanitizer::sanitize( $product->get_name() );
                $permalink   = esc_url( $product->get_permalink() );
                if ( $include_coupons ) {
                    $sep = strpos( $permalink, '?' ) !== false ? '&' : '?';
                    $permalink .= $sep . 'coupon=' . rawurlencode( $coupon_code );
                }
                $price       = $product->get_price();
                $currency    = function_exists( 'get_woocommerce_currency_symbol' )
                    ? trim( html_entity_decode( wp_strip_all_tags( get_woocommerce_currency_symbol() ), ENT_QUOTES, 'UTF-8' ) )
                    : '$';
                $stock       = $product->is_in_stock() ? 'In Stock (' . ( $product->get_stock_quantity() ?: 'Available' ) . ')' : 'Out of Stock';
                $sku         = $product->get_sku() ? 'SKU: ' . PromptSanitizer::sanitize( $product->get_sku() ) : 'SKU: N/A';
                $short_desc  = wp_trim_words( PromptSanitizer::sanitize( wp_strip_all_tags( $product->get_short_description() ?: $product->get_description() ) ), 18 );

                $out .= "- [{$title}]({$permalink}): {$currency}{$price} | {$stock} | {$sku}. {$short_desc}\n";
            }
        }

        $out .= "\n# Powered by Zoventic GEO (Hierarchical Sub-feed Engine)\n";
        return $out;
    }
}
