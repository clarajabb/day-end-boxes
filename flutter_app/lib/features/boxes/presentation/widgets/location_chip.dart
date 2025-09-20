import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../design_system/design_system.dart';
import '../../../../core/core.dart';

/// Location chip showing current location
class LocationChip extends ConsumerWidget {
  const LocationChip({
    super.key,
    required this.onTap,
  });

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locationAsync = ref.watch(currentLocationProvider);
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: DesignTokens.spacingMd,
          vertical: DesignTokens.spacingSm,
        ),
        decoration: BoxDecoration(
          color: DesignTokens.surface,
          borderRadius: BorderRadius.circular(DesignTokens.radiusFull),
          border: Border.all(color: DesignTokens.borderDivider),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.location_on_outlined,
              size: 16,
              color: DesignTokens.accentEco,
            ),
            SizedBox(width: DesignTokens.spacingXs),
            locationAsync.when(
              data: (location) => Text(
                'Beirut, Lebanon', // TODO: Get actual location name
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DesignTokens.textInk,
                  fontWeight: DesignTokens.fontWeightMedium,
                ),
              ),
              loading: () => Text(
                'Getting location...',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DesignTokens.textSecondary,
                ),
              ),
              error: (error, stack) => Text(
                'Enable location',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DesignTokens.textSecondary,
                ),
              ),
            ),
            SizedBox(width: DesignTokens.spacingXs),
            Icon(
              Icons.keyboard_arrow_down,
              size: 16,
              color: DesignTokens.textSecondary,
            ),
          ],
        ),
      ),
    );
  }
}

