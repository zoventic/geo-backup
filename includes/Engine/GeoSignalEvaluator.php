<?php

namespace Zoventic\Geo\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class GeoSignalEvaluator
 * Evaluates individual WooCommerce products against the 16 objective GEO signals
 * defined in Implementation Plan v7 (Part 2.2). Produces a standardized signal contract (Part 2.7).
 */
class GeoSignalEvaluator {

    /**
     * Evaluate all product-level GEO signals for a given product
     *
     * @param \WC_Product|int $product
         * @return array Array of signal contract objects keyed by signal identifier
     */
    public function evaluate_product( $product ) {
        return self::evaluate( $product );
    }

    public static function evaluate( $product ) {
        if ( is_numeric( $product ) && function_exists( 'wc_get_product' ) ) {
            $product = wc_get_product( $product );
        }

        if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
            return [];
        }

        $signals = [];

        // -------------------------------------------------------------
        // Category A: Identity & Core Data (20 pts)
        // -------------------------------------------------------------
        $signals['sku_present']            = self::eval_sku_present( $product );
        $signals['name_present']           = self::eval_name_present( $product );
        $signals['meaningful_description'] = self::eval_meaningful_description( $product );
        $signals['category_assigned']      = self::eval_category_assigned( $product );

        // -------------------------------------------------------------
        // Category B: Product Semantics (25 pts)
        // -------------------------------------------------------------
        $signals['structured_attributes']     = self::eval_structured_attributes( $product );
        $signals['specifications_dimensions'] = self::eval_specifications_dimensions( $product );
        $signals['use_case_context']          = self::eval_use_case_context( $product );

        // -------------------------------------------------------------
        // Category C: Media (10 pts)
        // -------------------------------------------------------------
        $signals['featured_image']  = self::eval_featured_image( $product );
        $signals['gallery_depth']   = self::eval_gallery_depth( $product );
        $signals['image_alt_text']  = self::eval_image_alt_text( $product );

        // -------------------------------------------------------------
        // Category D: Commerce Data (20 pts)
        // -------------------------------------------------------------
        $signals['price_set']          = self::eval_price_set( $product );
        $signals['offer_completeness'] = self::eval_offer_completeness( $product );
        $signals['variation_coverage'] = self::eval_variation_coverage( $product );

        // -------------------------------------------------------------
        // Category E: Trust & Supporting Info (15 pts)
        // -------------------------------------------------------------
        $signals['shipping_info']       = self::eval_shipping_info( $product );
        $signals['return_info']         = self::eval_return_info( $product );
        $signals['brand_manufacturer']  = self::eval_brand_manufacturer( $product );

        // -------------------------------------------------------------
        // Category F: Discoverability & Schema Structure (10 pts)
        // -------------------------------------------------------------
        $signals['canonical_url']          = self::eval_canonical_url( $product );
        $signals['product_json_ld_valid']  = self::eval_product_json_ld_valid( $product );

