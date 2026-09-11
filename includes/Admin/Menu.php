<?php

namespace Zoventic\Geo\Admin;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Menu {
    public static function init() {
        add_action( 'admin_menu', [ __CLASS__, 'register_menu' ] );
        add_action( 'admin_init', [ __CLASS__, 'redirect_legacy_slugs' ] );
    }

    /**
     * Gracefully redirect legacy menu slugs (?page=zoventic-geo-crawlers) to the SPA hash URL (?page=zoventic-geo#crawlers)
     */
    public static function redirect_legacy_slugs() {
        if ( ! is_admin() || ! isset( $_GET['page'] ) ) {
            return;
        }
        $page = sanitize_key( wp_unslash( $_GET['page'] ) );
        $legacy_map = [
            'zoventic-geo-health'    => 'health',
            'zoventic-geo-radar'     => 'radar',
            'zoventic-geo-crawlers'  => 'crawlers',
            'zoventic-geo-llms'      => 'llms',
            'zoventic-geo-simulator' => 'simulator',
            'zoventic-geo-settings'  => 'settings',
        ];

        if ( isset( $legacy_map[ $page ] ) ) {
            wp_safe_redirect( admin_url( 'admin.php?page=zoventic-geo#' . $legacy_map[ $page ] ) );
            exit;
        }
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

        // 1. Overview (Default submenu link)
        add_submenu_page(
            'zoventic-geo',
            __( 'Overview – Zoventic GEO', 'zoventic-geo' ),
            __( 'Overview', 'zoventic-geo' ),
            'manage_woocommerce',
            'zoventic-geo',
            [ __CLASS__, 'render_app' ]
        );

        // 2. Rank Tracker (SPA Tab #radar)
        add_submenu_page(
            'zoventic-geo',
            __( 'Rank Tracker – Zoventic GEO', 'zoventic-geo' ),
            __( 'Rank Tracker', 'zoventic-geo' ),
            'manage_woocommerce',
            'admin.php?page=zoventic-geo#radar',
            ''
        );

        // 3. GEO Health (SPA Tab #health)
        add_submenu_page(
            'zoventic-geo',
            __( 'GEO Health – Zoventic GEO', 'zoventic-geo' ),
            __( 'GEO Health', 'zoventic-geo' ),
            'manage_woocommerce',
            'admin.php?page=zoventic-geo#health',
            ''
        );

        // 4. Crawler Logs (SPA Tab #crawlers)
        add_submenu_page(
            'zoventic-geo',
            __( 'Crawler Logs – Zoventic GEO', 'zoventic-geo' ),
            __( 'Crawler Logs', 'zoventic-geo' ),
            'manage_woocommerce',
            'admin.php?page=zoventic-geo#crawlers',
            ''
        );

        // 5. Search Test (SPA Tab #simulator)
        add_submenu_page(
            'zoventic-geo',
            __( 'Search Test – Zoventic GEO', 'zoventic-geo' ),
            __( 'Search Test', 'zoventic-geo' ),
            'manage_woocommerce',
            'admin.php?page=zoventic-geo#simulator',
            ''
        );

        // 6. llms.txt Feed (SPA Tab #llms)
        add_submenu_page(
            'zoventic-geo',
            __( 'llms.txt Feed – Zoventic GEO', 'zoventic-geo' ),
            __( 'llms.txt Feed', 'zoventic-geo' ),
            'manage_woocommerce',
            'admin.php?page=zoventic-geo#llms',
            ''
        );

        // 7. Settings (SPA Tab #settings)
        add_submenu_page(
            'zoventic-geo',
            __( 'Settings – Zoventic GEO', 'zoventic-geo' ),
            __( 'Settings', 'zoventic-geo' ),
            'manage_woocommerce',
            'admin.php?page=zoventic-geo#settings',
            ''
        );
    }

