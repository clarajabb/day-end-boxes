import '../../../../core/core.dart';

/// Repository interface for boxes operations
abstract class IBoxesRepository {
  /// Get nearby boxes based on location and filters
  Future<List<Box>> getNearbyBoxes(NearbyBoxesRequest request);
  
  /// Get box details by ID
  Future<Box> getBoxById(String boxId);
  
  /// Search boxes by query
  Future<List<Box>> searchBoxes(String query);
  
  /// Get boxes by merchant ID
  Future<List<Box>> getBoxesByMerchant(String merchantId);
}

/// Request model for nearby boxes
class NearbyBoxesRequest {
  final double latitude;
  final double longitude;
  final double radius;
  final String? category;
  final String? searchQuery;
  final int page;
  final int limit;

  const NearbyBoxesRequest({
    required this.latitude,
    required this.longitude,
    this.radius = 10.0,
    this.category,
    this.searchQuery,
    this.page = 1,
    this.limit = 20,
  });

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'radius': radius,
      if (category != null) 'category': category,
      if (searchQuery != null) 'search': searchQuery,
      'page': page,
      'limit': limit,
    };
  }
}

