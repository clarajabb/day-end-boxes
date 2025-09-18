import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/core.dart';
import '../../domain/repositories/reservations_repository.dart';

/// Provider for reservations repository
final reservationsRepositoryProvider = Provider<IReservationsRepository>((ref) {
  return ReservationsRepositoryImpl(ref.read(apiClientProvider));
});

/// Provider for user reservations
final userReservationsProvider = FutureProvider<List<Reservation>>((ref) async {
  final repository = ref.read(reservationsRepositoryProvider);
  return await repository.getUserReservations();
});

/// Provider for active reservations
final activeReservationsProvider = FutureProvider<List<Reservation>>((ref) async {
  final repository = ref.read(reservationsRepositoryProvider);
  final reservations = await repository.getUserReservations();
  return reservations.where((r) => r.status == ReservationStatus.active).toList();
});

/// Provider for reservation history
final reservationHistoryProvider = FutureProvider<List<Reservation>>((ref) async {
  final repository = ref.read(reservationsRepositoryProvider);
  final reservations = await repository.getUserReservations();
  return reservations.where((r) => r.status != ReservationStatus.active).toList();
});

/// Provider for creating reservations
final createReservationProvider = FutureProvider.family<Reservation, CreateReservationRequest>((ref, request) async {
  final repository = ref.read(reservationsRepositoryProvider);
  return await repository.createReservation(request);
});

/// Provider for canceling reservations
final cancelReservationProvider = FutureProvider.family<bool, String>((ref, reservationId) async {
  final repository = ref.read(reservationsRepositoryProvider);
  return await repository.cancelReservation(reservationId);
});