    public static function render_app() {
        // Strict permission check
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'zoventic-geo' ) );
        }

        // Mount point for React 19 + Ant Design application with instant pre-mount skeleton loader
        ?>
        <div id="zgeo-root" class="zgeo-admin-container">
            <style>
                @keyframes zgeoPrePulse {
                    0%, 100% { opacity: 0.95; }
                    50% { opacity: 0.45; }
                }
                .zgeo-pre-skeleton {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    padding: 24px;
                    max-width: 1360px;
                    margin: 0 auto;
                    box-sizing: border-box;
                }
                .zgeo-pre-bar {
                    background: #e2e8f0;
                    border-radius: 8px;
                    animation: zgeoPrePulse 1.6s ease-in-out infinite;
                }
                .zgeo-pre-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    margin-bottom: 20px;
                }
                .zgeo-pre-nav {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                    overflow: hidden;
                }
                .zgeo-pre-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .zgeo-pre-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 20px;
                }
                .zgeo-pre-table-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
            </style>
            <div class="zgeo-pre-skeleton">
                <!-- Top Brand Header Skeleton -->
                <div class="zgeo-pre-header">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="zgeo-pre-bar" style="width: 36px; height: 36px; border-radius: 10px;"></div>
                        <div>
                            <div class="zgeo-pre-bar" style="width: 140px; height: 18px; margin-bottom: 6px;"></div>
                            <div class="zgeo-pre-bar" style="width: 220px; height: 12px;"></div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <div class="zgeo-pre-bar" style="width: 90px; height: 32px; border-radius: 8px;"></div>
                        <div class="zgeo-pre-bar" style="width: 110px; height: 32px; border-radius: 8px;"></div>
                    </div>
                </div>

                <!-- Navigation Tabs Skeleton -->
                <div class="zgeo-pre-nav">
                    <div class="zgeo-pre-bar" style="width: 110px; height: 38px; border-radius: 20px;"></div>
                    <div class="zgeo-pre-bar" style="width: 120px; height: 38px; border-radius: 20px;"></div>
                    <div class="zgeo-pre-bar" style="width: 110px; height: 38px; border-radius: 20px;"></div>
                    <div class="zgeo-pre-bar" style="width: 115px; height: 38px; border-radius: 20px;"></div>
                    <div class="zgeo-pre-bar" style="width: 105px; height: 38px; border-radius: 20px;"></div>
                    <div class="zgeo-pre-bar" style="width: 120px; height: 38px; border-radius: 20px;"></div>
                    <div class="zgeo-pre-bar" style="width: 95px; height: 38px; border-radius: 20px;"></div>
                </div>

                <!-- 4 KPI Cards Skeleton -->
                <div class="zgeo-pre-grid">
                    <?php for ( $i = 0; $i < 4; $i++ ) : ?>
                    <div class="zgeo-pre-card">
                        <div class="zgeo-pre-bar" style="width: 100px; height: 14px; margin-bottom: 12px;"></div>
                        <div class="zgeo-pre-bar" style="width: 70px; height: 28px; margin-bottom: 10px;"></div>
                        <div class="zgeo-pre-bar" style="width: 130px; height: 12px;"></div>
                    </div>
                    <?php endfor; ?>
                </div>

                <!-- Main Content Placeholder Card -->
                <div class="zgeo-pre-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
                        <div class="zgeo-pre-bar" style="width: 180px; height: 20px;"></div>
                        <div class="zgeo-pre-bar" style="width: 120px; height: 32px; border-radius: 8px;"></div>
                    </div>
                    <?php for ( $i = 0; $i < 4; $i++ ) : ?>
                    <div class="zgeo-pre-table-row">
                        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                            <div class="zgeo-pre-bar" style="width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0;"></div>
                            <div style="flex: 1;">
                                <div class="zgeo-pre-bar" style="width: 45%; height: 14px; margin-bottom: 6px;"></div>
                                <div class="zgeo-pre-bar" style="width: 25%; height: 11px;"></div>
                            </div>
                        </div>
                        <div class="zgeo-pre-bar" style="width: 60px; height: 22px; border-radius: 12px;"></div>
                        <div class="zgeo-pre-bar" style="width: 80px; height: 30px; border-radius: 6px; margin-left: 16px;"></div>
                    </div>
                    <?php endfor; ?>
                </div>
            </div>
        </div>
        <?php
    }
}
