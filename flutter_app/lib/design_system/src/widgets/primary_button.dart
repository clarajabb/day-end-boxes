import 'package:flutter/material.dart';
import 'package:flutter_haptic_feedback/flutter_haptic_feedback.dart';
import '../../tokens/tokens.dart';

/// Primary button following Uber/Uber Eats design principles
/// Clean, high-contrast, with haptic feedback
class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.isDisabled = false,
    this.size = PrimaryButtonSize.large,
    this.icon,
    this.fullWidth = false,
  });

  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isDisabled;
  final PrimaryButtonSize size;
  final IconData? icon;
  final bool fullWidth;

  @override
  Widget build(BuildContext context) {
    final isEnabled = onPressed != null && !isLoading && !isDisabled;
    
    return SizedBox(
      width: fullWidth ? double.infinity : null,
      height: size.height,
      child: ElevatedButton(
        onPressed: isEnabled ? _handlePress : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: isEnabled 
              ? DesignTokens.accentEco 
              : DesignTokens.textDisabled,
          foregroundColor: DesignTokens.background,
          elevation: isEnabled ? DesignTokens.elevationSm : 0,
          shadowColor: isEnabled 
              ? DesignTokens.accentEco.withOpacity(0.3) 
              : Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
          ),
          padding: EdgeInsets.symmetric(
            horizontal: size.horizontalPadding,
            vertical: size.verticalPadding,
          ),
        ),
        child: isLoading
            ? SizedBox(
                width: size.iconSize,
                height: size.iconSize,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    DesignTokens.background,
                  ),
                ),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (icon != null) ...[
                    Icon(
                      icon,
                      size: size.iconSize,
                      color: DesignTokens.background,
                    ),
                    SizedBox(width: size.iconSpacing),
                  ],
                  Text(
                    text,
                    style: TextStyle(
                      fontSize: size.fontSize,
                      fontWeight: DesignTokens.fontWeightMedium,
                      letterSpacing: DesignTokens.letterSpacingWide,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  void _handlePress() {
    FlutterHapticFeedback.lightImpact();
    onPressed?.call();
  }
}

/// Button size variants
enum PrimaryButtonSize {
  small(48.0, 12.0, 8.0, 16.0, 16.0, 4.0),
  medium(56.0, 16.0, 12.0, 18.0, 20.0, 8.0),
  large(64.0, 24.0, 16.0, 20.0, 24.0, 8.0);

  const PrimaryButtonSize(
    this.height,
    this.horizontalPadding,
    this.verticalPadding,
    this.fontSize,
    this.iconSize,
    this.iconSpacing,
  );

  final double height;
  final double horizontalPadding;
  final double verticalPadding;
  final double fontSize;
  final double iconSize;
  final double iconSpacing;
}
