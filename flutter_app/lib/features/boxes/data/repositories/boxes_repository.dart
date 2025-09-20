import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../../core/api/api_client.dart';
import '../../../../core/models/models.dart';

part 'boxes_repository.g.dart';

/// Boxes repository interface
abstract class BoxesRepository {
  Future<BoxListResponse> getNearbyBoxes({
    required double latitude,
    required double longitude,
    double? radius,
    String? category,
    List<String>? dietaryInfo,
    double? maxPrice,
    double? minPrice,
    String? merchantId,
    String? searchQuery,
  });
  
  Future<BoxDetailsResponse> getBoxDetails(String id);
}

/// Boxes repository implementation
class BoxesRepositoryImpl implements BoxesRepository {
  const BoxesRepositoryImpl(this._apiClient);
  
  final ApiClient _apiClient;
  
  @override
  Future<BoxListResponse> getNearbyBoxes({
    required double latitude,
    required double longitude,
    double? radius,
    String? category,
    List<String>? dietaryInfo,
    double? maxPrice,
    double? minPrice,
    String? merchantId,
    String? searchQuery,
  }) async {
    try {
      final queries = <String, dynamic>{
        'latitude': latitude,
        'longitude': longitude,
      };
      
      if (radius != null) {
        queries['radius'] = radius;
      }
      if (category != null && category.isNotEmpty) {
        queries['category'] = category;
      }
      if (dietaryInfo != null && dietaryInfo.isNotEmpty) {
        queries['dietary'] = dietaryInfo.join(',');
      }
      if (maxPrice != null) {
        queries['max_price'] = maxPrice;
      }
      if (minPrice != null) {
        queries['min_price'] = minPrice;
      }
      if (merchantId != null && merchantId.isNotEmpty) {
        queries['merchant_id'] = merchantId;
      }
      if (searchQuery != null && searchQuery.isNotEmpty) {
        queries['q'] = searchQuery;
      }
      
      final response = await _apiClient.getNearbyBoxes(queries);
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to get nearby boxes';
        return BoxListResponse(
          success: false,
          data: const [],
          message: message,
        );
      }
      rethrow;
    }
  }
  
  @override
  Future<BoxDetailsResponse> getBoxDetails(String id) async {
    try {
      final response = await _apiClient.getBoxDetails(id);
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to get box details';
        return BoxDetailsResponse(
          success: false,
          data: Box(
            id: '',
            merchantId: '',
            merchant: Merchant(
              id: '',
              businessName: '',
              contactName: '',
              email: '',
              phone: '',
              category: '',
              address: '',
              location: const GeoPoint(latitude: 0, longitude: 0),
              status: '',
              rating: const Rating(value: 0, count: 0),
              sustainabilityScore: 0,
              cuisineTypes: const [],
              images: const [],
              createdAt: DateTime.now(),
              updatedAt: DateTime.now(),
            ),
            name: '',
            description: '',
            originalPrice: 0,
            discountedPrice: 0,
            category: '',
            allergens: const [],
            dietaryInfo: const [],
            images: const [],
            originalQuantity: 0,
            remainingQuantity: 0,
            pickupWindow: TimeWindow(
              start: DateTime.now(),
              end: DateTime.now(),
            ),
            status: '',
            availableDate: DateTime.now(),
            location: const GeoPoint(latitude: 0, longitude: 0),
            distance: 0,
            isActive: false,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          ),
          message: message,
        );
      }
      rethrow;
    }
  }
}

/// Provider for boxes repository
@riverpod
BoxesRepository boxesRepository(BoxesRepositoryRef ref) {
  final apiClient = ref.watch(apiClientProvider);
  return BoxesRepositoryImpl(apiClient);
}

