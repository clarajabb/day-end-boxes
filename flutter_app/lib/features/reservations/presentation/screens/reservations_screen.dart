import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../design_system/design_system.dart';
import '../../../../core/core.dart';

/// Reservations screen showing active and past reservations
class ReservationsScreen extends ConsumerStatefulWidget {
  const ReservationsScreen({super.key});

  @override
  ConsumerState<ReservationsScreen> createState() => _ReservationsScreenState();
}

class _ReservationsScreenState extends ConsumerState<ReservationsScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignTokens.background,
      appBar: AppBar(
        backgroundColor: DesignTokens.background,
        elevation: 0,
        title: Text(
          'My Reservations',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: DesignTokens.textInk,
            fontWeight: DesignTokens.fontWeightBold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.of(context).pop(),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: DesignTokens.accentEco,
          labelColor: DesignTokens.accentEco,
          unselectedLabelColor: DesignTokens.textSecondary,
          tabs: const [
            Tab(text: 'Active'),
            Tab(text: 'History'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildActiveReservations(),
          _buildReservationHistory(),
        ],
      ),
    );
  }

  Widget _buildActiveReservations() {
    return Consumer(
      builder: (context, ref, child) {
        final reservationsAsync = ref.watch(activeReservationsProvider);
        
        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(activeReservationsProvider);
          },
          child: reservationsAsync.when(
            data: (reservations) {
              if (reservations.isEmpty) {
                return _buildEmptyActiveReservations();
              }
              
              return ListView.builder(
                padding: const EdgeInsets.all(DesignTokens.spacingLg),
                itemCount: reservations.length,
                itemBuilder: (context, index) {
                  final reservation = reservations[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: DesignTokens.spacingLg),
                    child: _buildReservationCard(
                      id: reservation.id,
                      merchantName: reservation.box.merchant.businessName,
                      boxName: reservation.box.name,
                      pickupTime: '${reservation.box.pickupStartTime} - ${reservation.box.pickupEndTime}',
                      price: reservation.totalAmount,
                      status: reservation.status.name.toUpperCase(),
                      onTap: () => _showReservationDetails(reservation.id),
                    ),
                  );
                },
              );
            },
            loading: () => _buildLoadingState(),
            error: (error, stack) => _buildErrorState(error),
          ),
        );
      },
    );
  }

  Widget _buildReservationHistory() {
    return RefreshIndicator(
      onRefresh: () async {
        // Refresh reservations data
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(DesignTokens.spacingLg),
        itemCount: 5, // Mock data
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.only(bottom: DesignTokens.spacingLg),
            child: _buildReservationCard(
              id: 'reservation_$index',
              merchantName: 'Fresh Bakery',
              boxName: 'Bakery Box',
              pickupTime: '16:00 - 18:00',
              price: 5000,
              status: 'COMPLETED',
              onTap: () => _showReservationDetails('reservation_$index'),
            ),
          );
        },
      ),
    );
  }

  Widget _buildReservationCard({
    required String id,
    required String merchantName,
    required String boxName,
    required String pickupTime,
    required int price,
    required String status,
    required VoidCallback onTap,
  }) {
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
              // Header with status
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
                  _buildStatusChip(status),
                ],
              ),
              
              SizedBox(height: DesignTokens.spacingSm),
              
              // Box name
              Text(
                boxName,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: DesignTokens.textInk,
                ),
              ),
              
              SizedBox(height: DesignTokens.spacingSm),
              
              // Pickup time and price
              Row(
                children: [
                  Icon(
                    Icons.access_time,
                    size: 16,
                    color: DesignTokens.textSecondary,
                  ),
                  SizedBox(width: DesignTokens.spacingXs),
                  Text(
                    pickupTime,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: DesignTokens.textSecondary,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    'LBP ${_formatPrice(price)}',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: DesignTokens.accentEco,
                      fontWeight: DesignTokens.fontWeightMedium,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color backgroundColor;
    Color textColor;
    
    switch (status) {
      case 'ACTIVE':
        backgroundColor = DesignTokens.accentEco;
        textColor = DesignTokens.background;
        break;
      case 'COMPLETED':
        backgroundColor = DesignTokens.textSecondary;
        textColor = DesignTokens.background;
        break;
      case 'CANCELLED':
        backgroundColor = DesignTokens.danger;
        textColor = DesignTokens.background;
        break;
      default:
        backgroundColor = DesignTokens.surface;
        textColor = DesignTokens.textSecondary;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: DesignTokens.spacingSm,
        vertical: DesignTokens.spacingXs,
      ),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(DesignTokens.radiusSm),
      ),
      child: Text(
        status,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: textColor,
          fontWeight: DesignTokens.fontWeightMedium,
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

  Widget _buildEmptyActiveReservations() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_cart_outlined,
            size: 64,
            color: DesignTokens.textTertiary,
          ),
          SizedBox(height: DesignTokens.spacingLg),
          Text(
            'No Active Reservations',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: DesignTokens.textSecondary,
              fontWeight: DesignTokens.fontWeightMedium,
            ),
          ),
          SizedBox(height: DesignTokens.spacingSm),
          Text(
            'Your active reservations will appear here',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: DesignTokens.textTertiary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(DesignTokens.accentEco),
      ),
    );
  }

  Widget _buildErrorState(Object error) {
    return Center(
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
            'Failed to load reservations',
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
        ],
      ),
    );
  }

  void _showReservationDetails(String reservationId) {
    // TODO: Navigate to reservation details screen
  }
}
