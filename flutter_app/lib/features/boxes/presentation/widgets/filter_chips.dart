import 'package:flutter/material.dart';

import '../../../../design_system/design_system.dart';

/// Filter chips for box categories
class FilterChips extends StatelessWidget {
  const FilterChips({
    super.key,
    required this.selectedCategory,
    required this.onCategoryChanged,
  });

  final String selectedCategory;
  final ValueChanged<String> onCategoryChanged;

  static const List<Map<String, dynamic>> _categories = [
    {'id': 'all', 'name': 'All', 'icon': Icons.all_inclusive},
    {'id': 'restaurant', 'name': 'Restaurant', 'icon': Icons.restaurant},
    {'id': 'bakery', 'name': 'Bakery', 'icon': Icons.cake},
    {'id': 'dessert', 'name': 'Dessert', 'icon': Icons.icecream},
    {'id': 'fast_food', 'name': 'Fast Food', 'icon': Icons.fastfood},
    {'id': 'healthy', 'name': 'Healthy', 'icon': Icons.local_dining},
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: DesignTokens.spacingLg),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final category = _categories[index];
          final isSelected = selectedCategory == category['id'];
          
          return Padding(
            padding: const EdgeInsets.only(right: DesignTokens.spacingSm),
            child: AppChip(
              label: category['name'] as String,
              icon: category['icon'] as IconData,
              isSelected: isSelected,
              onTap: () => onCategoryChanged(category['id'] as String),
            ),
          );
        },
      ),
    );
  }
}
