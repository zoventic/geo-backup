<?php

namespace Zoventic\Geo\Pro;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class GeoAuditor
 * Standalone & Agency Audit Engine.
 * Diagnoses any WooCommerce or e-commerce URL for AI Search discoverability,
 * validating /llms.txt compliance, robots.txt crawler gating, and JSON-LD schema depth.
 */
class GeoAuditor {

    /**
     * Perform deep diagnostic audit of an external store domain
     *
     * @param string $domain_url Target URL or domain name
     * @return array Audit results and score breakdown
     */
    public static function audit_domain( $domain_url ) {
        $domain_url = esc_url_raw( trim( $domain_url ) );
        if ( empty( $domain_url ) ) {
            return [
                'success' => false,
                'message' => __( 'Please provide a valid website URL.', 'zoventic-geo' ),
            ];
        }

        // Normalize URL
        $parsed = wp_parse_url( $domain_url );
        if ( ! isset( $parsed['scheme'] ) ) {
            $domain_url = 'https://' . $domain_url;
            $parsed     = wp_parse_url( $domain_url );
        }

        $base_url = $parsed['scheme'] . '://' . $parsed['host'];
        $score    = 0;
        $checks   = [];

        // 1. Audit /llms.txt
        $llms_url = rtrim( $base_url, '/' ) . '/llms.txt';
        $llms_res = wp_remote_get( $llms_url, [ 'timeout' => 8, 'sslverify' => false ] );

        if ( ! is_wp_error( $llms_res ) && wp_remote_retrieve_response_code( $llms_res ) === 200 ) {
            $body = wp_remote_retrieve_body( $llms_res );
            $has_products = ( strpos( $body, 'http' ) !== false && strlen( $body ) > 80 );

            $score += $has_products ? 35 : 20;
            $checks['llmsTxt'] = [
                'status'  => 'pass',
                'title'   => 'llms.txt Endpoint Found',
                /* translators: %d: File size in bytes of the discovered llms.txt feed */
                'details' => sprintf( __( 'Valid /llms.txt feed discovered (%d bytes). AI crawlers can ingest structured markdown.', 'zoventic-geo' ), strlen( $body ) ),
                'score'   => $has_products ? 35 : 20,
            ];
        } else {
            $checks['llmsTxt'] = [
                'status'  => 'fail',
                'title'   => 'Missing /llms.txt Feed',
                'details' => __( 'No /llms.txt feed discovered. AI models must scrape heavy HTML pages consuming excessive token budget.', 'zoventic-geo' ),
                'score'   => 0,
            ];
        }

        // 2. Audit robots.txt for AI bots
        $robots_url = rtrim( $base_url, '/' ) . '/robots.txt';
        $robots_res = wp_remote_get( $robots_url, [ 'timeout' => 6, 'sslverify' => false ] );

        if ( ! is_wp_error( $robots_res ) && wp_remote_retrieve_response_code( $robots_res ) === 200 ) {
            $robots_body = strtolower( wp_remote_retrieve_body( $robots_res ) );
            $blocked_bots = [];

            if ( strpos( $robots_body, 'user-agent: gptbot' ) !== false && strpos( $robots_body, 'disallow: /' ) !== false ) {
                $blocked_bots[] = 'GPTBot (ChatGPT)';
            }
            if ( strpos( $robots_body, 'user-agent: perplexitybot' ) !== false && strpos( $robots_body, 'disallow: /' ) !== false ) {
                $blocked_bots[] = 'PerplexityBot';
            }
            if ( strpos( $robots_body, 'user-agent: claudebot' ) !== false && strpos( $robots_body, 'disallow: /' ) !== false ) {
                $blocked_bots[] = 'ClaudeBot';
            }

            if ( empty( $blocked_bots ) ) {
                $score += 25;
                $checks['robotsTxt'] = [
                    'status'  => 'pass',
                    'title'   => 'AI Crawlers Allowed in robots.txt',
                    'details' => __( 'GPTBot, PerplexityBot, and ClaudeBot are not blocked in robots.txt.', 'zoventic-geo' ),
                    'score'   => 25,
                ];
            } else {
                $checks['robotsTxt'] = [
                    'status'  => 'warning',
                    'title'   => 'AI Crawlers Blocked',
                    /* translators: %s: Comma-separated list of blocked AI crawler bot names */
                    'details' => sprintf( __( 'Blocked crawlers detected: %s. Store cannot be indexed by these answer engines.', 'zoventic-geo' ), implode( ', ', $blocked_bots ) ),
                    'score'   => 5,
                ];
                $score += 5;
            }
        } else {
            $score += 20;
            $checks['robotsTxt'] = [
                'status'  => 'pass',
                'title'   => 'robots.txt Open by Default',
                'details' => __( 'No restrictive robots.txt preventing AI bot indexing.', 'zoventic-geo' ),
                'score'   => 20,
            ];
        }

        // 3. Audit Homepage / Storefront HTML for JSON-LD Product & Organization Schema
        $home_res = wp_remote_get( $base_url, [ 'timeout' => 8, 'sslverify' => false ] );

        if ( ! is_wp_error( $home_res ) && wp_remote_retrieve_response_code( $home_res ) === 200 ) {
            $html = wp_remote_retrieve_body( $home_res );
            $has_jsonld = ( strpos( $html, 'application/ld+json' ) !== false );
            $has_schema_org = ( strpos( $html, 'schema.org' ) !== false );

            if ( $has_jsonld && $has_schema_org ) {
                $score += 30;
                $checks['schema'] = [
                    'status'  => 'pass',
                    'title'   => 'JSON-LD Structured Data Active',
                    'details' => __( 'Found application/ld+json entity graphs helping search models comprehend store authority.', 'zoventic-geo' ),
                    'score'   => 30,
                ];
            } else {
                $checks['schema'] = [
                    'status'  => 'warning',
                    'title'   => 'Weak or Missing Schema Graphs',
                    'details' => __( 'Storefront lacks high-density JSON-LD entity structures for RAG parsing.', 'zoventic-geo' ),
                    'score'   => 10,
                ];
                $score += 10;
            }

            // 4. Check HTML payload weight
            $html_size_kb = round( strlen( $html ) / 1024, 1 );
            if ( $html_size_kb > 1500 ) {
                $checks['payload'] = [
                    'status'  => 'warning',
                    'title'   => 'Heavy HTML Bloat (' . $html_size_kb . ' KB)',
                    'details' => __( 'Page weight exceeds 1.5MB. AI crawlers may truncate page before reaching product attributes.', 'zoventic-geo' ),
                    'score'   => 5,
                ];
                $score += 5;
            } else {
                $checks['payload'] = [
                    'status'  => 'pass',
                    'title'   => 'Clean Payload Size (' . $html_size_kb . ' KB)',
                    'details' => __( 'Page weight is acceptable for standard AI crawler token limits.', 'zoventic-geo' ),
                    'score'   => 10,
                ];
                $score += 10;
            }
        }

        $final_score = min( 100, $score );

        return [
            'success'     => true,
            'targetUrl'   => $domain_url,
            'auditedAt'   => current_time( 'mysql' ),
            'score'       => $final_score,
            'overallScore'=> $final_score,
            'rating'      => $final_score >= 80 ? 'Excellent' : ( $final_score >= 50 ? 'Moderate' : 'Needs Optimization' ),
            'checks'      => $checks,
        ];
    }
}
