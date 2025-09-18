import '../../../../core/core.dart';
import '../../domain/repositories/reservations_repository.dart';

/// Implementation of reservations repository using API client
class ReservationsRepositoryImpl implements IReservationsRepository {
  final ApiClient _apiClient;

  ReservationsRepositoryImpl(this._apiClient);

  @override
  Future<List<Reservation>> getUserReservations() async {
    try {
      final response = await _apiClient.getUserReservations();
      
      if (response.success && response.data != null) {
        return (response.data as List)
            .map((json) => Reservation.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to fetch user reservations: $e');
    }
  }

  @override
  Future<Reservation> createReservation(CreateReservationRequest request) async {
    try {
      final response = await _apiClient.createReservation(request.toJson());
      
      if (response.success && response.data != null) {
        return Reservation.fromJson(response.data as Map<String, dynamic>);
      }
      
      throw Exception('Failed to create reservation');
    } catch (e) {
      throw Exception('Failed to create reservation: $e');
    }
  }

  @override
  Future<bool> cancelReservation(String reservationId) async {
    try {
      final response = await _apiClient.cancelReservation(reservationId);
      
      if (response.success) {
        return true;
      }
      
      return false;
    } catch (e) {
      throw Exception('Failed to cancel reservation: $e');
    }
  }

  @override
  Future<Reservation> getReservationById(String reservationId) async {
    try {
      final response = await _apiClient.getReservationById(reservationId);
      
      if (response.success && response.data != null) {
        return Reservation.fromJson(response.data as Map<String, dynamic>);
      }
      
      throw Exception('Reservation not found');
    } catch (e) {
      throw Exception('Failed to fetch reservation details: $e');
    }
  }
}
