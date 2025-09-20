import '../../../../core/core.dart';
import '../../domain/repositories/merchants_repository.dart';

/// Implementation of merchants repository using API client
class MerchantsRepositoryImpl implements IMerchantsRepository {
  final ApiClient _apiClient;

  MerchantsRepositoryImpl(this._apiClient);

  @override
  Future<List<Merchant>> getMerchants() async {
    try {
      final response = await _apiClient.getMerchants();
      
      if (response.success && response.data != null) {
        return (response.data as List)
            .map((json) => Merchant.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to fetch merchants: $e');
    }
  }

  @override
  Future<Merchant> getMerchantById(String merchantId) async {
    try {
      final response = await _apiClient.getMerchantById(merchantId);
      
      if (response.success && response.data != null) {
        return Merchant.fromJson(response.data as Map<String, dynamic>);
      }
      
      throw Exception('Merchant not found');
    } catch (e) {
      throw Exception('Failed to fetch merchant details: $e');
    }
  }

  @override
  Future<List<Merchant>> getTopRatedMerchants() async {
    try {
      final response = await _apiClient.getTopRatedMerchants();
      
      if (response.success && response.data != null) {
        return (response.data as List)
            .map((json) => Merchant.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to fetch top rated merchants: $e');
    }
  }

  @override
  Future<MerchantStats> getMerchantStats() async {
    try {
      final response = await _apiClient.getMerchantStats();
      
      if (response.success && response.data != null) {
        return MerchantStats.fromJson(response.data as Map<String, dynamic>);
      }
      
      throw Exception('Failed to fetch merchant stats');
    } catch (e) {
      throw Exception('Failed to fetch merchant statistics: $e');
    }
  }

  @override
  Future<List<Merchant>> searchMerchants(String query) async {
    try {
      final response = await _apiClient.searchMerchants({'query': query});
      
      if (response.success && response.data != null) {
        return (response.data as List)
            .map((json) => Merchant.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to search merchants: $e');
    }
  }
}

