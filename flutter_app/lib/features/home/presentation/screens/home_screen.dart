import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../design_system/design_system.dart';
import '../../../../core/core.dart';
import '../../../boxes/presentation/widgets/box_card.dart';
import '../../../boxes/presentation/widgets/filter_chips.dart';
import '../../../boxes/presentation/widgets/search_bar.dart';
import '../../../boxes/presentation/widgets/location_chip.dart';

/// Home screen with nearby boxes discovery
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  final _scrollController = ScrollController();
  
  String _selectedCategory = 'all';
  String _searchQuery = '';
  bool _isListView = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _requestLocationPermission();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _requestLocationPermission() async {
    final locationService = ref.read(locationServiceProvider);
    final hasPermission = await locationService.hasLocationPermission();
    
    if (!hasPermission) {
      final granted = await locationService.requestLocationPermissionWithExplanation();
      if (granted) {
        // Log analytics
        final analytics = ref.read(analyticsServiceProvider);
        await analytics.logLocationPermissionGranted();
      } else {
        // Log analytics
        final analytics = ref.read(analyticsServiceProvider);
        await analytics.logLocationPermissionDenied();
      }
    }
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query;
    });
  }

  void _onCategoryChanged(String category) {
    setState(() {
      _selectedCategory = category;
    });
  }

  void _toggleView() {
    setState(() {
      _isListView = !_isListView;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignTokens.background,
      appBar: AppBar(
        backgroundColor: DesignTokens.background,
        elevation: 0,
        title: Text(
          'Day-End Boxes',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: DesignTokens.textInk,
            fontWeight: DesignTokens.fontWeightBold,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(_isListView ? Icons.map_outlined : Icons.list_outlined),
            onPressed: _toggleView,
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.go('/profile'),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(120),
          child: Column(
            children: [
              // Location Chip
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: DesignTokens.spacingLg),
                child: LocationChip(
                  onTap: () => _requestLocationPermission(),
                ),
              ),
              
              SizedBox(height: DesignTokens.spacingMd),
              
              // Search Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: DesignTokens.spacingLg),
                child: SearchBar(
                  onChanged: _onSearchChanged,
                ),
              ),
              
              SizedBox(height: DesignTokens.spacingMd),
              
              // Filter Chips
              FilterChips(
                selectedCategory: _selectedCategory,
                onCategoryChanged: _onCategoryChanged,
              ),
            ],
          ),
        ),
      ),
      body: Column(
        children: [
          // Tab Bar
          Container(
            color: DesignTokens.background,
            child: TabBar(
              controller: _tabController,
              indicatorColor: DesignTokens.accentEco,
              labelColor: DesignTokens.accentEco,
              unselectedLabelColor: DesignTokens.textSecondary,
              tabs: const [
                Tab(text: 'Nearby'),
                Tab(text: 'Favorites'),
              ],
            ),
          ),
          
          // Tab Content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildNearbyTab(),
                _buildFavoritesTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNearbyTab() {
    return Consumer(
      builder: (context, ref, child) {
        final locationAsync = ref.watch(currentLocationProvider);
        
        return locationAsync.when(
          data: (location) => _buildBoxesList(location),
          loading: () => _buildLoadingState(),
          error: (error, stack) => _buildErrorState(error),
        );
      },
    );
  }

  Widget _buildBoxesList(GeoPoint location) {
    final request = NearbyBoxesRequest(
      latitude: location.latitude,
      longitude: location.longitude,
      radius: 10.0,
      category: _selectedCategory == 'all' ? null : _selectedCategory,
      searchQuery: _searchQuery.isEmpty ? null : _searchQuery,
    );

    return Consumer(
      builder: (context, ref, child) {
        final boxesAsync = ref.watch(nearbyBoxesProvider(request));
        
        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(nearbyBoxesProvider(request));
          },
          child: boxesAsync.when(
            data: (boxes) {
              if (boxes.isEmpty) {
                return _buildEmptyState();
              }
              
              return ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(DesignTokens.spacingLg),
                itemCount: boxes.length,
                itemBuilder: (context, index) {
                  final box = boxes[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: DesignTokens.spacingLg),
                    child: BoxCard(
                      id: box.id,
                      name: box.name,
                      merchantName: box.merchant.businessName,
                      originalPrice: box.originalPrice,
                      discountedPrice: box.discountedPrice,
                      rating: box.merchant.rating,
                      distance: _calculateDistance(location, box.merchant.coordinates),
                      imageUrl: box.imageUrl ?? 'https://example.com/box.jpg',
                      pickupWindow: '${box.pickupStartTime} - ${box.pickupEndTime}',
                      onTap: () => context.go('/box/${box.id}'),
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

  Widget _buildFavoritesTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.favorite_outline,
            size: 64,
            color: DesignTokens.textTertiary,
          ),
          SizedBox(height: DesignTokens.spacingLg),
          Text(
            'No Favorites Yet',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: DesignTokens.textSecondary,
              fontWeight: DesignTokens.fontWeightMedium,
            ),
          ),
          SizedBox(height: DesignTokens.spacingSm),
          Text(
            'Tap the heart icon on boxes you like to save them here',
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
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(DesignTokens.accentEco),
          ),
          SizedBox(height: DesignTokens.spacingLg),
          Text(
            'Finding nearby boxes...',
            style: TextStyle(color: DesignTokens.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.restaurant_outlined,
            size: 64,
            color: DesignTokens.textTertiary,
          ),
          SizedBox(height: DesignTokens.spacingLg),
          Text(
            'No boxes nearby',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: DesignTokens.textSecondary,
              fontWeight: DesignTokens.fontWeightMedium,
            ),
          ),
          SizedBox(height: DesignTokens.spacingSm),
          Text(
            'Try widening your search radius or check back later',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: DesignTokens.textTertiary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
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
            'Something went wrong',
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
    );
  }

  double _calculateDistance(GeoPoint location1, GeoPoint location2) {
    // Simple distance calculation (in km)
    const double earthRadius = 6371; // Earth's radius in kilometers
    
    final lat1Rad = location1.latitude * (3.14159265359 / 180);
    final lat2Rad = location2.latitude * (3.14159265359 / 180);
    final deltaLatRad = (location2.latitude - location1.latitude) * (3.14159265359 / 180);
    final deltaLngRad = (location2.longitude - location1.longitude) * (3.14159265359 / 180);

    final a = (deltaLatRad / 2).sin() * (deltaLatRad / 2).sin() +
        lat1Rad.cos() * lat2Rad.cos() *
        (deltaLngRad / 2).sin() * (deltaLngRad / 2).sin();
    final c = 2 * (a.sqrt()).asin();

    return earthRadius * c;
  }
}