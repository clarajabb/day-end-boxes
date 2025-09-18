import '../../../../core/core.dart';
import '../../domain/repositories/boxes_repository.dart';

/// Implementation of boxes repository using API client
class BoxesRepositoryImpl implements IBoxesRepository {
  final ApiClient _apiClient;

  BoxesRepositoryImpl(this._apiClient);

  @override
  Future<List<Box>> getNearbyBoxes(NearbyBoxesRequest request) async {
    try {
      final response = await _apiClient.getNearbyBoxes(request.toJson());
      
      if (response.success && response.data != null) {
        return (response.data as List)
            .map((json) => Box.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to fetch nearby boxes: $e');
    }
  }

  @override
  Future<Box> getBoxById(String boxId) async {
    try {
      final response = await _apiClient.getBoxById(boxId);
      
      if (response.success && response.data != null) {
        return Box.fromJson(response.data as Map<String, dynamic>);
      }
      
      throw Exception('Box not found');
    } catch (e) {
      throw Exception('Failed to fetch box details: $e');
    }
  }

  @override
  Future<List<Box>> searchBoxes(String query) async {
    try {
      final response = await _apiClient.searchBoxes({'query': query});
      
      if (response.success && response.data != null) {
        return (response.data as List)
            .map((json) => Box.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to search boxes: $e');
    }
  }

  @override
  Future<List<Box>> getBoxesByMerchant(String merchantId) async {
    try {
      final response = await _apiClient.getBoxesByMerchant(merchantId);
      
      if (response.success && response.data != null) {
        return (response.data as List)
            .map((json) => Box.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to fetch merchant boxes: $e');
    }
  }
}
