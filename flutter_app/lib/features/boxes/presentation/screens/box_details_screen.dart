import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../design_system/design_system.dart';
import '../../../../core/core.dart';
import '../widgets/quantity_stepper.dart';
import '../widgets/time_window_badge.dart';

/// Box details screen with reservation flow
class BoxDetailsScreen extends ConsumerStatefulWidget {
  const BoxDetailsScreen({
    super.key,
    required this.boxId,
  });

  final String boxId;

  @override
  ConsumerState<BoxDetailsScreen> createState() => _BoxDetailsScreenState();
}

class _BoxDetailsScreenState extends ConsumerState<BoxDetailsScreen> {
  int _quantity = 1;
  bool _isFavorite = false;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, child) {
        final boxAsync = ref.watch(boxDetailsProvider(widget.boxId));
        
        return boxAsync.when(
          data: (box) => _buildBoxDetails(box),
          loading: () => _buildLoadingState(),
          error: (error, stack) => _buildErrorState(error),
        );
      },
    );
  }

  Widget _buildBoxDetails(Box box) {
    
    return Scaffold(
      backgroundColor: DesignTokens.background,
      body: CustomScrollView(
        slivers: [
          // App Bar with Image
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            backgroundColor: DesignTokens.background,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios),
              onPressed: () => context.pop(),
            ),
            actions: [
              IconButton(
                icon: Icon(_isFavorite ? Icons.favorite : Icons.favorite_border),
                onPressed: _toggleFavorite,
              ),
              IconButton(
                icon: const Icon(Icons.share_outlined),
                onPressed: _shareBox,
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    box['imageUrl'] as String,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: DesignTokens.surface,
                        child: const Icon(
                          Icons.restaurant,
                          size: 64,
                          color: DesignTokens.textTertiary,
                        ),
                      );
                    },
                  ),
                  // Gradient overlay
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.3),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(DesignTokens.spacingLg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Merchant Info
                  _buildMerchantInfo(box),
                  
                  SizedBox(height: DesignTokens.spacingLg),
                  
                  // Box Name
                  Text(
                    box['name'] as String,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: DesignTokens.textInk,
                      fontWeight: DesignTokens.fontWeightBold,
                    ),
                  ),
                  
                  SizedBox(height: DesignTokens.spacingSm),
                  
                  // Rating and Distance
                  Row(
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.star,
                            color: DesignTokens.warning,
                            size: 20,
                          ),
                          SizedBox(width: DesignTokens.spacingXs),
                          Text(
                            box['rating'].toString(),
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: DesignTokens.textInk,
                              fontWeight: DesignTokens.fontWeightMedium,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(width: DesignTokens.spacingLg),
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on_outlined,
                            color: DesignTokens.textSecondary,
                            size: 20,
                          ),
                          SizedBox(width: DesignTokens.spacingXs),
                          Text(
                            '${box['distance'].toStringAsFixed(1)} km',
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: DesignTokens.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  
                  SizedBox(height: DesignTokens.spacingLg),
                  
                  // Pickup Window
                  TimeWindowBadge(
                    startTime: box['pickupStart'] as String,
                    endTime: box['pickupEnd'] as String,
                  ),
                  
                  SizedBox(height: DesignTokens.spacingLg),
                  
                  // What's Inside
                  _buildWhatsInside(box),
                  
                  SizedBox(height: DesignTokens.spacingLg),
                  
                  // Pickup Instructions
                  _buildPickupInstructions(box),
                  
                  SizedBox(height: DesignTokens.spacingLg),
                  
                  // Price Breakdown
                  _buildPriceBreakdown(box),
                  
                  SizedBox(height: DesignTokens.spacing4xl),
                ],
              ),
            ),
          ),
        ],
      ),
      
      // Sticky Reserve Button
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(DesignTokens.spacingLg),
        decoration: BoxDecoration(
          color: DesignTokens.background,
          boxShadow: DesignShadows.lg,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Quantity Stepper
            Row(
              children: [
                Text(
                  'Quantity',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: DesignTokens.textInk,
                    fontWeight: DesignTokens.fontWeightMedium,
                  ),
                ),
                const Spacer(),
                QuantityStepper(
                  value: _quantity,
                  min: 1,
                  max: box['maxQuantity'] as int,
                  onChanged: (value) {
                    setState(() {
                      _quantity = value;
                    });
                  },
                ),
              ],
            ),
            
            SizedBox(height: DesignTokens.spacingLg),
            
            // Reserve Button
            PrimaryButton(
              text: 'Reserve for LBP ${_formatPrice((box['discountedPrice'] as int) * _quantity)}',
              onPressed: _isLoading ? null : _reserveBox,
              isLoading: _isLoading,
              fullWidth: true,
              icon: Icons.shopping_cart_outlined,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Scaffold(
      backgroundColor: DesignTokens.background,
      appBar: AppBar(
        backgroundColor: DesignTokens.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => context.pop(),
        ),
      ),
      body: const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(DesignTokens.accentEco),
        ),
      ),
    );
  }

  Widget _buildErrorState(Object error) {
    return Scaffold(
      backgroundColor: DesignTokens.background,
      appBar: AppBar(
        backgroundColor: DesignTokens.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => context.pop(),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: DesignTokens.danger,
            ),
            SizedBox(height: DesignTokens.spacingLg),
            Text(
              'Failed to load box details',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: DesignTokens.textSecondary,
                fontWeight: DesignTokens.fontWeightMedium,
              ),
            ),
            SizedBox(height: DesignTokens.spacingSm),
            Text(
              'Please check your connection and try again',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: DesignTokens.textTertiary,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: DesignTokens.spacingXl),
            PrimaryButton(
              text: 'Retry',
              onPressed: () {
                // Refresh the data
              },
              icon: Icons.refresh,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMerchantInfo(Box box) {
    return Container(
      padding: const EdgeInsets.all(DesignTokens.spacingLg),
      decoration: BoxDecoration(
        color: DesignTokens.surface,
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        border: Border.all(color: DesignTokens.borderDivider),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: DesignTokens.accentEco,
            child: Text(
              box.merchant.businessName.substring(0, 1),
              style: const TextStyle(
                color: DesignTokens.background,
                fontWeight: DesignTokens.fontWeightBold,
              ),
            ),
          ),
          SizedBox(width: DesignTokens.spacingLg),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  box.merchant.businessName,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: DesignTokens.textInk,
                    fontWeight: DesignTokens.fontWeightMedium,
                  ),
                ),
                SizedBox(height: DesignTokens.spacingXs),
                Text(
                  'Open until 22:00', // TODO: Get from merchant hours
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: DesignTokens.accentEco,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.phone_outlined),
            onPressed: _callMerchant,
          ),
        ],
      ),
    );
  }

  Widget _buildWhatsInside(Box box) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'What\'s typically inside',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: DesignTokens.textInk,
            fontWeight: DesignTokens.fontWeightMedium,
          ),
        ),
        SizedBox(height: DesignTokens.spacingSm),
        Wrap(
          spacing: DesignTokens.spacingSm,
          runSpacing: DesignTokens.spacingSm,
          children: box.contents.map((item) {
            return AppChip(
              label: item,
              isSelected: false,
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildPickupInstructions(Box box) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Pickup Instructions',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: DesignTokens.textInk,
            fontWeight: DesignTokens.fontWeightMedium,
          ),
        ),
        SizedBox(height: DesignTokens.spacingSm),
        Text(
          box.pickupInstructions,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: DesignTokens.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildPriceBreakdown(Box box) {
    final originalPrice = box.originalPrice;
    final discountedPrice = box.discountedPrice;
    final savings = originalPrice - discountedPrice;
    final savingsPercentage = ((savings / originalPrice) * 100).round();

    return Container(
      padding: const EdgeInsets.all(DesignTokens.spacingLg),
      decoration: BoxDecoration(
        color: DesignTokens.accentEco.withOpacity(0.1),
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        border: Border.all(color: DesignTokens.accentEco.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Text(
                'You save',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DesignTokens.textSecondary,
                ),
              ),
              const Spacer(),
              Text(
                'LBP ${_formatPrice(savings)}',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: DesignTokens.accentEco,
                  fontWeight: DesignTokens.fontWeightBold,
                ),
              ),
            ],
          ),
          SizedBox(height: DesignTokens.spacingSm),
          Row(
            children: [
              Text(
                'Original price',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DesignTokens.textTertiary,
                ),
              ),
              const Spacer(),
              Text(
                'LBP ${_formatPrice(originalPrice)}',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DesignTokens.textTertiary,
                  decoration: TextDecoration.lineThrough,
                ),
              ),
            ],
          ),
          SizedBox(height: DesignTokens.spacingSm),
          Row(
            children: [
              Text(
                'Your price',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: DesignTokens.textInk,
                  fontWeight: DesignTokens.fontWeightMedium,
                ),
              ),
              const Spacer(),
              Text(
                'LBP ${_formatPrice(discountedPrice)}',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: DesignTokens.textInk,
                  fontWeight: DesignTokens.fontWeightBold,
                ),
              ),
            ],
          ),
          SizedBox(height: DesignTokens.spacingSm),
          Row(
            children: [
              Text(
                'Savings',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DesignTokens.textSecondary,
                ),
              ),
              const Spacer(),
              Text(
                '$savingsPercentage% off',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DesignTokens.accentEco,
                  fontWeight: DesignTokens.fontWeightMedium,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatPrice(int price) {
    return price.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match match) => '${match[1]},',
    );
  }

  void _toggleFavorite() {
    setState(() {
      _isFavorite = !_isFavorite;
    });
  }

  void _shareBox() {
    // TODO: Implement share functionality
  }

  void _callMerchant() {
    // TODO: Implement call functionality
  }

  Future<void> _reserveBox() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final boxAsync = ref.read(boxDetailsProvider(widget.boxId));
      final box = await boxAsync.future;
      
      final request = CreateReservationRequest(
        boxId: box.id,
        quantity: _quantity,
        paymentMethod: 'cash', // Default to cash
      );
      
      final reservation = await ref.read(createReservationProvider(request).future);
      
      if (mounted) {
        context.go('/cart');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to reserve box: ${e.toString()}'),
            backgroundColor: DesignTokens.danger,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
}
