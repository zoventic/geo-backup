<?php

namespace Zoventic\Geo\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class OrderAttributionTracker
 * Integrates natively with WooCommerce 8.5+ Order Attribution engine (_wc_order_attribution_*)
 * to detect, isolate, and aggregate revenue generated from AI Search Engine citations and referrals.
 */
class OrderAttributionTracker {

    /**
     * Known AI Search Engine fingerprints (UTM sources, referrers, and user agents)
     */
    const AI_ENGINES = [
        'ChatGPT' => [
            'sources'   => [ 'chatgpt', 'openai', 'chat.openai.com', 'chatgpt.com' ],
            'referrers' => [ 'chatgpt.com', 'openai.com', 'android-app://com.openai.chatgpt' ],
            'color'     => '#10a37f',
        ],
        'Perplexity' => [
            'sources'   => [ 'perplexity', 'perplexity.ai' ],
            'referrers' => [ 'perplexity.ai', 'www.perplexity.ai' ],
            'color'     => '#20b2aa',
        ],
        'Claude' => [
            'sources'   => [ 'claude', 'anthropic', 'claude.ai' ],
            'referrers' => [ 'claude.ai', 'anthropic.com' ],
            'color'     => '#d97706',
        ],
        'Copilot' => [
            'sources'   => [ 'copilot', 'bing_chat', 'sydney' ],
            'referrers' => [ 'copilot.microsoft.com', 'edgeservices.bing.com' ],
            'color'     => '#0284c7',
        ],
        'Gemini' => [
            'sources'   => [ 'gemini', 'bard', 'google_gemini' ],
            'referrers' => [ 'gemini.google.com', 'bard.google.com' ],
            'color'     => '#8b5cf6',
        ],
        'Generic GEO' => [
            'sources'   => [ 'ai_search', 'zoventic_geo', 'llms_txt' ],
            'referrers' => [],
            'color'     => '#06b6d4',
        ],
    ];

    public static function init() {
        // Hooks into WooCommerce Order Attribution if custom meta injection is required
        add_filter( 'woocommerce_order_attribution_tracking_fields', [ __CLASS__, 'filter_tracking_fields' ] );
    }

    /**
     * Ensure custom GEO campaign markers are preserved in Order Attribution
     */
    public static function filter_tracking_fields( $fields ) {
        return $fields;
    }

    /**
     * Retrieve AI-Attributed Revenue Summary for the given timeframe (days)
     * Compatible with both High-Performance Order Storage (HPOS) and legacy postmeta.
     *
     * @param int $days Number of days to audit (default: 30)
     * @return array
     */
    public static function get_ai_revenue_summary( $days = 30 ) {
        if ( ! function_exists( 'wc_get_orders' ) ) {
            return [
                'isLive'          => false,
                'timeframeDays'   => $days,
                'totalRevenue'    => 0.0,
                'totalAiOrders'   => 0,
                'avgOrderValue'   => 0.0,
                'currencySymbol'  => '$',
                'engineBreakdown' => [],
                'recentOrders'    => [],
            ];
        }

        $date_after = gmdate( 'Y-m-d H:i:s', time() - ( (int) $days * DAY_IN_SECONDS ) );

        $orders = wc_get_orders( [
            'limit'        => 200,
            'date_created' => '>=' . $date_after,
            'status'       => [ 'wc-completed', 'wc-processing' ],
        ] );

        $total_revenue   = 0.0;
        $total_ai_orders = 0;
        $engine_stats    = [];
        $recent_orders   = [];

        foreach ( self::AI_ENGINES as $engine_name => $config ) {
            $engine_stats[ $engine_name ] = [
                'name'         => $engine_name,
                'orders'       => 0,
                'revenue'      => 0.0,
                'color'        => $config['color'],
                'sharePercent' => 0,
            ];
        }

        if ( ! empty( $orders ) ) {
            foreach ( $orders as $order ) {
                $matched_engine = self::detect_ai_engine( $order );

                if ( $matched_engine ) {
                    $order_total = (float) $order->get_total();
                    $total_revenue   += $order_total;
                    $total_ai_orders++;

                    $engine_stats[ $matched_engine ]['orders']++;
                    $engine_stats[ $matched_engine ]['revenue'] += $order_total;

                    if ( count( $recent_orders ) < 8 ) {
                        $recent_orders[] = [
                            'id'           => $order->get_id(),
                            'orderNumber'  => '#' . $order->get_order_number(),
                            'date'         => $order->get_date_created() ? $order->get_date_created()->date_i18n( 'M j, Y' ) : '',
                            'total'        => $order_total,
                            'currency'     => $order->get_currency(),
                            'engine'       => $matched_engine,
                            'engineColor'  => self::AI_ENGINES[ $matched_engine ]['color'],
                            'itemsCount'   => $order->get_item_count(),
                            'status'       => $order->get_status(),
                        ];
                    }
                }
            }
        }

        if ( $total_ai_orders === 0 ) {
            $currency_symbol = function_exists( 'get_woocommerce_currency_symbol' )
                ? trim( html_entity_decode( wp_strip_all_tags( get_woocommerce_currency_symbol() ), ENT_QUOTES, 'UTF-8' ) )
                : '$';
            return [
                'isLive'          => true,
                'timeframeDays'   => $days,
                'totalRevenue'    => 0.0,
                'totalAiOrders'   => 0,
                'avgOrderValue'   => 0.0,
                'currencySymbol'  => $currency_symbol,
                'engineBreakdown' => [],
                'recentOrders'    => [],
            ];
        }

        // Calculate share percentages
        foreach ( $engine_stats as $key => &$stat ) {
            if ( $total_revenue > 0 ) {
                $stat['sharePercent'] = round( ( $stat['revenue'] / $total_revenue ) * 100, 1 );
            }
        }

        $avg_order_value = $total_ai_orders > 0 ? round( $total_revenue / $total_ai_orders, 2 ) : 0.0;
        $currency_symbol = function_exists( 'get_woocommerce_currency_symbol' )
            ? trim( html_entity_decode( wp_strip_all_tags( get_woocommerce_currency_symbol() ), ENT_QUOTES, 'UTF-8' ) )
            : '$';

        return [
            'isLive'          => true,
            'timeframeDays'   => $days,
            'totalRevenue'    => round( $total_revenue, 2 ),
            'totalAiOrders'   => $total_ai_orders,
            'avgOrderValue'   => $avg_order_value,
            'currencySymbol'  => $currency_symbol,
            'engineBreakdown' => array_values( array_filter( $engine_stats, function ( $s ) {
                return $s['orders'] > 0;
            } ) ),
            'recentOrders'    => $recent_orders,
        ];
    }

