import 'package:flutter/material.dart';

import '../../../../design_system/design_system.dart';

/// Time window badge for pickup times
class TimeWindowBadge extends StatelessWidget {
  const TimeWindowBadge({
    super.key,
    required this.startTime,
    required this.endTime,
  });

  final String startTime;
  final String endTime;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: DesignTokens.spacingMd,
        vertical: DesignTokens.spacingSm,
      ),
      decoration: BoxDecoration(
        color: DesignTokens.accentEco,
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.access_time,
            size: 16,
            color: DesignTokens.background,
          ),
          SizedBox(width: DesignTokens.spacingXs),
          Text(
            'Pickup: $startTime - $endTime',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: DesignTokens.background,
              fontWeight: DesignTokens.fontWeightMedium,
            ),
          ),
        ],
      ),
    );
  }
}

