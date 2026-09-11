<?php

namespace Zoventic\Geo\Admin;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Menu {
    public static function init() {
        add_action( 'admin_menu', [ __CLASS__, 'register_menu' ] );
    }

    public static function register_menu() {
        add_menu_page(
            __( 'Zoventic GEO – AI Search Optimization', 'zoventic-geo' ),
            __( 'Zoventic GEO', 'zoventic-geo' ),
            'manage_woocommerce',
            'zoventic-geo',
            [ __CLASS__, 'render_app' ],
            'dashicons-compass',
            56
        );
    }

    public static function render_app() {
        // Strict permission check
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'zoventic-geo' ) );
        }

        // Mount point for React 19 + Ant Design application
        echo '<div id="zgeo-root" class="zgeo-admin-container notranslate" translate="no"></div>';
    }
}
