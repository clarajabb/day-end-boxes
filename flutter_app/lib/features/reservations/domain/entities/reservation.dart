import 'package:json_annotation/json_annotation.dart';
import 'package:flutter/material.dart';

import '../../boxes/domain/entities/box.dart';
import '../../auth/domain/entities/user.dart';

part 'reservation.g.dart';

@JsonSerializable()
class Reservation {
  final String id;
  final String userId;
  final String boxInventoryId;
  final ReservationStatus status;
  final String pickupCode;
  final double totalAmount;
  final DateTime reservedAt;
  final DateTime expiresAt;
  final DateTime? completedAt;
  final DateTime? cancelledAt;
  final PaymentStatus paymentStatus;
  final String? paymentMethod;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Reservation({
    required this.id,
    required this.userId,
    required this.boxInventoryId,
    required this.status,
    required this.pickupCode,
    required this.totalAmount,
    required this.reservedAt,
    required this.expiresAt,
    this.completedAt,
    this.cancelledAt,
    required this.paymentStatus,
    this.paymentMethod,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Reservation.fromJson(Map<String, dynamic> json) => 
      _$ReservationFromJson(json);
  Map<String, dynamic> toJson() => _$ReservationToJson(this);

  bool get isActive => status == ReservationStatus.active;
  bool get isExpired => DateTime.now().isAfter(expiresAt);
  bool get canBeCancelled => isActive && !isExpired;
  
  Duration get timeRemaining => expiresAt.difference(DateTime.now());
  
  String get timeRemainingText {
    if (isExpired) return 'Expired';
    
    final remaining = timeRemaining;
    if (remaining.inHours > 0) {
      return '${remaining.inHours}h ${remaining.inMinutes.remainder(60)}m';
    } else {
      return '${remaining.inMinutes}m';
    }
  }

  @override
  String toString() => 'Reservation(id: $id, status: $status)';
}

@JsonSerializable()
class ReservationWithDetails {
  final Reservation reservation;
  @JsonKey(fromJson: _boxInventoryFromJson, toJson: _boxInventoryToJson)
  final BoxInventoryWithMerchant boxInventory;

  const ReservationWithDetails({
    required this.reservation,
    required this.boxInventory,
  });

  factory ReservationWithDetails.fromJson(Map<String, dynamic> json) => 
      _$ReservationWithDetailsFromJson(json);
  Map<String, dynamic> toJson() => _$ReservationWithDetailsToJson(this);

  static BoxInventoryWithMerchant _boxInventoryFromJson(Map<String, dynamic> json) =>
      BoxInventoryWithMerchant.fromJson(json);
  static Map<String, dynamic> _boxInventoryToJson(BoxInventoryWithMerchant boxInventory) =>
      boxInventory.toJson();

  @override
  String toString() => 
      'ReservationWithDetails(reservation: ${reservation.id}, merchant: ${boxInventory.merchant.businessName})';
}

@JsonSerializable()
class PickupCode {
  final String numericCode;
  final String qrCode; // Base64 encoded QR code image
  final DateTime expiresAt;

  const PickupCode({
    required this.numericCode,
    required this.qrCode,
    required this.expiresAt,
  });

  factory PickupCode.fromJson(Map<String, dynamic> json) => 
      _$PickupCodeFromJson(json);
  Map<String, dynamic> toJson() => _$PickupCodeToJson(this);

  bool get isExpired => DateTime.now().isAfter(expiresAt);

  @override
  String toString() => 'PickupCode(numericCode: $numericCode)';
}

// Enums
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

enum PaymentStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('PAID')
  paid,
  @JsonValue('REFUNDED')
  refunded,
}

// Extension methods
extension ReservationStatusExtension on ReservationStatus {
  String get displayName {
    switch (this) {
      case ReservationStatus.active:
        return 'Active';
      case ReservationStatus.completed:
        return 'Completed';
      case ReservationStatus.cancelled:
        return 'Cancelled';
      case ReservationStatus.expired:
        return 'Expired';
    }
  }

  Color get color {
    switch (this) {
      case ReservationStatus.active:
        return Colors.green;
      case ReservationStatus.completed:
        return Colors.blue;
      case ReservationStatus.cancelled:
        return Colors.red;
      case ReservationStatus.expired:
        return Colors.grey;
    }
  }

  IconData get icon {
    switch (this) {
      case ReservationStatus.active:
        return Icons.schedule;
      case ReservationStatus.completed:
        return Icons.check_circle;
      case ReservationStatus.cancelled:
        return Icons.cancel;
      case ReservationStatus.expired:
        return Icons.access_time;
    }
  }
}

extension PaymentStatusExtension on PaymentStatus {
  String get displayName {
    switch (this) {
      case PaymentStatus.pending:
        return 'Pending';
      case PaymentStatus.paid:
        return 'Paid';
      case PaymentStatus.refunded:
        return 'Refunded';
    }
  }

  Color get color {
    switch (this) {
      case PaymentStatus.pending:
        return Colors.orange;
      case PaymentStatus.paid:
        return Colors.green;
      case PaymentStatus.refunded:
        return Colors.blue;
    }
  }
}
