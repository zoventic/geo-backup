<?php

namespace Zoventic\Geo\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class IndexNowPinger
 * Discloses and implements Microsoft/Bing IndexNow protocol integration.
 * Pings Bing's search engine index when products are published or updated,
 * facilitating fast search discovery without blocking PHP execution.
 */
class IndexNowPinger {

    const ENDPOINT = 'https://api.indexnow.org/indexnow';

    public static function init() {
        add_action( 'transition_post_status', [ __CLASS__, 'on_product_status_change' ], 10, 3 );
        add_action( 'init', [ __CLASS__, 'serve_key_file' ] );
    }

    /**
     * Serve /{key}.txt dynamically for Microsoft Bing / IndexNow host ownership verification
     */
    public static function serve_key_file() {
        $key = get_option( 'zgeo_indexnow_key' );
        if ( empty( $key ) ) {
            return;
        }

        $request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
        $path        = trim( (string) wp_parse_url( $request_uri, PHP_URL_PATH ), '/' );

        if ( $path === $key . '.txt' ) {
            header( 'Content-Type: text/plain; charset=utf-8' );
            header( 'X-Robots-Tag: noindex' );
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Plain text key token
            echo esc_html( $key );
            exit;
        }
    }

    /**
     * Triggered on post status changes (e.g. draft -> publish or update publish)
     */
    public static function on_product_status_change( $new_status, $old_status, $post ) {
        if ( $post->post_type !== 'product' || $new_status !== 'publish' ) {
            return;
        }

        $settings = get_option( 'zoventic_geo_settings', [] );
        if ( empty( $settings['enableIndexNow'] ) && empty( $settings['enable_index_now'] ) ) {
            return;
        }

        $permalink = get_permalink( $post->ID );
        if ( ! $permalink ) {
            return;
        }

        self::ping_urls( [ $permalink ] );
    }

    /**
     * Send non-blocking asynchronous notification to IndexNow API
     *
     * @param array $urls List of URLs to index
     * @return bool
     */
    public static function ping_urls( array $urls ) {
        if ( empty( $urls ) ) {
            return false;
        }

        $host = wp_parse_url( home_url(), PHP_URL_HOST );
        $key  = get_option( 'zgeo_indexnow_key' );

        if ( empty( $key ) ) {
            $key = wp_generate_password( 32, false );
            update_option( 'zgeo_indexnow_key', $key );
        }

        $payload = [
            'host'        => $host,
            'key'         => $key,
            'keyLocation' => home_url( '/' . $key . '.txt' ),
            'urlList'     => array_values( array_unique( $urls ) ),
        ];

        // Non-blocking HTTP POST: returns immediately with 0ms wait time
        wp_remote_post( self::ENDPOINT, [
            'body'        => wp_json_encode( $payload ),
            'headers'     => [ 'Content-Type' => 'application/json; charset=utf-8' ],
            'timeout'     => 5,
            'blocking'    => false,
            'data_format' => 'body',
        ] );

        return true;
    }
}
