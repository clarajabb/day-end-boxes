import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:dio/dio.dart';

import '../../../../core/models/models.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../../../core/storage/preferences.dart';
import '../../../../core/api/api_client.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../data/repositories/auth_repository_impl.dart';

part 'auth_provider.g.dart';

/// Authentication state provider
@riverpod
class AuthState extends _$AuthState {
  @override
  Future<UserProfile?> build() async {
    final isLoggedIn = await SecureStorageService.instance.isLoggedIn;
    if (!isLoggedIn) return null;
    
    try {
      final userId = await SecureStorageService.instance.userId;
      if (userId == null) return null;
      
      // TODO: Fetch user profile from API
      return null;
    } catch (e) {
      // If there's an error, clear tokens and return null
      await SecureStorageService.instance.clearTokens();
      return null;
    }
  }
  
  /// Send OTP to phone number
  Future<void> sendOtp(String phone, String locale) async {
    state = const AsyncValue.loading();
    
    try {
      final repository = ref.read(authRepositoryProvider);
      final response = await repository.sendOtp(SendOtpRequest(
        phone: phone,
        locale: locale,
      ));
      
      if (response.success) {
        // Save phone number for verification
        await SecureStorageService.instance.savePhone(phone);
        state = const AsyncValue.data(null);
      } else {
        state = AsyncValue.error(
          Exception(response.message ?? 'Failed to send OTP'),
          StackTrace.current,
        );
      }
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
  
  /// Verify OTP and get tokens
  Future<void> verifyOtp(String phone, String otp) async {
    state = const AsyncValue.loading();
    
    try {
      final repository = ref.read(authRepositoryProvider);
      final response = await repository.verifyOtp(VerifyOtpRequest(
        phone: phone,
        otp: otp,
      ));
      
      if (response.success) {
        // Save tokens
        await SecureStorageService.instance.saveTokens(
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        );
        
        // Fetch user profile
        final profile = await repository.getProfile();
        if (profile.success) {
          await SecureStorageService.instance.saveUserId(profile.data.id);
          state = AsyncValue.data(profile.data);
        } else {
          state = AsyncValue.error(
            Exception(profile.message ?? 'Failed to get profile'),
            StackTrace.current,
          );
        }
      } else {
        state = AsyncValue.error(
          Exception(response.message ?? 'Invalid OTP'),
          StackTrace.current,
        );
      }
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
  
  /// Update user profile
  Future<void> updateProfile(UpdateProfileRequest request) async {
    try {
      final repository = ref.read(authRepositoryProvider);
      final response = await repository.updateProfile(request);
      
      if (response.success) {
        // Update local state
        final currentUser = state.value;
        if (currentUser != null) {
          final updatedUser = currentUser.copyWith(
            name: request.name ?? currentUser.name,
            email: request.email ?? currentUser.email,
            locale: request.locale ?? currentUser.locale,
          );
          state = AsyncValue.data(updatedUser);
        }
      } else {
        throw Exception(response.message ?? 'Failed to update profile');
      }
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
  
  /// Refresh access token
  Future<void> refreshToken() async {
    try {
      final refreshToken = await SecureStorageService.instance.refreshToken;
      if (refreshToken == null) {
        await logout();
        return;
      }
      
      final repository = ref.read(authRepositoryProvider);
      final response = await repository.refreshToken(RefreshTokenRequest(
        refreshToken: refreshToken,
      ));
      
      if (response.success) {
        // Save new access token
        await SecureStorageService.instance.saveTokens(
          accessToken: response.data,
          refreshToken: refreshToken,
        );
      } else {
        await logout();
      }
    } catch (e) {
      await logout();
    }
  }
  
  /// Logout user
  Future<void> logout() async {
    try {
      final refreshToken = await SecureStorageService.instance.refreshToken;
      if (refreshToken != null) {
        final repository = ref.read(authRepositoryProvider);
        await repository.logout(LogoutRequest(refreshToken: refreshToken));
      }
    } catch (e) {
      // Ignore logout errors
    } finally {
      // Clear all stored data
      await SecureStorageService.instance.clearTokens();
      await PreferencesService.instance.clearAll();
      state = const AsyncValue.data(null);
    }
  }
  
  /// Check if user is authenticated
  bool get isAuthenticated {
    return state.value != null;
  }
  
  /// Get current user
  UserProfile? get currentUser {
    return state.value;
  }
}

/// Authentication repository provider
@riverpod
AuthRepository authRepository(AuthRepositoryRef ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthRepositoryImpl(apiClient);
}