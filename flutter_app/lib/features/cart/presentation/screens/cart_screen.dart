import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../design_system/design_system.dart';
import '../../../../core/core.dart';

/// Cart/Checkout screen with payment methods and reservation timer
class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  String _selectedPaymentMethod = 'cash';
  bool _isLoading = false;
  int _reservationTimer = 600; // 10 minutes in seconds
  
  @override
  void initState() {
    super.initState();
    _startReservationTimer();
  }

  void _startReservationTimer() {
    // TODO: Implement actual timer logic
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignTokens.background,
      appBar: AppBar(
        backgroundColor: DesignTokens.background,
        elevation: 0,
        title: Text(
          'Reservation',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: DesignTokens.textInk,
            fontWeight: DesignTokens.fontWeightBold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(DesignTokens.spacingLg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Reservation Timer
            _buildReservationTimer(),
            
            SizedBox(height: DesignTokens.spacingXl),
            
            // Box Details
            _buildBoxDetails(),
            
            SizedBox(height: DesignTokens.spacingXl),
            
            // Pickup Information
            _buildPickupInfo(),
            
            SizedBox(height: DesignTokens.spacingXl),
            
            // Payment Methods
            _buildPaymentMethods(),
            
            SizedBox(height: DesignTokens.spacingXl),
            
            // Promo Code
            _buildPromoCode(),
            
            SizedBox(height: DesignTokens.spacingXl),
            
            // Price Breakdown
            _buildPriceBreakdown(),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(DesignTokens.spacingLg),
        decoration: BoxDecoration(
          color: DesignTokens.background,
          boxShadow: DesignShadows.lg,
        ),
        child: PrimaryButton(
          text: 'Confirm Reservation',
          onPressed: _isLoading ? null : _confirmReservation,
          isLoading: _isLoading,
          fullWidth: true,
          icon: Icons.check_circle_outline,
        ),
      ),
    );
  }

  Widget _buildReservationTimer() {
    final minutes = _reservationTimer ~/ 60;
    final seconds = _reservationTimer % 60;
    
    return Container(
      padding: const EdgeInsets.all(DesignTokens.spacingLg),
      decoration: BoxDecoration(
        color: DesignTokens.danger.withOpacity(0.1),
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        border: Border.all(color: DesignTokens.danger.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(
            Icons.timer_outlined,
            color: DesignTokens.danger,
            size: 24,
          ),
          SizedBox(width: DesignTokens.spacingMd),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Reservation expires in',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: DesignTokens.textSecondary,
                  ),
                ),
                Text(
                  '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: DesignTokens.danger,
                    fontWeight: DesignTokens.fontWeightBold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBoxDetails() {
    return Container(
      padding: const EdgeInsets.all(DesignTokens.spacingLg),
      decoration: BoxDecoration(
        color: DesignTokens.surface,
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        border: Border.all(color: DesignTokens.borderDivider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Box Details',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: DesignTokens.textInk,
              fontWeight: DesignTokens.fontWeightMedium,
            ),
          ),
          SizedBox(height: DesignTokens.spacingLg),
          
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(DesignTokens.radiusMd),
                child: Image.network(
                  'https://example.com/box.jpg',
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: DesignTokens.surface,
                        borderRadius: BorderRadius.circular(DesignTokens.radiusMd),
                      ),
                      child: const Icon(
                        Icons.restaurant,
                        color: DesignTokens.textTertiary,
                      ),
                    );
                  },
                ),
              ),
              SizedBox(width: DesignTokens.spacingLg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Surprise Box',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: DesignTokens.textInk,
                        fontWeight: DesignTokens.fontWeightMedium,
                      ),
                    ),
                    SizedBox(height: DesignTokens.spacingXs),
                    Text(
                      'Café Central',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: DesignTokens.textSecondary,
                      ),
                    ),
                    SizedBox(height: DesignTokens.spacingXs),
                    Text(
                      'Quantity: 1',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: DesignTokens.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                'LBP 7,500',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
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

  Widget _buildPickupInfo() {
    return Container(
      padding: const EdgeInsets.all(DesignTokens.spacingLg),
      decoration: BoxDecoration(
        color: DesignTokens.surface,
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        border: Border.all(color: DesignTokens.borderDivider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Pickup Information',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: DesignTokens.textInk,
              fontWeight: DesignTokens.fontWeightMedium,
            ),
          ),
          SizedBox(height: DesignTokens.spacingLg),
          
          Row(
            children: [
              Icon(
                Icons.access_time,
                color: DesignTokens.textSecondary,
                size: 20,
              ),
              SizedBox(width: DesignTokens.spacingSm),
              Text(
                'Today, 18:00 - 20:00',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: DesignTokens.textInk,
                  fontWeight: DesignTokens.fontWeightMedium,
                ),
              ),
            ],
          ),
          SizedBox(height: DesignTokens.spacingSm),
          
          Row(
            children: [
              Icon(
                Icons.location_on_outlined,
                color: DesignTokens.textSecondary,
                size: 20,
              ),
              SizedBox(width: DesignTokens.spacingSm),
              Expanded(
                child: Text(
                  'Café Central, Hamra Street, Beirut',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: DesignTokens.textInk,
                    fontWeight: DesignTokens.fontWeightMedium,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethods() {
    return Container(
      padding: const EdgeInsets.all(DesignTokens.spacingLg),
      decoration: BoxDecoration(
        color: DesignTokens.surface,
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        border: Border.all(color: DesignTokens.borderDivider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Payment Method',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: DesignTokens.textInk,
              fontWeight: DesignTokens.fontWeightMedium,
            ),
          ),
          SizedBox(height: DesignTokens.spacingLg),
          
          _buildPaymentOption(
            value: 'cash',
            title: 'Cash on Pickup',
            subtitle: 'Pay when you collect your box',
            icon: Icons.money_outlined,
          ),
          
          SizedBox(height: DesignTokens.spacingMd),
          
          _buildPaymentOption(
            value: 'card',
            title: 'Credit/Debit Card',
            subtitle: 'Pay securely with your card',
            icon: Icons.credit_card_outlined,
          ),
          
          SizedBox(height: DesignTokens.spacingMd),
          
          _buildPaymentOption(
            value: 'apple_pay',
            title: 'Apple Pay',
            subtitle: 'Pay with Apple Pay',
            icon: Icons.apple,
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption({
    required String value,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = _selectedPaymentMethod == value;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedPaymentMethod = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.all(DesignTokens.spacingMd),
        decoration: BoxDecoration(
          color: isSelected ? DesignTokens.accentEco.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
          border: Border.all(
            color: isSelected ? DesignTokens.accentEco : DesignTokens.borderDivider,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? DesignTokens.accentEco : DesignTokens.textSecondary,
              size: 24,
            ),
            SizedBox(width: DesignTokens.spacingLg),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: DesignTokens.textInk,
                      fontWeight: DesignTokens.fontWeightMedium,
                    ),
                  ),
                  SizedBox(height: DesignTokens.spacingXs),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: DesignTokens.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Radio<String>(
              value: value,
              groupValue: _selectedPaymentMethod,
              onChanged: (value) {
                setState(() {
                  _selectedPaymentMethod = value!;
                });
              },
              activeColor: DesignTokens.accentEco,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPromoCode() {
    return Container(
      padding: const EdgeInsets.all(DesignTokens.spacingLg),
      decoration: BoxDecoration(
        color: DesignTokens.surface,
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        border: Border.all(color: DesignTokens.borderDivider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Promo Code',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: DesignTokens.textInk,
              fontWeight: DesignTokens.fontWeightMedium,
            ),
          ),
          SizedBox(height: DesignTokens.spacingLg),
          
          Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: const InputDecoration(
                    hintText: 'Enter promo code',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              SizedBox(width: DesignTokens.spacingMd),
              PrimaryButton(
                text: 'Apply',
                onPressed: () {
                  // TODO: Apply promo code
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPriceBreakdown() {
    return Container(
      padding: const EdgeInsets.all(DesignTokens.spacingLg),
      decoration: BoxDecoration(
        color: DesignTokens.surface,
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        border: Border.all(color: DesignTokens.borderDivider),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Text(
                'Box price',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DesignTokens.textSecondary,
                ),
              ),
              const Spacer(),
              Text(
                'LBP 7,500',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DesignTokens.textInk,
                ),
              ),
            ],
          ),
          SizedBox(height: DesignTokens.spacingSm),
          Row(
            children: [
              Text(
                'Service fee',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DesignTokens.textSecondary,
                ),
              ),
              const Spacer(),
              Text(
                'LBP 0',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DesignTokens.textInk,
                ),
              ),
            ],
          ),
          SizedBox(height: DesignTokens.spacingSm),
          const Divider(),
          SizedBox(height: DesignTokens.spacingSm),
          Row(
            children: [
              Text(
                'Total',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: DesignTokens.textInk,
                  fontWeight: DesignTokens.fontWeightBold,
                ),
              ),
              const Spacer(),
              Text(
                'LBP 7,500',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: DesignTokens.accentEco,
                  fontWeight: DesignTokens.fontWeightBold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _confirmReservation() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // TODO: Implement reservation confirmation
      await Future.delayed(const Duration(seconds: 2)); // Mock delay
      
      if (mounted) {
        context.go('/reservation-success');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to confirm reservation: ${e.toString()}'),
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
