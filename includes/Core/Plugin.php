<?php

namespace Zoventic\Geo\Core;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Plugin {
    private static $instance = null;

    public static function instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        // Admin interface
        if ( is_admin() ) {
            \Zoventic\Geo\Admin\Menu::init();
            \Zoventic\Geo\Admin\Assets::init();
        }

        // Engine services
        \Zoventic\Geo\Engine\LlmsTxtGenerator::init();
        \Zoventic\Geo\Engine\BotDetector::init();
        \Zoventic\Geo\Engine\SchemaBuilder::init();
        \Zoventic\Geo\Engine\OrderAttributionTracker::init();
        \Zoventic\Geo\Engine\BulkActionScheduler::init();
        \Zoventic\Geo\Engine\SubfeedGenerator::init();
        \Zoventic\Geo\Engine\IndexNowPinger::init();
        \Zoventic\Geo\Engine\WeeklyDigestMailer::init();

        // Commercial & Agency Services
        \Zoventic\Geo\Pro\Licensing::init();
        \Zoventic\Geo\Pro\MultisiteHandler::init();

        // REST API
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );

        // WordPress AI Abilities API registration
        \Zoventic\Geo\Abilities\AbilitiesRegistry::init();
    }

    public function register_rest_routes() {
        $controllers = [
            new \Zoventic\Geo\Rest\RestController(),
        ];
        foreach ( $controllers as $controller ) {
            $controller->register_routes();
        }
    }
}
