import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../domain/entities/user.dart';
import '../../data/repositories/auth_repository.dart';
import '../../../../core/services/storage_service.dart';

part 'auth_provider.g.dart';

// Auth State
class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final User? user;
  final String? error;
  final String? accessToken;
  final String? refreshToken;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.user,
    this.error,
    this.accessToken,
    this.refreshToken,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    User? user,
    String? error,
    String? accessToken,
    String? refreshToken,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      error: error,
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
    );
  }

  @override
  String toString() {
    return 'AuthState(isAuthenticated: $isAuthenticated, isLoading: $isLoading, user: $user, error: $error)';
  }
}

// Auth Provider
@riverpod
class Auth extends _$Auth {
  @override
  AuthState build() {
    _initializeAuth();
    return const AuthState();
  }

  Future<void> _initializeAuth() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final storageService = ref.read(storageServiceProvider);
      final accessToken = await storageService.getAccessToken();
      final refreshToken = await storageService.getRefreshToken();
      
      if (accessToken != null && refreshToken != null) {
        // Validate token and get user info
        final authRepository = ref.read(authRepositoryProvider);
        final user = await authRepository.getCurrentUser();
        
        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          user: user,
          accessToken: accessToken,
          refreshToken: refreshToken,
        );
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<bool> sendOtp(String phone, String locale) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final authRepository = ref.read(authRepositoryProvider);
      await authRepository.sendOtp(phone, locale);
      
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  Future<bool> verifyOtp(String phone, String otp) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final authRepository = ref.read(authRepositoryProvider);
      final authResponse = await authRepository.verifyOtp(phone, otp);
      
      // Store tokens
      final storageService = ref.read(storageServiceProvider);
      await storageService.saveTokens(
        authResponse.accessToken,
        authResponse.refreshToken,
      );
      
      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        user: authResponse.user,
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      );
      
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  Future<bool> refreshToken() async {
    if (state.refreshToken == null) return false;
    
    try {
      final authRepository = ref.read(authRepositoryProvider);
      final newAccessToken = await authRepository.refreshToken(state.refreshToken!);
      
      // Update stored token
      final storageService = ref.read(storageServiceProvider);
      await storageService.saveAccessToken(newAccessToken);
      
      state = state.copyWith(accessToken: newAccessToken);
      return true;
    } catch (e) {
      // Refresh token is invalid, logout user
      await logout();
      return false;
    }
  }

  Future<void> updateProfile({
    String? name,
    String? email,
    String? preferredLocale,
    Map<String, bool>? notificationPreferences,
  }) async {
    if (!state.isAuthenticated) return;
    
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final authRepository = ref.read(authRepositoryProvider);
      final updatedUser = await authRepository.updateProfile(
        name: name,
        email: email,
        preferredLocale: preferredLocale,
        notificationPreferences: notificationPreferences,
      );
      
      state = state.copyWith(
        isLoading: false,
        user: updatedUser,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final storageService = ref.read(storageServiceProvider);
      await storageService.clearTokens();
      
      state = const AuthState();
    } catch (e) {
      // Even if logout fails, clear local state
      state = const AuthState(error: 'Logout failed');
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Provider for the current user
@riverpod
User? currentUser(CurrentUserRef ref) {
  return ref.watch(authProvider).user;
}

// Provider to check if user is authenticated
@riverpod
bool isAuthenticated(IsAuthenticatedRef ref) {
  return ref.watch(authProvider).isAuthenticated;
}

// Provider for access token
@riverpod
String? accessToken(AccessTokenRef ref) {
  return ref.watch(authProvider).accessToken;
}
