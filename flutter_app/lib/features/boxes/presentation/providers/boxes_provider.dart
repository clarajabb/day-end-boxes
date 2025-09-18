import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/core.dart';
import '../../domain/repositories/boxes_repository.dart';

/// Provider for boxes repository
final boxesRepositoryProvider = Provider<IBoxesRepository>((ref) {
  return BoxesRepositoryImpl(ref.read(apiClientProvider));
});

/// Provider for nearby boxes
final nearbyBoxesProvider = FutureProvider.family<List<Box>, NearbyBoxesRequest>((ref, request) async {
  final repository = ref.read(boxesRepositoryProvider);
  return await repository.getNearbyBoxes(request);
});

/// Provider for box details
final boxDetailsProvider = FutureProvider.family<Box, String>((ref, boxId) async {
  final repository = ref.read(boxesRepositoryProvider);
  return await repository.getBoxById(boxId);
});

/// Provider for current location
final currentLocationProvider = FutureProvider<GeoPoint>((ref) async {
  final locationService = ref.read(locationServiceProvider);
  return await locationService.getCurrentLocation();
});

/// Provider for location permission
final locationPermissionProvider = FutureProvider<bool>((ref) async {
  final locationService = ref.read(locationServiceProvider);
  return await locationService.hasLocationPermission();
});
