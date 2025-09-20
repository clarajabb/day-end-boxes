import 'package:freezed_annotation/freezed_annotation.dart';
import 'common_models.dart';

part 'merchant_models.freezed.dart';
part 'merchant_models.g.dart';

/// Merchant model
@freezed
class Merchant with _$Merchant {
  const factory Merchant({
    required String id,
    required String businessName,
    required String contactName,
    required String email,
    required String phone,
    required String category,
    required String address,
    required GeoPoint location,
    required String status,
    required Rating rating,
    required double sustainabilityScore,
    required List<String> cuisineTypes,
    required List<String> images,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Merchant;

  factory Merchant.fromJson(Map<String, dynamic> json) =>
      _$MerchantFromJson(json);
}

/// Merchant category enum
enum MerchantCategory {
  @JsonValue('RESTAURANT')
  restaurant,
  @JsonValue('BAKERY')
  bakery,
  @JsonValue('SUPERMARKET')
  supermarket,
  @JsonValue('CAFE')
  cafe,
  @JsonValue('GROCERY')
  grocery,
}

/// Merchant status enum
enum MerchantStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('APPROVED')
  approved,
  @JsonValue('REJECTED')
  rejected,
  @JsonValue('SUSPENDED')
  suspended,
}

/// Merchant search filters
@freezed
class MerchantFilters with _$MerchantFilters {
  const factory MerchantFilters({
    String? category,
    List<String>? cuisineTypes,
    double? minRating,
    double? maxDistance,
    GeoPoint? location,
    String? searchQuery,
  }) = _MerchantFilters;

  factory MerchantFilters.fromJson(Map<String, dynamic> json) =>
      _$MerchantFiltersFromJson(json);
}

/// Merchant list response
@freezed
class MerchantListResponse with _$MerchantListResponse {
  const factory MerchantListResponse({
    required bool success,
    required List<Merchant> data,
    String? message,
  }) = _MerchantListResponse;

  factory MerchantListResponse.fromJson(Map<String, dynamic> json) =>
      _$MerchantListResponseFromJson(json);
}

/// Merchant details response
@freezed
class MerchantDetailsResponse with _$MerchantDetailsResponse {
  const factory MerchantDetailsResponse({
    required bool success,
    required Merchant data,
    String? message,
  }) = _MerchantDetailsResponse;

  factory MerchantDetailsResponse.fromJson(Map<String, dynamic> json) =>
      _$MerchantDetailsResponseFromJson(json);
}

/// Merchant statistics
@freezed
class MerchantStats with _$MerchantStats {
  const factory MerchantStats({
    required int totalMerchants,
    required int activeMerchants,
    required int pendingMerchants,
    required double averageRating,
    required double averageSustainabilityScore,
  }) = _MerchantStats;

  factory MerchantStats.fromJson(Map<String, dynamic> json) =>
      _$MerchantStatsFromJson(json);
}

/// Merchant stats response
@freezed
class MerchantStatsResponse with _$MerchantStatsResponse {
  const factory MerchantStatsResponse({
    required bool success,
    required MerchantStats data,
    String? message,
  }) = _MerchantStatsResponse;

  factory MerchantStatsResponse.fromJson(Map<String, dynamic> json) =>
      _$MerchantStatsResponseFromJson(json);
}

