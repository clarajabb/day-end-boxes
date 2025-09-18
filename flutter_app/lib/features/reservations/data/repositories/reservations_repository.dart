import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../../core/api/api_client.dart';
import '../../../../core/models/models.dart';

part 'reservations_repository.g.dart';

/// Reservations repository interface
abstract class ReservationsRepository {
  Future<ReservationListResponse> getReservations();
  Future<CreateReservationResponse> createReservation(BoxReservationRequest request);
  Future<CancelReservationResponse> cancelReservation(String id, CancelReservationRequest request);
}

/// Reservations repository implementation
class ReservationsRepositoryImpl implements ReservationsRepository {
  const ReservationsRepositoryImpl(this._apiClient);
  
  final ApiClient _apiClient;
  
  @override
  Future<ReservationListResponse> getReservations() async {
    try {
      final response = await _apiClient.getReservations();
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to get reservations';
        return ReservationListResponse(
          success: false,
          data: const [],
          message: message,
        );
      }
      rethrow;
    }
  }
  
  @override
  Future<CreateReservationResponse> createReservation(BoxReservationRequest request) async {
    try {
      final response = await _apiClient.createReservation(request);
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to create reservation';
        return CreateReservationResponse(
          success: false,
          data: Reservation(
            id: '',
            userId: '',
            user: UserProfile(
              id: '',
              phone: '',
              locale: 'en',
              createdAt: DateTime.now(),
              updatedAt: DateTime.now(),
            ),
            boxInventoryId: '',
            box: Box(
              id: '',
              merchantId: '',
              merchant: Merchant(
                id: '',
                businessName: '',
                contactName: '',
                email: '',
                phone: '',
                category: '',
                address: '',
                location: const GeoPoint(latitude: 0, longitude: 0),
                status: '',
                rating: const Rating(value: 0, count: 0),
                sustainabilityScore: 0,
                cuisineTypes: const [],
                images: const [],
                createdAt: DateTime.now(),
                updatedAt: DateTime.now(),
              ),
              name: '',
              description: '',
              originalPrice: 0,
              discountedPrice: 0,
              category: '',
              allergens: const [],
              dietaryInfo: const [],
              images: const [],
              originalQuantity: 0,
              remainingQuantity: 0,
              pickupWindow: TimeWindow(
                start: DateTime.now(),
                end: DateTime.now(),
              ),
              status: '',
              availableDate: DateTime.now(),
              location: const GeoPoint(latitude: 0, longitude: 0),
              distance: 0,
              isActive: false,
              createdAt: DateTime.now(),
              updatedAt: DateTime.now(),
            ),
            status: '',
            pickupCode: '',
            totalAmount: 0,
            reservedAt: DateTime.now(),
            expiresAt: DateTime.now(),
            pickupWindow: TimeWindow(
              start: DateTime.now(),
              end: DateTime.now(),
            ),
          ),
          message: message,
        );
      }
      rethrow;
    }
  }
  
  @override
  Future<CancelReservationResponse> cancelReservation(String id, CancelReservationRequest request) async {
    try {
      final response = await _apiClient.cancelReservation(id, request);
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to cancel reservation';
        return CancelReservationResponse(
          success: false,
          message: message,
        );
      }
      rethrow;
    }
  }
}

/// Provider for reservations repository
@riverpod
ReservationsRepository reservationsRepository(ReservationsRepositoryRef ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ReservationsRepositoryImpl(apiClient);
}
