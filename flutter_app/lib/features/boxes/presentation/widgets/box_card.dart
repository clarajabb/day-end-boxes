import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../design_system/design_system.dart';
import '../../../../core/core.dart';

/// Card widget for displaying box information
class BoxCard extends StatelessWidget {
  const BoxCard({
    super.key,
    required this.id,
    required this.name,
    required this.merchantName,
    required this.originalPrice,
    required this.discountedPrice,
    required this.rating,
    required this.distance,
    required this.imageUrl,
    required this.pickupWindow,
    required this.onTap,
    this.isFavorite = false,
    this.onFavoriteToggle,
  });

  final String id;
  final String name;
  final String merchantName;
  final int originalPrice;
  final int discountedPrice;
  final double rating;
  final double distance;
  final String imageUrl;
  final String pickupWindow;
  final VoidCallback onTap;
  final bool isFavorite;
  final VoidCallback? onFavoriteToggle;

  @override
  Widget build(BuildContext context) {
    final savings = originalPrice - discountedPrice;
    final savingsPercentage = ((savings / originalPrice) * 100).round();

    return Card(
      elevation: DesignTokens.elevationSm,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(DesignTokens.radiusXl),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(DesignTokens.radiusXl),
        child: Padding(
          padding: const EdgeInsets.all(DesignTokens.spacingLg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image and Favorite Button
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
                    child: Image.network(
                      imageUrl,
                      width: double.infinity,
                      height: 160,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          width: double.infinity,
                          height: 160,
                          decoration: BoxDecoration(
                            color: DesignTokens.surface,
                            borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
                          ),
                          child: const Icon(
                            Icons.restaurant,
                            size: 48,
                            color: DesignTokens.textTertiary,
                          ),
                        );
                      },
                    ),
                  ),
                  
                  // Favorite Button
                  Positioned(
                    top: DesignTokens.spacingSm,
                    right: DesignTokens.spacingSm,
                    child: GestureDetector(
                      onTap: onFavoriteToggle,
                      child: Container(
                        padding: const EdgeInsets.all(DesignTokens.spacingSm),
                        decoration: BoxDecoration(
                          color: DesignTokens.background.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(DesignTokens.radiusFull),
                        ),
                        child: Icon(
                          isFavorite ? Icons.favorite : Icons.favorite_border,
                          color: isFavorite ? DesignTokens.danger : DesignTokens.textSecondary,
                          size: 20,
                        ),
                      ),
                    ),
                  ),
                  
                  // Pickup Window Badge
                  Positioned(
                    bottom: DesignTokens.spacingSm,
                    left: DesignTokens.spacingSm,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: DesignTokens.spacingSm,
                        vertical: DesignTokens.spacingXs,
                      ),
                      decoration: BoxDecoration(
                        color: DesignTokens.accentEco,
                        borderRadius: BorderRadius.circular(DesignTokens.radiusSm),
                      ),
                      child: Text(
                        pickupWindow,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: DesignTokens.background,
                          fontWeight: DesignTokens.fontWeightMedium,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              
              SizedBox(height: DesignTokens.spacingLg),
              
              // Merchant Name and Rating
              Row(
                children: [
                  Expanded(
                    child: Text(
                      merchantName,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: DesignTokens.textInk,
                        fontWeight: DesignTokens.fontWeightMedium,
                      ),
                    ),
                  ),
                  Row(
                    children: [
                      const Icon(
                        Icons.star,
                        color: DesignTokens.warning,
                        size: 16,
                      ),
                      SizedBox(width: DesignTokens.spacingXs),
                      Text(
                        rating.toString(),
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: DesignTokens.textSecondary,
                          fontWeight: DesignTokens.fontWeightMedium,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              
              SizedBox(height: DesignTokens.spacingXs),
              
              // Box Name
              Text(
                name,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: DesignTokens.textInk,
                  fontWeight: DesignTokens.fontWeightMedium,
                ),
              ),
              
              SizedBox(height: DesignTokens.spacingSm),
              
              // Distance and Price
              Row(
                children: [
                  Icon(
                    Icons.location_on_outlined,
                    size: 16,
                    color: DesignTokens.textSecondary,
                  ),
                  SizedBox(width: DesignTokens.spacingXs),
                  Text(
                    '${distance.toStringAsFixed(1)} km',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: DesignTokens.textSecondary,
                    ),
                  ),
                  
                  const Spacer(),
                  
                  // Price
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'LBP ${_formatPrice(discountedPrice)}',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: DesignTokens.accentEco,
                          fontWeight: DesignTokens.fontWeightBold,
                        ),
                      ),
                      Row(
                        children: [
                          Text(
                            'LBP ${_formatPrice(originalPrice)}',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: DesignTokens.textTertiary,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                          SizedBox(width: DesignTokens.spacingXs),
                          Text(
                            '${savingsPercentage}% off',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: DesignTokens.accentEco,
                              fontWeight: DesignTokens.fontWeightMedium,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatPrice(int price) {
    return price.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match match) => '${match[1]},',
    );
  }
}

