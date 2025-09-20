import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../tokens/tokens.dart';

/// Price tag widget following Uber/Uber Eats design principles
/// Shows current price, original price, and savings percentage
class PriceTag extends StatelessWidget {
  const PriceTag({
    super.key,
    required this.currentPrice,
    required this.originalPrice,
    this.currency = 'LBP',
    this.showSavings = true,
    this.size = PriceTagSize.medium,
    this.alignment = PriceTagAlignment.left,
  });

  final double currentPrice;
  final double originalPrice;
  final String currency;
  final bool showSavings;
  final PriceTagSize size;
  final PriceTagAlignment alignment;

  @override
  Widget build(BuildContext context) {
    final savings = originalPrice - currentPrice;
    final savingsPercentage = ((savings / originalPrice) * 100).round();
    
    return Container(
      alignment: _getAlignment(),
      child: Column(
        crossAxisAlignment: _getCrossAxisAlignment(),
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                _formatPrice(currentPrice),
                style: TextStyle(
                  fontSize: size.currentPriceFontSize,
                  fontWeight: DesignTokens.fontWeightSemibold,
                  color: DesignTokens.textInk,
                  letterSpacing: DesignTokens.letterSpacingTight,
                ),
              ),
              const SizedBox(width: DesignTokens.spacingXs),
              Text(
                currency,
                style: TextStyle(
                  fontSize: size.currencyFontSize,
                  fontWeight: DesignTokens.fontWeightMedium,
                  color: DesignTokens.textSecondary,
                  letterSpacing: DesignTokens.letterSpacingNormal,
                ),
              ),
            ],
          ),
          if (showSavings && savings > 0) ...[
            SizedBox(height: size.spacingBetweenPrices),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _formatPrice(originalPrice),
                  style: TextStyle(
                    fontSize: size.originalPriceFontSize,
                    fontWeight: DesignTokens.fontWeightNormal,
                    color: DesignTokens.textTertiary,
                    decoration: TextDecoration.lineThrough,
                    letterSpacing: DesignTokens.letterSpacingNormal,
                  ),
                ),
                const SizedBox(width: DesignTokens.spacingXs),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: DesignTokens.spacingXs,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: DesignTokens.accentEco.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(DesignTokens.radiusSm),
                  ),
                  child: Text(
                    '${savingsPercentage}% saved',
                    style: TextStyle(
                      fontSize: size.savingsFontSize,
                      fontWeight: DesignTokens.fontWeightMedium,
                      color: DesignTokens.accentEco,
                      letterSpacing: DesignTokens.letterSpacingNormal,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  String _formatPrice(double price) {
    final formatter = NumberFormat('#,###');
    return formatter.format(price);
  }

  Alignment _getAlignment() {
    switch (alignment) {
      case PriceTagAlignment.left:
        return Alignment.centerLeft;
      case PriceTagAlignment.center:
        return Alignment.center;
      case PriceTagAlignment.right:
        return Alignment.centerRight;
    }
  }

  CrossAxisAlignment _getCrossAxisAlignment() {
    switch (alignment) {
      case PriceTagAlignment.left:
        return CrossAxisAlignment.start;
      case PriceTagAlignment.center:
        return CrossAxisAlignment.center;
      case PriceTagAlignment.right:
        return CrossAxisAlignment.end;
    }
  }
}

/// Price tag size variants
enum PriceTagSize {
  small(16.0, 12.0, 12.0, 10.0, 2.0),
  medium(20.0, 14.0, 14.0, 12.0, 4.0),
  large(24.0, 16.0, 16.0, 14.0, 6.0);

  const PriceTagSize(
    this.currentPriceFontSize,
    this.currencyFontSize,
    this.originalPriceFontSize,
    this.savingsFontSize,
    this.spacingBetweenPrices,
  );

  final double currentPriceFontSize;
  final double currencyFontSize;
  final double originalPriceFontSize;
  final double savingsFontSize;
  final double spacingBetweenPrices;
}

/// Price tag alignment options
enum PriceTagAlignment {
  left,
  center,
  right,
}

