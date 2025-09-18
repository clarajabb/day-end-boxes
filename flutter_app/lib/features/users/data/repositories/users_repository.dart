import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../../core/api/api_client.dart';
import '../../../../core/models/models.dart';

part 'users_repository.g.dart';

/// Users repository interface
abstract class UsersRepository {
  Future<UserProfileResponse> getUserProfile();
  Future<UserStatsResponse> getUserStats();
}

/// Users repository implementation
class UsersRepositoryImpl implements UsersRepository {
  const UsersRepositoryImpl(this._apiClient);
  
  final ApiClient _apiClient;
  
  @override
  Future<UserProfileResponse> getUserProfile() async {
    try {
      final response = await _apiClient.getUserProfile();
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to get user profile';
        return UserProfileResponse(
          success: false,
          data: UserProfile(
            id: '',
            phone: '',
            locale: 'en',
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          ),
          message: message,
        );
      }
      rethrow;
    }
  }
  
  @override
  Future<UserStatsResponse> getUserStats() async {
    try {
      final response = await _apiClient.getUserStats();
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to get user stats';
        return UserStatsResponse(
          success: false,
          data: const UserStats(
            totalReservations: 0,
            activeReservations: 0,
            completedReservations: 0,
            cancelledReservations: 0,
            totalSavings: 0,
            averageRating: 0,
          ),
          message: message,
        );
      }
      rethrow;
    }
  }
}

/// Provider for users repository
@riverpod
UsersRepository usersRepository(UsersRepositoryRef ref) {
  final apiClient = ref.watch(apiClientProvider);
  return UsersRepositoryImpl(apiClient);
}
