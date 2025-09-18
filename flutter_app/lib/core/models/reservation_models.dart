import 'package:freezed_annotation/freezed_annotation.dart';
import 'common_models.dart';
import 'box_models.dart';
import 'user_models.dart';

part 'reservation_models.freezed.dart';
part 'reservation_models.g.dart';

/// Reservation model
@freezed
class Reservation with _$Reservation {
  const factory Reservation({
    required String id,
    required String userId,
    required UserProfile user,
    required String boxInventoryId,
    required Box box,
    required String status,
    required String pickupCode,
    required double totalAmount,
    required DateTime reservedAt,
    required DateTime expiresAt,
    DateTime? completedAt,
    DateTime? cancelledAt,
    String? cancellationReason,
    String? notes,
    String? paymentMethod,
    required TimeWindow pickupWindow,
  }) = _Reservation;

  factory Reservation.fromJson(Map<String, dynamic> json) =>
      _$ReservationFromJson(json);
}

/// Reservation status enum
enum ReservationStatus {
  @JsonValue('ACTIVE')
  active,
  @JsonValue('COMPLETED')
  completed,
  @JsonValue('CANCELLED')
  cancelled,
  @JsonValue('EXPIRED')
  expired,
}

/// Payment method enum
enum PaymentMethod {
  @JsonValue('CASH_ON_PICKUP')
  cashOnPickup,
  @JsonValue('APPLE_PAY')
  applePay,
  @JsonValue('GOOGLE_PAY')
  googlePay,
  @JsonValue('CARD')
  card,
}

/// Reservation list response
@freezed
class ReservationListResponse with _$ReservationListResponse {
  const factory ReservationListResponse({
    required bool success,
    required List<Reservation> data,
    String? message,
  }) = _ReservationListResponse;

  factory ReservationListResponse.fromJson(Map<String, dynamic> json) =>
      _$ReservationListResponseFromJson(json);
}

/// Reservation details response
@freezed
class ReservationDetailsResponse with _$ReservationDetailsResponse {
  const factory ReservationDetailsResponse({
    required bool success,
    required Reservation data,
    String? message,
  }) = _ReservationDetailsResponse;

  factory ReservationDetailsResponse.fromJson(Map<String, dynamic> json) =>
      _$ReservationDetailsResponseFromJson(json);
}

/// Create reservation response
@freezed
class CreateReservationResponse with _$CreateReservationResponse {
  const factory CreateReservationResponse({
    required bool success,
    required Reservation data,
    String? message,
  }) = _CreateReservationResponse;

  factory CreateReservationResponse.fromJson(Map<String, dynamic> json) =>
      _$CreateReservationResponseFromJson(json);
}

/// Cancel reservation request
@freezed
class CancelReservationRequest with _$CancelReservationRequest {
  const factory CancelReservationRequest({
    required String reservationId,
    String? reason,
  }) = _CancelReservationRequest;

  factory CancelReservationRequest.fromJson(Map<String, dynamic> json) =>
      _$CancelReservationRequestFromJson(json);
}

/// Cancel reservation response
@freezed
class CancelReservationResponse with _$CancelReservationResponse {
  const factory CancelReservationResponse({
    required bool success,
    required String message,
  }) = _CancelReservationResponse;

  factory CancelReservationResponse.fromJson(Map<String, dynamic> json) =>
      _$CancelReservationResponseFromJson(json);
}

/// Reservation statistics
@freezed
class ReservationStats with _$ReservationStats {
  const factory ReservationStats({
    required int totalReservations,
    required int activeReservations,
    required int completedReservations,
    required int cancelledReservations,
    required double totalSavings,
    required double averageRating,
  }) = _ReservationStats;

  factory ReservationStats.fromJson(Map<String, dynamic> json) =>
      _$ReservationStatsFromJson(json);
}
