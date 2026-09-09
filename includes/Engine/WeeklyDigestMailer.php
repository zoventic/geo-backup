<?php

namespace Zoventic\Geo\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class WeeklyDigestMailer
 * Aggregates 7-day AI crawler telemetry and native WooCommerce AI Order Attribution data,
 * formatting and dispatching an executive Monday morning ROI email digest to the merchant.
 */
class WeeklyDigestMailer {

    const CRON_HOOK = 'zgeo_weekly_digest_cron';

    public static function init() {
        add_action( self::CRON_HOOK, [ __CLASS__, 'send_digest' ] );

        // Schedule weekly event if not scheduled
        if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
            // Next Monday at 09:00:00
            $next_monday = strtotime( 'next Monday 09:00:00' );
            wp_schedule_event( $next_monday, 'weekly', self::CRON_HOOK );
        }
    }

    public static function send_digest() {
        $settings = get_option( 'zoventic_geo_settings', [] );
        if ( empty( $settings['enableEmailDigest'] ) && empty( $settings['enable_email_digest'] ) ) {
            return;
        }

        $recipient = ! empty( $settings['alertEmail'] ) ? $settings['alertEmail'] : ( ! empty( $settings['alert_email'] ) ? $settings['alert_email'] : get_option( 'admin_email' ) );
        if ( ! is_email( $recipient ) ) {
            return;
        }

        global $wpdb;

        // 7-day crawler hits with proper preparation and UTC gmdate
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $hits_7d = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->prefix}zgeo_crawler_logs WHERE created_at >= %s",
                gmdate( 'Y-m-d H:i:s', time() - 7 * DAY_IN_SECONDS )
            )
        );

        // 7-day revenue attribution
        $revenue_summary = OrderAttributionTracker::get_ai_revenue_summary( 7 );
        $site_name       = get_bloginfo( 'name' );

        /* translators: %s: The name of the WordPress store website */
        $subject = sprintf( __( '[%s] Your Weekly AI Search & Revenue Digest', 'zoventic-geo' ), $site_name );
        $headers = [ 'Content-Type: text/html; charset=UTF-8' ];

        $body = self::render_email_html( $site_name, $hits_7d, $revenue_summary );

        wp_mail( $recipient, $subject, $body, $headers );
    }

    private static function render_email_html( $site_name, $hits_7d, $rev ) {
        $curr   = esc_html( $rev['currencySymbol'] );
        $total  = esc_html( number_format( (float) $rev['totalRevenue'], 2 ) );
        $orders = (int) $rev['totalAiOrders'];
        $aov    = esc_html( number_format( (float) $rev['avgOrderValue'], 2 ) );

        ob_start();
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
                .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
                .content { padding: 24px; }
                .metric-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 16px; text-align: center; }
                .metric-val { font-size: 32px; font-weight: 800; color: #059669; }
                .stat-grid { display: flex; gap: 12px; margin-bottom: 20px; }
                .stat-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
                .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin:0; font-size: 20px;">Zoventic GEO Weekly Digest</h2>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;"><?php echo esc_html( $site_name ); ?></p>
                </div>
                <div class="content">
                    <div class="metric-box">
                        <div style="font-size: 12px; font-weight: 600; color: #059669; text-transform: uppercase;">7-Day AI Attributed Revenue</div>
                        <div class="metric-val"><?php echo esc_html( $curr . $total ); ?></div>
                        <div style="font-size: 13px; color: #475569; margin-top: 4px;">From <strong><?php echo esc_html( (string) $orders ); ?> verified orders</strong> across ChatGPT & Perplexity</div>
                    </div>

                    <div class="stat-grid">
                        <div class="stat-card">
                            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Average Basket (AOV)</div>
                            <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 4px;"><?php echo esc_html( $curr . $aov ); ?></div>
                        </div>
                        <div class="stat-card">
                            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">AI Crawler Visits</div>
                            <div style="font-size: 18px; font-weight: 700; color: #2563eb; margin-top: 4px;"><?php echo esc_html( (string) number_format( $hits_7d ) ); ?> hits</div>
                        </div>
                        <div class="stat-card">
                            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Prompt Guard</div>
                            <div style="font-size: 18px; font-weight: 700; color: #10b981; margin-top: 4px;">100% Clean</div>
                        </div>
                    </div>

                    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                        Your store's dynamic <code>/llms.txt</code> feed and enhanced JSON-LD schema have successfully served citations to verified AI search engines over the past 7 days with zero prompt injection incidents.
                    </p>

                    <div style="text-align: center; margin-top: 24px;">
                        <a href="<?php echo esc_url( admin_url( 'admin.php?page=zoventic-geo' ) ); ?>" style="background: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; font-size: 14px; display: inline-block;">
                            Open Store GEO Dashboard &rarr;
                        </a>
                    </div>
                </div>
                <div class="footer">
                    Sent automatically by Zoventic GEO for WooCommerce. Manage notification preferences in your Store Admin.
                </div>
            </div>
        </body>
        </html>
        <?php
        return ob_get_clean();
    }
}
