import '../../../../core/core.dart';

/// Repository interface for reservations operations
abstract class IReservationsRepository {
  /// Get user reservations
  Future<List<Reservation>> getUserReservations();
  
  /// Create a new reservation
  Future<Reservation> createReservation(CreateReservationRequest request);
  
  /// Cancel a reservation
  Future<bool> cancelReservation(String reservationId);
  
  /// Get reservation by ID
  Future<Reservation> getReservationById(String reservationId);
}

/// Request model for creating reservations
class CreateReservationRequest {
  final String boxId;
  final int quantity;
  final String paymentMethod;
  final String? promoCode;

  const CreateReservationRequest({
    required this.boxId,
    required this.quantity,
    required this.paymentMethod,
    this.promoCode,
  });

  Map<String, dynamic> toJson() {
    return {
      'boxId': boxId,
      'quantity': quantity,
      'paymentMethod': paymentMethod,
      if (promoCode != null) 'promoCode': promoCode,
    };
  }
}

