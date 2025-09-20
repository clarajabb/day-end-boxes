import '../../../../core/core.dart';

/// Repository interface for merchants operations
abstract class IMerchantsRepository {
  /// Get all merchants
  Future<List<Merchant>> getMerchants();
  
  /// Get merchant by ID
  Future<Merchant> getMerchantById(String merchantId);
  
  /// Get top rated merchants
  Future<List<Merchant>> getTopRatedMerchants();
  
  /// Get merchant statistics
  Future<MerchantStats> getMerchantStats();
  
  /// Search merchants
  Future<List<Merchant>> searchMerchants(String query);
}

