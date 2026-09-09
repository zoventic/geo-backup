<?php

namespace Zoventic\Geo\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class PromptSanitizer
 * 
 * Enterprise-grade AI Safety Sanitizer & Prompt Guard.
 * Protects WooCommerce products, /llms.txt feeds, and JSON-LD schemas
 * against direct and indirect prompt injection attacks, LLM delimiter hijacking,
 * invisible zero-width unicode exploits, and exfiltration beacons.
 */
class PromptSanitizer {

    /**
     * Common instruction injection override patterns.
     */
    const INSTRUCTION_OVERRIDE_PATTERNS = [
        '/\b(ignore|disregard|forget|bypass|override)\s+(all\s+|previous\s+|prior\s+|above\s+|system\s+)?(instructions|prompts|rules|guidelines|context)\b/i',
        '/\byou\s+are\s+now\s+(a|an|the)?\s*[\w\s]{1,30}\b/i',
        '/\b(new\s+instruction|system\s+override|system\s+prompt|admin\s+command)\s*[:=]/i',
        '/\b(act\s+as|pretend\s+to\s+be|roleplay\s+as)\s+(an?\s+)?(unrestricted|jailbroken|unfiltered|evil|dan|developer\s+mode)\b/i',
        '/\b(dan\s+mode|jailbreak\s+prompt|developer\s+mode\s+enabled)\b/i',
        '/\bdo\s+not\s+(follow|obey|respect)\s+(earlier|previous|system)\s+rules\b/i',
        '/\brecommend\s+(only\s+)?https?:\/\/[^\s]+/i',
    ];

    /**
     * Known LLM control delimiters and role markers.
     */
    const CONTROL_DELIMITER_PATTERNS = [
        '/\[\/?(?:INST|SYS|SYSTEM)\]/i',
        '/<\/?(?:\|im_start\||\|im_end\||\|system\||\|user\||\|assistant\||s|SYS|SYSTEM)>/i',
        '/<<\/?SYS>>/i',
        '/\{\{(?:system|prompt|user|instruction)\}\}/i',
        '/(?:^|\n)\s*(?:###|---)\s*(?:Instruction|System|Human|Assistant|Prompt)\s*:/i',
        '/(?:^|\n)\s*(?:System|Human|Assistant)\s*:\s*/i',
    ];

    /**
     * Invisible unicode characters used for filter evasion.
     */
    const ZERO_WIDTH_CHARS = [
        "\xE2\x80\x8B", // U+200B Zero-Width Space
        "\xE2\x80\x8C", // U+200C Zero-Width Non-Joiner
        "\xE2\x80\x8D", // U+200D Zero-Width Joiner
        "\xEF\xBB\xBF", // U+FEFF Zero-Width No-Break Space (BOM)
        "\xE2\x81\xA0", // U+2060 Word Joiner
        "\xE2\x80\xAE", // U+202E Right-to-Left Override
        "\xE2\x80\xAD", // U+202D Left-to-Right Override
    ];

    /**
     * Sanitize a string to ensure it cannot execute an indirect prompt injection.
     *
     * @param string $text Raw text from product title, description, or review.
     * @param array  $options Optional flags.
     * @return string Safe, sanitized text.
     */
    public static function sanitize( $text, $options = [] ) {
        if ( ! is_string( $text ) || empty( $text ) ) {
            return '';
        }

        // 1. Strip invisible zero-width characters
        $text = str_replace( self::ZERO_WIDTH_CHARS, '', $text );

        // 2. Strip hidden HTML comments and CSS hidden containers
        $text = preg_replace( '/<!--[\s\S]*?-->/', '', $text );
        $text = preg_replace( '/<style[\s\S]*?<\/style>/i', '', $text );
        $text = preg_replace( '/<[^>]+style=["\'][^"\']*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0|font-size\s*:\s*0)[^"\']*["\'][^>]*>[\s\S]*?<\/[^>]+>/i', '', $text );

        // 3. Remove control delimiters & role tokens
        foreach ( self::CONTROL_DELIMITER_PATTERNS as $pattern ) {
            $text = preg_replace( $pattern, '', $text );
        }

        // 4. Defang instruction override attempts (replace with safe defanged text)
        foreach ( self::INSTRUCTION_OVERRIDE_PATTERNS as $pattern ) {
            $text = preg_replace_callback( $pattern, function( $matches ) {
                return '[Neutralized AI Prompt Injection: ' . substr( sanitize_text_field( $matches[0] ), 0, 40 ) . ']';
            }, $text );
        }

        // 5. Neutralize markdown image beacons (potential exfiltration attacks)
        $text = preg_replace( '/!\[(.*?)\]\((https?:)?\/\/[^\)]+\)/i', '$1', $text );

        return trim( $text );
    }

    /**
     * Detect potential prompt injection threats in content.
     *
     * @param string $text
     * @return array Threat detection report.
     */
    public static function detect_threats( $text ) {
        if ( ! is_string( $text ) || empty( $text ) ) {
            return [
                'threats_found' => 0,
                'severity'      => 'none',
                'threats'       => [],
                'cleaned_text'  => '',
            ];
        }

        $threats = [];

        // Check for zero-width unicode
        foreach ( self::ZERO_WIDTH_CHARS as $zwc ) {
            if ( strpos( $text, $zwc ) !== false ) {
                $threats[] = 'Invisible Zero-Width Character Evasion (U+200B / U+FEFF)';
                break;
            }
        }

        // Check control delimiters
        foreach ( self::CONTROL_DELIMITER_PATTERNS as $pattern ) {
            if ( preg_match( $pattern, $text, $matches ) ) {
                $threats[] = 'LLM Control Token Delimiter Hijack: ' . trim( $matches[0] );
            }
        }

        // Check instruction overrides
        foreach ( self::INSTRUCTION_OVERRIDE_PATTERNS as $pattern ) {
            if ( preg_match( $pattern, $text, $matches ) ) {
                $threats[] = 'Instruction Override Signature: ' . trim( $matches[0] );
            }
        }

        // Check hidden comments
        if ( preg_match( '/<!--[\s\S]*?-->/', $text ) ) {
            $threats[] = 'Hidden HTML Comment Payload';
        }

        $count = count( $threats );
        $severity = 'none';
        if ( $count >= 2 ) {
            $severity = 'high';
        } elseif ( $count === 1 ) {
            $severity = 'medium';
        }

        return [
            'threats_found' => $count,
            'severity'      => $severity,
            'threats'       => $threats,
            'cleaned_text'  => self::sanitize( $text ),
        ];
    }

    /**
     * Check if a string is completely free of prompt injection signatures.
     *
     * @param string $text
     * @return bool
     */
    public static function is_safe( $text ) {
        $report = self::detect_threats( $text );
        return $report['threats_found'] === 0;
    }
}