        return $signals;
    }

    // =========================================================================
    // Category A: Identity & Core Data
    // =========================================================================

    private static function eval_sku_present( \WC_Product $product ) {
        $sku = trim( (string) $product->get_sku() );
        $passed = ( $sku !== '' );
        return [
            'key'        => 'sku_present',
            'name'       => 'SKU Present',
            'category'   => 'identity_core_data',
            'weight'     => 5,
            'type'       => 'binary',
            'status'     => $passed ? 'PASS' : 'FAIL',
            'earned'     => $passed ? 5 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $passed ? sprintf( 'SKU is set: %s', $sku ) : 'Product SKU is empty.',
            ],
        ];
    }

    private static function eval_name_present( \WC_Product $product ) {
        $name = trim( (string) $product->get_name() );
        $placeholders = [ 'product 1', 'untitled', 'dummy product', 'test product', 'new product' ];
        $is_placeholder = in_array( strtolower( $name ), $placeholders, true );
        $passed = ( $name !== '' && ! $is_placeholder );
        return [
            'key'        => 'name_present',
            'name'       => 'Product Name Present',
            'category'   => 'identity_core_data',
            'weight'     => 3,
            'type'       => 'binary',
            'status'     => $passed ? 'PASS' : 'FAIL',
            'earned'     => $passed ? 3 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $passed ? sprintf( 'Valid product title: "%s"', $name ) : ( $name === '' ? 'Product title is empty.' : 'Title is generic placeholder text.' ),
            ],
        ];
    }

    private static function eval_meaningful_description( \WC_Product $product ) {
        $desc = (string) $product->get_description();
        $short = (string) $product->get_short_description();
        $combined = trim( $desc . ' ' . $short );
        $stripped = wp_strip_all_tags( $combined );
        $char_count = mb_strlen( $stripped );
        $title = trim( (string) $product->get_name() );

        // Check word count
        $words = preg_split( '/\s+/', trim( $stripped ), -1, PREG_SPLIT_NO_EMPTY );
        $distinct_words = count( array_unique( array_map( 'strtolower', $words ) ) );

        // Not title identical check
        $is_title_clone = ( strcasecmp( $stripped, $title ) === 0 );

        // WooCommerce default placeholder check
        $is_wc_placeholder = ( stripos( $stripped, 'This is a simple product' ) !== false || stripos( $stripped, 'Lorem ipsum' ) !== false );

        $passed = ( $char_count >= 150 && ! $is_title_clone && $distinct_words >= 20 && ! $is_wc_placeholder );

        $reason = sprintf( 'Description length: %d chars, %d distinct words.', $char_count, $distinct_words );
        if ( $is_title_clone ) {
            $reason = 'Description is identical to the product title.';
        } elseif ( $char_count < 150 ) {
            $reason = sprintf( 'Description is too short (%d / 150 chars required).', $char_count );
        } elseif ( $distinct_words < 20 ) {
            $reason = sprintf( 'Vocabulary too limited (%d / 20 distinct words required).', $distinct_words );
        } elseif ( $is_wc_placeholder ) {
            $reason = 'Description contains boilerplate default placeholder text.';
        }

        return [
            'key'        => 'meaningful_description',
            'name'       => 'Meaningful Description',
            'category'   => 'identity_core_data',
            'weight'     => 8,
            'type'       => 'binary',
            'status'     => $passed ? 'PASS' : 'FAIL',
            'earned'     => $passed ? 8 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason'         => $reason,
                'char_count'     => $char_count,
                'distinct_words' => $distinct_words,
            ],
        ];
    }

    private static function eval_category_assigned( \WC_Product $product ) {
        $cats = wp_get_post_terms( $product->get_id(), 'product_cat', [ 'fields' => 'slugs' ] );
        $has_cat = false;
        $assigned_cat = 'Uncategorized';
        if ( ! empty( $cats ) && ! is_wp_error( $cats ) ) {
            foreach ( $cats as $slug ) {
                if ( strtolower( $slug ) !== 'uncategorized' ) {
                    $has_cat = true;
                    $assigned_cat = $slug;
                    break;
                }
            }
        }
        return [
            'key'        => 'category_assigned',
            'name'       => 'Category Assigned',
            'category'   => 'identity_core_data',
            'weight'     => 4,
            'type'       => 'binary',
            'status'     => $has_cat ? 'PASS' : 'FAIL',
            'earned'     => $has_cat ? 4 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $has_cat ? sprintf( 'Assigned to category: %s', $assigned_cat ) : 'Product is Uncategorized or missing product_cat.',
            ],
        ];
    }

    // =========================================================================
    // Category B: Product Semantics
    // =========================================================================

    private static function eval_structured_attributes( \WC_Product $product ) {
        $wc_attrs = $product->get_attributes();
        $stored_specs = get_post_meta( $product->get_id(), '_zgeo_specs', true );
        $attr_count = is_array( $wc_attrs ) ? count( $wc_attrs ) : 0;
        $spec_count = is_array( $stored_specs ) ? count( $stored_specs ) : 0;
        $total = max( $attr_count, $spec_count );
        $passed = ( $total >= 2 );

        return [
            'key'        => 'structured_attributes',
            'name'       => 'Structured Attributes Present',
            'category'   => 'product_semantics',
            'weight'     => 10,
            'type'       => 'binary',
            'status'     => $passed ? 'PASS' : 'FAIL',
            'earned'     => $passed ? 10 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $passed ? sprintf( '%d structured attributes defined.', $total ) : sprintf( 'Only %d attributes found (minimum 2 required).', $total ),
                'count'  => $total,
            ],
        ];
    }

    private static function eval_specifications_dimensions( \WC_Product $product ) {
        $has_weight = $product->has_weight();
        $has_dimensions = $product->has_dimensions();
        $stored_specs = get_post_meta( $product->get_id(), '_zgeo_specs', true );
        $has_specs = ! empty( $stored_specs ) && is_array( $stored_specs );

        $passed = ( $has_weight || $has_dimensions || $has_specs );
        $reason = $passed
            ? 'Physical dimensions, weight, or technical specification metadata is present.'
            : 'Missing weight, dimensions, or technical specifications.';

        return [
            'key'        => 'specifications_dimensions',
            'name'       => 'Specifications / Dimensions Present',
            'category'   => 'product_semantics',
            'weight'     => 8,
            'type'       => 'binary',
            'status'     => $passed ? 'PASS' : 'FAIL',
            'earned'     => $passed ? 8 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason'         => $reason,
                'has_weight'     => $has_weight,
                'has_dimensions' => $has_dimensions,
            ],
        ];
    }

    private static function eval_use_case_context( \WC_Product $product ) {
        $desc = (string) $product->get_description() . ' ' . (string) $product->get_short_description();
        $stored_specs = get_post_meta( $product->get_id(), '_zgeo_specs', true );
        if ( is_array( $stored_specs ) ) {
            $desc .= ' ' . implode( ' ', array_values( $stored_specs ) );
        }

        // Soft heuristic patterns for purpose, target user, or use-case statement
        $patterns = [
            '/\b(designed for|ideal for|suitable for|perfect for|intended for|great for)\b/i',
            '/\b(used in|crafted for|engineered for|recommended for|best for)\b/i',
            '/\b(use case|applications?|for everyday|for professional|for home)\b/i',
        ];

        $matched = false;
        $matched_phrase = '';
        foreach ( $patterns as $pattern ) {
            if ( preg_match( $pattern, $desc, $matches ) ) {
                $matched = true;
                $matched_phrase = $matches[0];
                break;
            }
        }

        return [
            'key'        => 'use_case_context',
            'name'       => 'Use-Case / Context Statement',
            'category'   => 'product_semantics',
            'weight'     => 7,
            'type'       => 'binary',
            'status'     => $matched ? 'PASS' : 'FAIL',
            'earned'     => $matched ? 7 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $matched ? sprintf( 'Contextual application statement detected ("%s").', $matched_phrase ) : 'No explicit purpose, audience, or use-case phrasing detected (soft heuristic).',
            ],
        ];
    }

    // =========================================================================
    // Category C: Media
    // =========================================================================

    private static function eval_featured_image( \WC_Product $product ) {
        $img_id = (int) $product->get_image_id();
        $passed = ( $img_id > 0 );
        return [
            'key'        => 'featured_image',
            'name'       => 'Featured Image Present',
            'category'   => 'media',
            'weight'     => 5,
            'type'       => 'binary',
            'status'     => $passed ? 'PASS' : 'FAIL',
            'earned'     => $passed ? 5 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $passed ? 'Product featured image is set.' : 'Missing featured image thumbnail.',
            ],
        ];
    }

    private static function eval_gallery_depth( \WC_Product $product ) {
        $gallery_ids = (array) $product->get_gallery_image_ids();
        $count = count( $gallery_ids );

        if ( $count >= 2 ) {
            $status = 'PASS';
            $earned = 3.0;
        } elseif ( $count === 1 ) {
            $status = 'PARTIAL';
            $earned = 1.5;
        } else {
            $status = 'FAIL';
            $earned = 0.0;
        }

        return [
            'key'        => 'gallery_depth',
            'name'       => 'Gallery Image Depth',
            'category'   => 'media',
            'weight'     => 3,
            'type'       => 'partial',
            'status'     => $status,
            'earned'     => $earned,
            'applicable' => true,
            'diagnostic' => [
                'reason'        => sprintf( '%d gallery image(s) attached (2+ required for full credit).', $count ),
                'gallery_count' => $count,
                'required'      => 2,
            ],
        ];
    }

    private static function eval_image_alt_text( \WC_Product $product ) {
        $img_id = (int) $product->get_image_id();
        $has_alt = false;
        if ( $img_id > 0 ) {
            $alt = get_post_meta( $img_id, '_wp_attachment_image_alt', true );
            $has_alt = ! empty( trim( (string) $alt ) );
        }

        return [
            'key'        => 'image_alt_text',
            'name'       => 'Image Alt Text Present',
            'category'   => 'media',
            'weight'     => 2,
            'type'       => 'binary',
            'status'     => $has_alt ? 'PASS' : 'FAIL',
            'earned'     => $has_alt ? 2 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $has_alt ? 'Featured image includes descriptive alt text.' : 'Featured image alt text is missing or empty.',
            ],
        ];
    }

    // =========================================================================
    // Category D: Commerce Data
    // =========================================================================

    private static function eval_price_set( \WC_Product $product ) {
        $price = (float) $product->get_price();
        $reg = (float) $product->get_regular_price();
        $has_price = ( $price > 0 || $reg > 0 );

        return [
            'key'        => 'price_set',
            'name'       => 'Price Set',
            'category'   => 'commerce_data',
            'weight'     => 5,
            'type'       => 'binary',
            'status'     => $has_price ? 'PASS' : 'FAIL',
            'earned'     => $has_price ? 5 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $has_price ? sprintf( 'Source price configured (%0.2f).', max( $price, $reg ) ) : 'Price is 0.00 or unconfigured in WooCommerce.',
            ],
        ];
    }

    private static function eval_offer_completeness( \WC_Product $product ) {
        $price = (float) $product->get_price();
        $currency = function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'USD';
        $stock = $product->get_stock_status(); // 'instock', 'outofstock', 'onbackorder'

        $has_all = ( $price > 0 && ! empty( $currency ) && ! empty( $stock ) );

        return [
            'key'        => 'offer_completeness',
            'name'       => 'Offer Completeness (Price, Currency & Availability)',
            'category'   => 'commerce_data',
            'weight'     => 5,
            'type'       => 'binary',
            'status'     => $has_all ? 'PASS' : 'FAIL',
            'earned'     => $has_all ? 5 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $has_all ? sprintf( 'Complete Offer structure (%s %0.2f, %s).', $currency, $price, $stock ) : 'Incomplete Offer: missing currency, price, or availability state.',
            ],
        ];
    }

    private static function eval_variation_coverage( \WC_Product $product ) {
        if ( ! $product->is_type( 'variable' ) ) {
            return [
                'key'        => 'variation_coverage',
                'name'       => 'Variation Coverage',
                'category'   => 'commerce_data',
                'weight'     => 10,
                'type'       => 'partial',
                'status'     => 'N/A',
                'earned'     => 0,
                'applicable' => false,
                'diagnostic' => [
                    'reason' => 'Not applicable for simple products.',
                ],
            ];
        }

        $children = $product->get_children();
        $total = count( $children );
        if ( $total === 0 ) {
            return [
                'key'        => 'variation_coverage',
                'name'       => 'Variation Coverage',
                'category'   => 'commerce_data',
                'weight'     => 10,
                'type'       => 'partial',
                'status'     => 'FAIL',
                'earned'     => 0,
                'applicable' => true,
                'diagnostic' => [
                    'reason' => 'Variable product has 0 variations created.',
                ],
            ];
        }

        $complete = 0;
        foreach ( $children as $child_id ) {
            $child = wc_get_product( $child_id );
            if ( $child && $child->get_price() > 0 && ( $child->get_sku() || $product->get_sku() ) ) {
                $complete++;
            }
        }

        $fraction = $complete / $total;
        $earned = round( 10 * $fraction, 1 );
        $status = ( $complete === $total ) ? 'PASS' : ( $complete > 0 ? 'PARTIAL' : 'FAIL' );

        return [
            'key'        => 'variation_coverage',
            'name'       => 'Variation Coverage',
            'category'   => 'commerce_data',
            'weight'     => 10,
            'type'       => 'partial',
            'status'     => $status,
            'earned'     => $earned,
            'applicable' => true,
            'diagnostic' => [
                'reason'              => sprintf( '%d of %d variations fully configured with pricing and SKUs.', $complete, $total ),
                'complete_variations' => $complete,
                'total_variations'    => $total,
            ],
        ];
    }

    // =========================================================================
    // Category E: Trust & Supporting Info
    // =========================================================================

    private static function eval_shipping_info( \WC_Product $product ) {
        $has_class = ( (int) $product->get_shipping_class_id() > 0 );
        $has_weight = $product->has_weight() || $product->has_dimensions();
        $shipping_note = get_post_meta( $product->get_id(), '_zgeo_shipping_note', true );
        $passed = ( $has_class || $has_weight || ! empty( $shipping_note ) || ! $product->needs_shipping() );

        return [
            'key'        => 'shipping_info',
            'name'       => 'Shipping Information Present',
            'category'   => 'trust_supporting',
            'weight'     => 5,
            'type'       => 'binary',
            'status'     => $passed ? 'PASS' : 'FAIL',
            'earned'     => $passed ? 5 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $passed ? 'Shipping class, delivery dimensions, or digital exemption configured.' : 'Missing shipping class, package dimensions, or delivery instructions.',
            ],
        ];
    }

    private static function eval_return_info( \WC_Product $product ) {
        $has_policy = (bool) get_post_meta( $product->get_id(), '_zgeo_merchant_policy', true );
        $has_opt = (bool) get_post_meta( $product->get_id(), '_zgeo_optimized_at', true );
        $settings = get_option( 'zoventic_geo_settings', [] );
        $has_store_policy = ! empty( $settings['returnPolicy'] ) || ! empty( $settings['return_policy'] );

        $passed = ( $has_policy || $has_opt || $has_store_policy );

        return [
            'key'        => 'return_info',
            'name'       => 'Return Policy Information Present',
            'category'   => 'trust_supporting',
            'weight'     => 5,
            'type'       => 'binary',
            'status'     => $passed ? 'PASS' : 'FAIL',
            'earned'     => $passed ? 5 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $passed ? 'MerchantReturnPolicy structured schema attached.' : 'No return policy or warranty terms detected (click 1-Click Enrich).',
            ],
        ];
    }

    private static function eval_brand_manufacturer( \WC_Product $product ) {
        // 1. Check native WooCommerce product attributes (pa_brand, brand, manufacturer)
        $attr_brand = $product->get_attribute( 'pa_brand' );
        if ( empty( $attr_brand ) ) {
            $attr_brand = $product->get_attribute( 'brand' );
        }
        if ( empty( $attr_brand ) ) {
            $attr_brand = $product->get_attribute( 'manufacturer' );
        }

        if ( ! empty( $attr_brand ) ) {
            return [
                'key'        => 'brand_manufacturer',
                'name'       => 'Brand / Manufacturer Present',
                'category'   => 'trust_supporting',
                'weight'     => 5,
                'type'       => 'binary',
                'status'     => 'PASS',
                'earned'     => 5,
                'applicable' => true,
                'diagnostic' => [
                    'reason' => sprintf( 'Brand attribute assigned: "%s".', $attr_brand ),
                ],
            ];
        }

        // 2. Check if store has a dedicated brand taxonomy plugin installed
        $taxonomies = get_taxonomies( [], 'names' );
        $brand_tax = null;
        foreach ( [ 'product_brand', 'brand', 'pwb-brand', 'yith_product_brand' ] as $t ) {
            if ( in_array( $t, $taxonomies, true ) ) {
                $brand_tax = $t;
                break;
            }
        }

        if ( ! $brand_tax ) {
            // Store has no brand taxonomy or attribute configured -> N/A (excluded from score)
            return [
                'key'        => 'brand_manufacturer',
                'name'       => 'Brand / Manufacturer Present',
                'category'   => 'trust_supporting',
                'weight'     => 5,
                'type'       => 'binary',
                'status'     => 'N/A',
                'earned'     => 0,
                'applicable' => false,
                'diagnostic' => [
                    'reason' => 'Store has no brand taxonomy or brand attribute configured (excluded from denominator).',
                ],
            ];
        }

        $terms = wp_get_post_terms( $product->get_id(), $brand_tax, [ 'fields' => 'names' ] );
        $has_brand = ( ! empty( $terms ) && ! is_wp_error( $terms ) );

        return [
            'key'        => 'brand_manufacturer',
            'name'       => 'Brand / Manufacturer Present',
            'category'   => 'trust_supporting',
            'weight'     => 5,
            'type'       => 'binary',
            'status'     => $has_brand ? 'PASS' : 'FAIL',
            'earned'     => $has_brand ? 5 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $has_brand ? sprintf( 'Brand assigned: %s', $terms[0] ) : sprintf( 'Taxonomy "%s" exists, but no brand assigned.', $brand_tax ),
            ],
        ];
    }

    // =========================================================================
    // Category F: Discoverability & Schema Structure
    // =========================================================================

    private static function eval_canonical_url( \WC_Product $product ) {
        $permalink = $product->get_permalink();
        $is_valid = ! empty( $permalink ) && filter_var( $permalink, FILTER_VALIDATE_URL );

        return [
            'key'        => 'canonical_url',
            'name'       => 'Canonical URL Resolves',
            'category'   => 'discoverability_schema',
            'weight'     => 5,
            'type'       => 'binary',
            'status'     => $is_valid ? 'PASS' : 'FAIL',
            'earned'     => $is_valid ? 5 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $is_valid ? 'Valid canonical permalink structure.' : 'Invalid or unresolvable product permalink.',
            ],
        ];
    }

    private static function eval_product_json_ld_valid( \WC_Product $product ) {
        $name = $product->get_name();
        $price = (float) $product->get_price();
        $has_valid_schema = ! empty( $name ) && ( $price > 0 || ! $product->is_purchasable() );

        return [
            'key'        => 'product_json_ld_valid',
            'name'       => 'Product JSON-LD Structurally Valid',
            'category'   => 'discoverability_schema',
            'weight'     => 5,
            'type'       => 'binary',
            'status'     => $has_valid_schema ? 'PASS' : 'FAIL',
            'earned'     => $has_valid_schema ? 5 : 0,
            'applicable' => true,
            'diagnostic' => [
                'reason' => $has_valid_schema ? 'Valid schema structure with @type Product and valid Offer graph.' : 'Schema structure incomplete: missing essential name or offer keys.',
            ],
        ];
    }
}
