import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../../core/api/api_client.dart';
import '../../../../core/models/models.dart';
import '../../domain/repositories/auth_repository.dart';

part 'auth_repository_impl.g.dart';

/// Authentication repository implementation
class AuthRepositoryImpl implements AuthRepository {
  const AuthRepositoryImpl(this._apiClient);
  
  final ApiClient _apiClient;
  
  @override
  Future<SendOtpResponse> sendOtp(SendOtpRequest request) async {
    try {
      final response = await _apiClient.sendOtp(request);
      return response;
    } catch (e) {
      // Handle DioException and convert to proper response
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to send OTP';
        return SendOtpResponse(
          success: false,
          message: message,
        );
      }
      rethrow;
    }
  }
  
  @override
  Future<VerifyOtpResponse> verifyOtp(VerifyOtpRequest request) async {
    try {
      final response = await _apiClient.verifyOtp(request);
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Invalid OTP';
        return VerifyOtpResponse(
          success: false,
          data: const AuthTokens(accessToken: '', refreshToken: ''),
          message: message,
        );
      }
      rethrow;
    }
  }
  
  @override
  Future<RefreshTokenResponse> refreshToken(RefreshTokenRequest request) async {
    try {
      final response = await _apiClient.refreshToken(request);
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Token refresh failed';
        return RefreshTokenResponse(
          success: false,
          data: '',
          message: message,
        );
      }
      rethrow;
    }
  }
  
  @override
  Future<UserProfileResponse> getProfile() async {
    try {
      final response = await _apiClient.getProfile();
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to get profile';
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
  Future<UserProfileResponse> updateProfile(UpdateProfileRequest request) async {
    try {
      final response = await _apiClient.updateProfile(request);
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Failed to update profile';
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
  Future<LogoutResponse> logout(LogoutRequest request) async {
    try {
      final response = await _apiClient.logout(request);
      return response;
    } catch (e) {
      if (e is DioException) {
        final message = e.response?.data?['message'] ?? 'Logout failed';
        return LogoutResponse(
          success: false,
          message: message,
        );
      }
      rethrow;
    }
  }
}

/// Provider for authentication repository
@riverpod
AuthRepository authRepository(AuthRepositoryRef ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthRepositoryImpl(apiClient);
}
