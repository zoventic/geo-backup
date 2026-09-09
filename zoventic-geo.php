<?php
/**
 * Plugin Name:       Zoventic GEO – AI Search Optimization & llms.txt for WooCommerce
 * Plugin URI:        https://zoventic.com/products/geo
 * Description:       Enterprise Generative Engine Optimization (GEO) & AI Search Visibility Suite for WooCommerce. Optimizes your catalog for ChatGPT, Perplexity, Claude, and Gemini with automated /llms.txt, structured JSON-LD entity graphs, and live crawler telemetry.
 * Version:           1.0.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Zoventic
 * Author URI:        https://zoventic.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       zoventic-geo
 * Domain Path:       /languages
 * WC requires at least: 7.0
 * WC tested up to:   9.5
 */

// Strict direct execution gate
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define plugin constants
define( 'ZGEO_VERSION', '1.0.0' );
define( 'ZGEO_PLUGIN_FILE', __FILE__ );
define( 'ZGEO_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'ZGEO_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'ZGEO_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Autoloader for Zoventic GEO (PSR-4 compliant)
 */
spl_autoload_register( function ( $class ) {
    $prefix = 'Zoventic\\Geo\\';
    $base_dir = ZGEO_PLUGIN_DIR . 'includes/';

    $len = strlen( $prefix );
    if ( strncmp( $prefix, $class, $len ) !== 0 ) {
        return;
    }

    $relative_class = substr( $class, $len );
    $file = $base_dir . str_replace( '\\', '/', $relative_class ) . '.php';

    if ( file_exists( $file ) ) {
        require_once $file;
    }
} );

/**
 * Activation & Deactivation hooks
 */
register_activation_hook( __FILE__, function () {
    \Zoventic\Geo\Core\Activator::activate();
} );

register_deactivation_hook( __FILE__, function () {
    \Zoventic\Geo\Core\Activator::deactivate();
} );

/**
 * Initialize Plugin when WooCommerce is loaded
 */
add_action( 'plugins_loaded', function () {
    // Check if WooCommerce is active
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', function () {
            echo '<div class="notice notice-error"><p>' .
                esc_html__( 'Zoventic GEO requires WooCommerce to be installed and active.', 'zoventic-geo' ) .
                '</p></div>';
        } );
        return;
    }

    // Bootstrap singleton plugin core
    \Zoventic\Geo\Core\Plugin::instance()->init();
} );
