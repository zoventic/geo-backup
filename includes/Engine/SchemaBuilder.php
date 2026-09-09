<?php

namespace Zoventic\Geo\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class SchemaBuilder {
    public static function init() {
        add_filter( 'woocommerce_structured_data_product', [ __CLASS__, 'enhance_product_schema' ], 20, 2 );
    }

    public static function enhance_product_schema( $markup, $product ) {
        if ( ! is_a( $product, 'WC_Product' ) ) {
            return $markup;
        }

        // Sanitize existing schema fields against prompt injections
        if ( isset( $markup['name'] ) ) {
            $markup['name'] = PromptSanitizer::sanitize( $markup['name'] );
        }
        if ( isset( $markup['description'] ) ) {
            $markup['description'] = PromptSanitizer::sanitize( $markup['description'] );
        }

        // Add GEO Enhancements (Semantic Attributes & Knowledge Graph)
        $markup['@id'] = esc_url( $product->get_permalink() ) . '#product';
        
        // Brand entity graph
        if ( ! isset( $markup['brand'] ) ) {
            $markup['brand'] = [
                '@type' => 'Brand',
                'name'  => PromptSanitizer::sanitize( get_bloginfo( 'name' ) ),
            ];
        }

        // Stock availability clarity for AI agents
        if ( isset( $markup['offers'] ) && is_array( $markup['offers'] ) ) {
            $settings = get_option( 'zoventic_geo_settings', [] );
            $seller   = [
                '@type' => 'Organization',
                'name'  => PromptSanitizer::sanitize( get_bloginfo( 'name' ) ),
                'url'   => esc_url( home_url() ),
            ];
            if ( ! empty( $settings['tagline'] ) ) {
                $seller['description'] = PromptSanitizer::sanitize( $settings['tagline'] );
            }

            $markup['offers']['priceValidUntil'] = gmdate( 'Y-12-31' );
            $markup['offers']['seller']          = $seller;
        }

        return $markup;
    }
}
