import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/custom_app_bar.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../boxes/presentation/providers/boxes_provider.dart';
import '../../../boxes/presentation/widgets/box_card.dart';
import '../../../boxes/presentation/widgets/category_filter.dart';
import '../../../location/presentation/providers/location_provider.dart';
import '../widgets/map_view.dart';
import '../widgets/search_header.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isMapView = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    
    // Request location permission and get current location
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(locationProvider.notifier).getCurrentLocation();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final locationState = ref.watch(locationProvider);
    final boxesState = ref.watch(nearbyBoxesProvider);

    return Scaffold(
      appBar: CustomAppBar(
        title: AppConfig.appName,
        actions: [
          IconButton(
            icon: Icon(_isMapView ? Icons.list : Icons.map),
            onPressed: () {
              setState(() {
                _isMapView = !_isMapView;
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Header
          const SearchHeader(),
          
          // Category Filter
          const CategoryFilter(),
          
          // Content
          Expanded(
            child: locationState.when(
              data: (location) {
                if (location == null) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.location_off,
                          size: 64,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Location access is required to find nearby boxes',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  );
                }
                
                return _isMapView 
                    ? MapView(userLocation: location)
                    : _buildListView(boxesState);
              },
              loading: () => const LoadingWidget(),
              error: (error, stackTrace) => CustomErrorWidget(
                message: 'Failed to get your location',
                onRetry: () {
                  ref.read(locationProvider.notifier).getCurrentLocation();
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListView(AsyncValue<List<BoxInventoryWithMerchant>> boxesState) {
    return boxesState.when(
      data: (boxes) {
        if (boxes.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.shopping_bag_outlined,
                  size: 64,
                  color: Colors.grey,
                ),
                SizedBox(height: 16),
                Text(
                  'No boxes available in your area',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Try expanding your search radius or check back later',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          );
        }
        
        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(nearbyBoxesProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(AppConfig.defaultPadding),
            itemCount: boxes.length,
            itemBuilder: (context, index) {
              final box = boxes[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: AppConfig.defaultPadding),
                child: BoxCard(box: box),
              );
            },
          ),
        );
      },
      loading: () => const LoadingWidget(),
      error: (error, stackTrace) => CustomErrorWidget(
        message: 'Failed to load nearby boxes',
        onRetry: () {
          ref.invalidate(nearbyBoxesProvider);
        },
      ),
    );
  }
}