    /**
     * Inspect an order to check if it originated from an AI Search Engine or RAG citation
     *
     * @param \WC_Order $order
     * @return string|false Matched engine name or false
     */
    public static function detect_ai_engine( $order ) {
        // 1. Check native WooCommerce 8.5+ Order Attribution meta
        $utm_source = strtolower( (string) $order->get_meta( '_wc_order_attribution_utm_source' ) );
        $referrer   = strtolower( (string) $order->get_meta( '_wc_order_attribution_referrer' ) );
        $utm_medium = strtolower( (string) $order->get_meta( '_wc_order_attribution_utm_medium' ) );

        // 2. Also check custom fallback meta if set
        if ( empty( $utm_source ) ) {
            $utm_source = strtolower( (string) $order->get_meta( 'zgeo_utm_source' ) );
        }
        if ( empty( $referrer ) ) {
            $referrer = strtolower( (string) $order->get_meta( 'zgeo_referrer' ) );
        }

        foreach ( self::AI_ENGINES as $engine_name => $config ) {
            // Check UTM source matches
            foreach ( $config['sources'] as $src_token ) {
                if ( ! empty( $utm_source ) && strpos( $utm_source, $src_token ) !== false ) {
                    return $engine_name;
                }
            }

            // Check Referrer matches
            foreach ( $config['referrers'] as $ref_token ) {
                if ( ! empty( $referrer ) && strpos( $referrer, $ref_token ) !== false ) {
                    return $engine_name;
                }
            }
        }

        // Generic AI medium check
        if ( strpos( $utm_medium, 'ai_search' ) !== false || strpos( $utm_medium, 'citation' ) !== false ) {
            return 'Generic GEO';
        }

        // 3. Check AI Referral Coupon match
        $coupon_setting    = get_option( 'zoventic_geo_settings', [] );
        $configured_coupon = ! empty( $coupon_setting['couponCode'] ) ? $coupon_setting['couponCode'] : ( $coupon_setting['coupon_code'] ?? 'AI10' );
        if ( preg_match( '/^[A-Za-z0-9_-]+/', trim( $configured_coupon ), $cm ) ) {
            $ai_coupon     = strtolower( $cm[0] );
            $order_coupons = array_map( 'strtolower', (array) $order->get_coupon_codes() );
            if ( in_array( $ai_coupon, $order_coupons, true ) || in_array( 'ai10', $order_coupons, true ) ) {
                return 'ChatGPT'; // Attributed to AI Shopper Referral Coupon
            }
        }

        return false;
    }
}
