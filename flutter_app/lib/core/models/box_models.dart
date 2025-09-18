import 'package:freezed_annotation/freezed_annotation.dart';
import 'common_models.dart';
import 'merchant_models.dart';

part 'box_models.freezed.dart';
part 'box_models.g.dart';

/// Box model
@freezed
class Box with _$Box {
  const factory Box({
    required String id,
    required String merchantId,
    required Merchant merchant,
    required String name,
    required String description,
    required double originalPrice,
    required double discountedPrice,
    required String category,
    required List<String> allergens,
    required List<String> dietaryInfo,
    required List<String> images,
    required int originalQuantity,
    required int remainingQuantity,
    required TimeWindow pickupWindow,
    required String status,
    required DateTime availableDate,
    required GeoPoint location,
    required double distance,
    required bool isActive,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Box;

  factory Box.fromJson(Map<String, dynamic> json) =>
      _$BoxFromJson(json);
}

/// Box category enum
enum BoxCategory {
  @JsonValue('MEAL')
  meal,
  @JsonValue('DESSERT')
  dessert,
  @JsonValue('BAKERY')
  bakery,
  @JsonValue('GROCERY')
  grocery,
  @JsonValue('BEVERAGE')
  beverage,
}

/// Box status enum
enum BoxStatus {
  @JsonValue('ACTIVE')
  active,
  @JsonValue('SOLD_OUT')
  soldOut,
  @JsonValue('EXPIRED')
  expired,
}

/// Dietary information enum
enum DietaryInfo {
  @JsonValue('VEGETARIAN')
  vegetarian,
  @JsonValue('VEGAN')
  vegan,
  @JsonValue('GLUTEN_FREE')
  glutenFree,
  @JsonValue('DAIRY_FREE')
  dairyFree,
  @JsonValue('NUT_FREE')
  nutFree,
  @JsonValue('HALAL')
  halal,
  @JsonValue('KOSHER')
  kosher,
}

/// Box search filters
@freezed
class BoxFilters with _$BoxFilters {
  const factory BoxFilters({
    String? category,
    List<String>? dietaryInfo,
    double? maxPrice,
    double? minPrice,
    double? maxDistance,
    GeoPoint? location,
    String? merchantId,
    String? searchQuery,
    TimeWindow? pickupWindow,
  }) = _BoxFilters;

  factory BoxFilters.fromJson(Map<String, dynamic> json) =>
      _$BoxFiltersFromJson(json);
}

/// Nearby boxes request
@freezed
class NearbyBoxesRequest with _$NearbyBoxesRequest {
  const factory NearbyBoxesRequest({
    required double latitude,
    required double longitude,
    double? radius,
    BoxFilters? filters,
    int? limit,
    int? offset,
  }) = _NearbyBoxesRequest;

  factory NearbyBoxesRequest.fromJson(Map<String, dynamic> json) =>
      _$NearbyBoxesRequestFromJson(json);
}

/// Box list response
@freezed
class BoxListResponse with _$BoxListResponse {
  const factory BoxListResponse({
    required bool success,
    required List<Box> data,
    String? message,
  }) = _BoxListResponse;

  factory BoxListResponse.fromJson(Map<String, dynamic> json) =>
      _$BoxListResponseFromJson(json);
}

/// Box details response
@freezed
class BoxDetailsResponse with _$BoxDetailsResponse {
  const factory BoxDetailsResponse({
    required bool success,
    required Box data,
    String? message,
  }) = _BoxDetailsResponse;

  factory BoxDetailsResponse.fromJson(Map<String, dynamic> json) =>
      _$BoxDetailsResponseFromJson(json);
}

/// Box reservation request
@freezed
class BoxReservationRequest with _$BoxReservationRequest {
  const factory BoxReservationRequest({
    required String boxId,
    required int quantity,
    String? paymentMethod,
    String? notes,
  }) = _BoxReservationRequest;

  factory BoxReservationRequest.fromJson(Map<String, dynamic> json) =>
      _$BoxReservationRequestFromJson(json);
}
