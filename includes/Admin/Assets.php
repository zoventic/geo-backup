<?php

namespace Zoventic\Geo\Admin;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Assets {
    public static function init() {
        add_action( 'admin_enqueue_scripts', [ __CLASS__, 'enqueue_assets' ] );
        add_filter( 'script_loader_tag', [ __CLASS__, 'add_type_attribute' ], 10, 3 );
    }

    public static function add_type_attribute( $tag, $handle, $src ) {
        if ( 'zgeo-app' === $handle && false === strpos( $tag, 'type="module"' ) ) {
            return str_replace( '<script ', '<script type="module" ', $tag );
        }
        return $tag;
    }

    public static function enqueue_assets( $hook ) {
        // Strict Conditional Loading: Only load on Zoventic GEO admin screens (top-level and submenus)
        if ( false === strpos( $hook, 'page_zoventic-geo' ) ) {
            return;
        }

        // Enqueue Google Fonts (Plus Jakarta Sans & JetBrains Mono)
        wp_enqueue_style(
            'zgeo-fonts',
            'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
            [],
            ZGEO_VERSION
        );

        $dist_dir = ZGEO_PLUGIN_DIR . 'dist/assets/';
        $dist_url = ZGEO_PLUGIN_URL . 'dist/assets/';

        // Dynamically find built JS and CSS chunk files
        if ( file_exists( $dist_dir ) ) {
            $files = scandir( $dist_dir );
            $app_js  = null;
            $app_css = null;

            foreach ( $files as $file ) {
                if ( preg_match( '/^index-.*\.js$/', $file ) ) {
                    $app_js = $file;
                } elseif ( preg_match( '/^index-.*\.css$/', $file ) ) {
                    $app_css = $file;
                }
            }

            if ( $app_css ) {
                $css_ver = file_exists( $dist_dir . $app_css ) ? filemtime( $dist_dir . $app_css ) : ZGEO_VERSION;
                wp_enqueue_style(
                    'zgeo-app-styles',
                    $dist_url . $app_css,
                    [],
                    $css_ver
                );
            }

            if ( $app_js ) {
                $js_ver = file_exists( $dist_dir . $app_js ) ? filemtime( $dist_dir . $app_js ) : ZGEO_VERSION;
                wp_enqueue_script(
                    'zgeo-app',
                    $dist_url . $app_js,
                    [],
                    $js_ver,
                    [
                        'in_footer' => true,
                        'strategy'  => 'defer',
                    ]
                );

                // Pass secure localized configuration
                wp_localize_script( 'zgeo-app', 'zgeoConfig', [
                    'restUrl'      => esc_url_raw( rest_url( 'zoventic-geo/v1/' ) ),
                    'nonce'        => wp_create_nonce( 'wp_rest' ),
                    'siteName'     => get_bloginfo( 'name' ),
                    'siteUrl'      => home_url(),
                    'currency'     => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'USD',
                    'currencySymbol'=> function_exists( 'get_woocommerce_currency_symbol' )
                        ? trim( html_entity_decode( wp_strip_all_tags( get_woocommerce_currency_symbol() ), ENT_QUOTES, 'UTF-8' ) )
                        : '$',
                    'isMultisite'   => is_multisite(),
                    'adminUrl'      => admin_url(),
                ] );
            }
        }
    }
}
