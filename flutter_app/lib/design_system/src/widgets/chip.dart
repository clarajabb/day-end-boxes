import 'package:flutter/material.dart';
import '../tokens/tokens.dart';

/// Filter chip following Uber/Uber Eats design principles
/// Clean, rounded, with selection states
class AppChip extends StatelessWidget {
  const AppChip({
    super.key,
    required this.label,
    this.isSelected = false,
    this.onTap,
    this.icon,
    this.backgroundColor,
    this.selectedColor,
    this.textColor,
    this.selectedTextColor,
    this.borderColor,
    this.selectedBorderColor,
  });

  final String label;
  final bool isSelected;
  final VoidCallback? onTap;
  final IconData? icon;
  final Color? backgroundColor;
  final Color? selectedColor;
  final Color? textColor;
  final Color? selectedTextColor;
  final Color? borderColor;
  final Color? selectedBorderColor;

  @override
  Widget build(BuildContext context) {
    final effectiveBackgroundColor = isSelected
        ? (selectedColor ?? DesignTokens.accentEco.withOpacity(0.1))
        : (backgroundColor ?? DesignTokens.surface);
    
    final effectiveTextColor = isSelected
        ? (selectedTextColor ?? DesignTokens.accentEco)
        : (textColor ?? DesignTokens.textInk);
    
    final effectiveBorderColor = isSelected
        ? (selectedBorderColor ?? DesignTokens.accentEco)
        : (borderColor ?? DesignTokens.borderDivider);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: DesignTokens.spacingMd,
          vertical: DesignTokens.spacingSm,
        ),
        decoration: BoxDecoration(
          color: effectiveBackgroundColor,
          borderRadius: BorderRadius.circular(DesignTokens.radiusFull),
          border: Border.all(
            color: effectiveBorderColor,
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                size: 16,
                color: effectiveTextColor,
              ),
              const SizedBox(width: DesignTokens.spacingXs),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: DesignTokens.fontSizeSm,
                fontWeight: DesignTokens.fontWeightMedium,
                color: effectiveTextColor,
                letterSpacing: DesignTokens.letterSpacingNormal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Specialized chip for categories
class CategoryChip extends AppChip {
  const CategoryChip({
    super.key,
    required super.label,
    super.isSelected = false,
    super.onTap,
    super.icon,
  }) : super(
          backgroundColor: DesignTokens.surface,
          selectedColor: DesignTokens.accentEco.withOpacity(0.1),
          textColor: DesignTokens.textSecondary,
          selectedTextColor: DesignTokens.accentEco,
          borderColor: DesignTokens.borderDivider,
          selectedBorderColor: DesignTokens.accentEco,
        );
}

/// Specialized chip for filters
class FilterChip extends AppChip {
  const FilterChip({
    super.key,
    required super.label,
    super.isSelected = false,
    super.onTap,
    super.icon,
  }) : super(
          backgroundColor: DesignTokens.background,
          selectedColor: DesignTokens.accentEco,
          textColor: DesignTokens.textInk,
          selectedTextColor: DesignTokens.background,
          borderColor: DesignTokens.borderDivider,
          selectedBorderColor: DesignTokens.accentEco,
        );
}

/// Specialized chip for tags
class TagChip extends AppChip {
  const TagChip({
    super.key,
    required super.label,
    super.onTap,
    super.icon,
  }) : super(
          backgroundColor: DesignTokens.surface,
          textColor: DesignTokens.textSecondary,
          borderColor: DesignTokens.borderDivider,
        );
}

