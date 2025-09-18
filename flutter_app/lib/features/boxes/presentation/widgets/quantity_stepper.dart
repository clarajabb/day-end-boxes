import 'package:flutter/material.dart';

import '../../../../design_system/design_system.dart';

/// Quantity stepper for selecting number of items
class QuantityStepper extends StatelessWidget {
  const QuantityStepper({
    super.key,
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
  });

  final int value;
  final int min;
  final int max;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: DesignTokens.surface,
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        border: Border.all(color: DesignTokens.borderDivider),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Decrease Button
          _buildButton(
            icon: Icons.remove,
            onPressed: value > min ? () => onChanged(value - 1) : null,
          ),
          
          // Value Display
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: DesignTokens.spacingLg,
              vertical: DesignTokens.spacingMd,
            ),
            child: Text(
              value.toString(),
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: DesignTokens.textInk,
                fontWeight: DesignTokens.fontWeightMedium,
              ),
            ),
          ),
          
          // Increase Button
          _buildButton(
            icon: Icons.add,
            onPressed: value < max ? () => onChanged(value + 1) : null,
          ),
        ],
      ),
    );
  }

  Widget _buildButton({
    required IconData icon,
    required VoidCallback? onPressed,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        child: Container(
          padding: const EdgeInsets.all(DesignTokens.spacingMd),
          child: Icon(
            icon,
            size: 20,
            color: onPressed != null ? DesignTokens.textInk : DesignTokens.textTertiary,
          ),
        ),
      ),
    );
  }
}
