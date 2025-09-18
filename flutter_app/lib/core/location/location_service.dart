import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

import '../models/models.dart';
import '../env/environment.dart';

part 'location_service.g.dart';

/// Location service for handling GPS and permissions
class LocationService {
  LocationService._();
  
  static final LocationService instance = LocationService._();
  
  /// Check if location services are enabled
  Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }
  
  /// Check location permission status
  Future<LocationPermission> checkPermission() async {
    return await Geolocator.checkPermission();
  }
  
  /// Request location permission
  Future<LocationPermission> requestPermission() async {
    return await Geolocator.requestPermission();
  }
  
  /// Get current position
  Future<Position> getCurrentPosition() async {
    final permission = await checkPermission();
    
    if (permission == LocationPermission.denied) {
      final newPermission = await requestPermission();
      if (newPermission == LocationPermission.denied) {
        throw LocationException('Location permission denied');
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      throw LocationException('Location permission permanently denied');
    }
    
    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
      timeLimit: const Duration(seconds: 30),
    );
  }
  
  /// Get current location as GeoPoint
  Future<GeoPoint> getCurrentLocation() async {
    try {
      final position = await getCurrentPosition();
      return GeoPoint(
        latitude: position.latitude,
        longitude: position.longitude,
      );
    } catch (e) {
      // Return default Beirut location if GPS fails
      return const GeoPoint(
        latitude: Environment.defaultLatitude,
        longitude: Environment.defaultLongitude,
      );
    }
  }
  
  /// Calculate distance between two points in kilometers
  double calculateDistance(GeoPoint point1, GeoPoint point2) {
    return Geolocator.distanceBetween(
      point1.latitude,
      point1.longitude,
      point2.latitude,
      point2.longitude,
    ) / 1000; // Convert to kilometers
  }
  
  /// Check if location is within radius
  bool isWithinRadius(
    GeoPoint location,
    GeoPoint center,
    double radiusKm,
  ) {
    final distance = calculateDistance(location, center);
    return distance <= radiusKm;
  }
  
  /// Get location stream for real-time updates
  Stream<Position> getLocationStream() {
    return Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // Update every 10 meters
      ),
    );
  }
  
  /// Open location settings
  Future<void> openLocationSettings() async {
    await Geolocator.openLocationSettings();
  }
  
  /// Open app settings
  Future<void> openAppSettings() async {
    await openAppSettings();
  }
  
  /// Check if location permission is granted
  Future<bool> hasLocationPermission() async {
    final permission = await checkPermission();
    return permission == LocationPermission.always ||
           permission == LocationPermission.whileInUse;
  }
  
  /// Request location permission with explanation
  Future<bool> requestLocationPermissionWithExplanation() async {
    final status = await Permission.location.request();
    return status == PermissionStatus.granted;
  }
}

/// Location service provider
@riverpod
LocationService locationService(LocationServiceRef ref) {
  return LocationService.instance;
}

/// Current location provider
@riverpod
Future<GeoPoint> currentLocation(CurrentLocationRef ref) async {
  final locationService = ref.watch(locationServiceProvider);
  return await locationService.getCurrentLocation();
}

/// Location permission status provider
@riverpod
Future<bool> locationPermissionStatus(LocationPermissionStatusRef ref) async {
  final locationService = ref.watch(locationServiceProvider);
  return await locationService.hasLocationPermission();
}

/// Location exception
class LocationException implements Exception {
  final String message;
  const LocationException(this.message);
  
  @override
  String toString() => 'LocationException: $message';
}
