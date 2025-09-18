import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/core.dart';
import '../../domain/repositories/merchants_repository.dart';

/// Provider for merchants repository
final merchantsRepositoryProvider = Provider<IMerchantsRepository>((ref) {
  return MerchantsRepositoryImpl(ref.read(apiClientProvider));
});

/// Provider for all merchants
final merchantsProvider = FutureProvider<List<Merchant>>((ref) async {
  final repository = ref.read(merchantsRepositoryProvider);
  return await repository.getMerchants();
});

/// Provider for merchant details
final merchantDetailsProvider = FutureProvider.family<Merchant, String>((ref, merchantId) async {
  final repository = ref.read(merchantsRepositoryProvider);
  return await repository.getMerchantById(merchantId);
});

/// Provider for top rated merchants
final topRatedMerchantsProvider = FutureProvider<List<Merchant>>((ref) async {
  final repository = ref.read(merchantsRepositoryProvider);
  return await repository.getTopRatedMerchants();
});

/// Provider for merchant statistics
final merchantStatsProvider = FutureProvider<MerchantStats>((ref) async {
  final repository = ref.read(merchantsRepositoryProvider);
  return await repository.getMerchantStats();
});
