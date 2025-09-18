import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../../core/api/api_client.dart';
import '../../../../core/models/models.dart';

part 'merchants_repository.g.dart';

/// Merchants repository interface
abstract class MerchantsRepository {
  Future<MerchantListResponse> getMerchants();
  Future<MerchantDetailsResponse> getMerchantDetails(String id);
  Future<MerchantStatsResponse> getMerchantStats();
  Future<MerchantListResponse> getTopRatedMerchants();
  Future<MerchantListResponse> getSustainableMerchants();
  Future<MerchantListResponse> searchMerchants({
    String? query,
    String? category,
    List<String>? cuisineTypes,
    double? minRating,
    double? maxDistance,
    double? latitude,
    double? longitude,
  });
}

/// Merchants repository implementation
class MerchantsRepositoryImpl implements MerchantsRepository {
  const MerchantsRepositoryImpl(this._apiClient);
  
  final ApiClient _apiClient;
  
  @override
  Future<MerchantListResponse> getMerchants() async {
    try {
      final response = await _apiClient.getMerchants();
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to get merchants';
        return MerchantListResponse(
          success: false,
          data: const [],
          message: message,
        );
      }
      rethrow;
    }
  }
  
  @override
  Future<MerchantDetailsResponse> getMerchantDetails(String id) async {
    try {
      final response = await _apiClient.getMerchantDetails(id);
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to get merchant details';
        return MerchantDetailsResponse(
          success: false,
          data: Merchant(
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
          message: message,
        );
      }
      rethrow;
    }
  }
  
  @override
  Future<MerchantStatsResponse> getMerchantStats() async {
    try {
      final response = await _apiClient.getMerchantStats();
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to get merchant stats';
        return MerchantStatsResponse(
          success: false,
          data: const MerchantStats(
            totalMerchants: 0,
            activeMerchants: 0,
            pendingMerchants: 0,
            averageRating: 0,
            averageSustainabilityScore: 0,
          ),
          message: message,
        );
      }
      rethrow;
    }
  }
  
  @override
  Future<MerchantListResponse> getTopRatedMerchants() async {
    try {
      final response = await _apiClient.getTopRatedMerchants();
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to get top rated merchants';
        return MerchantListResponse(
          success: false,
          data: const [],
          message: message,
        );
      }
      rethrow;
    }
  }
  
  @override
  Future<MerchantListResponse> getSustainableMerchants() async {
    try {
      final response = await _apiClient.getSustainableMerchants();
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to get sustainable merchants';
        return MerchantListResponse(
          success: false,
          data: const [],
          message: message,
        );
      }
      rethrow;
    }
  }
  
  @override
  Future<MerchantListResponse> searchMerchants({
    String? query,
    String? category,
    List<String>? cuisineTypes,
    double? minRating,
    double? maxDistance,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final queries = <String, dynamic>{};
      
      if (query != null && query.isNotEmpty) {
        queries['q'] = query;
      }
      if (category != null && category.isNotEmpty) {
        queries['category'] = category;
      }
      if (cuisineTypes != null && cuisineTypes.isNotEmpty) {
        queries['cuisine'] = cuisineTypes.join(',');
      }
      if (minRating != null) {
        queries['min_rating'] = minRating;
      }
      if (maxDistance != null) {
        queries['max_distance'] = maxDistance;
      }
      if (latitude != null) {
        queries['latitude'] = latitude;
      }
      if (longitude != null) {
        queries['longitude'] = longitude;
      }
      
      final response = await _apiClient.searchMerchants(queries);
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to search merchants';
        return MerchantListResponse(
          success: false,
          data: const [],
          message: message,
        );
      }
      rethrow;
    }
  }
}

/// Provider for merchants repository
@riverpod
MerchantsRepository merchantsRepository(MerchantsRepositoryRef ref) {
  final apiClient = ref.watch(apiClientProvider);
  return MerchantsRepositoryImpl(apiClient);
}
