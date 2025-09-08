import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

import 'package:day_end_boxes/features/auth/presentation/providers/auth_provider.dart';
import 'package:day_end_boxes/features/auth/data/repositories/auth_repository.dart';
import 'package:day_end_boxes/features/auth/domain/entities/user.dart';
import 'package:day_end_boxes/core/services/storage_service.dart';

import 'auth_provider_test.mocks.dart';

@GenerateMocks([AuthRepository, StorageService])
void main() {
  group('AuthProvider Tests', () {
    late MockAuthRepository mockAuthRepository;
    late MockStorageService mockStorageService;
    late ProviderContainer container;

    setUp(() {
      mockAuthRepository = MockAuthRepository();
      mockStorageService = MockStorageService();
      
      container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(mockAuthRepository),
          storageServiceProvider.overrideWithValue(mockStorageService),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    group('Initial State', () {
      test('should have correct initial state', () {
        final authState = container.read(authProvider);
        
        expect(authState.isAuthenticated, false);
        expect(authState.isLoading, false);
        expect(authState.user, null);
        expect(authState.error, null);
        expect(authState.accessToken, null);
        expect(authState.refreshToken, null);
      });
    });

    group('Send OTP', () {
      test('should send OTP successfully', () async {
        // Arrange
        const phone = '+96171123456';
        const locale = 'ar';
        
        when(mockAuthRepository.sendOtp(phone, locale))
            .thenAnswer((_) async => {});

        // Act
        final result = await container
            .read(authProvider.notifier)
            .sendOtp(phone, locale);

        // Assert
        expect(result, true);
        verify(mockAuthRepository.sendOtp(phone, locale)).called(1);
        
        final authState = container.read(authProvider);
        expect(authState.isLoading, false);
        expect(authState.error, null);
      });

      test('should handle send OTP error', () async {
        // Arrange
        const phone = '+96171123456';
        const locale = 'ar';
        const errorMessage = 'Network error';
        
        when(mockAuthRepository.sendOtp(phone, locale))
            .thenThrow(Exception(errorMessage));

        // Act
        final result = await container
            .read(authProvider.notifier)
            .sendOtp(phone, locale);

        // Assert
        expect(result, false);
        verify(mockAuthRepository.sendOtp(phone, locale)).called(1);
        
        final authState = container.read(authProvider);
        expect(authState.isLoading, false);
        expect(authState.error, contains(errorMessage));
      });
    });

    group('Verify OTP', () {
      test('should verify OTP successfully and authenticate user', () async {
        // Arrange
        const phone = '+96171123456';
        const otp = '123456';
        const accessToken = 'access_token';
        const refreshToken = 'refresh_token';
        
        final user = User(
          id: 'user_id',
          phone: phone,
          preferredLocale: 'ar',
          notificationPreferences: const NotificationPreferences(
            pushEnabled: true,
            smsEnabled: true,
            emailEnabled: false,
          ),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        final authResponse = AuthResponse(
          accessToken: accessToken,
          refreshToken: refreshToken,
          user: user,
        );

        when(mockAuthRepository.verifyOtp(phone, otp))
            .thenAnswer((_) async => authResponse);
        when(mockStorageService.saveTokens(accessToken, refreshToken))
            .thenAnswer((_) async => {});

        // Act
        final result = await container
            .read(authProvider.notifier)
            .verifyOtp(phone, otp);

        // Assert
        expect(result, true);
        verify(mockAuthRepository.verifyOtp(phone, otp)).called(1);
        verify(mockStorageService.saveTokens(accessToken, refreshToken)).called(1);
        
        final authState = container.read(authProvider);
        expect(authState.isAuthenticated, true);
        expect(authState.isLoading, false);
        expect(authState.user, user);
        expect(authState.accessToken, accessToken);
        expect(authState.refreshToken, refreshToken);
        expect(authState.error, null);
      });

      test('should handle verify OTP error', () async {
        // Arrange
        const phone = '+96171123456';
        const otp = '123456';
        const errorMessage = 'Invalid OTP';
        
        when(mockAuthRepository.verifyOtp(phone, otp))
            .thenThrow(Exception(errorMessage));

        // Act
        final result = await container
            .read(authProvider.notifier)
            .verifyOtp(phone, otp);

        // Assert
        expect(result, false);
        verify(mockAuthRepository.verifyOtp(phone, otp)).called(1);
        
        final authState = container.read(authProvider);
        expect(authState.isAuthenticated, false);
        expect(authState.isLoading, false);
        expect(authState.error, contains(errorMessage));
      });
    });

    group('Update Profile', () {
      test('should update user profile successfully', () async {
        // Arrange
        const name = 'John Doe';
        const email = 'john@example.com';
        
        final initialUser = User(
          id: 'user_id',
          phone: '+96171123456',
          preferredLocale: 'ar',
          notificationPreferences: const NotificationPreferences(
            pushEnabled: true,
            smsEnabled: true,
            emailEnabled: false,
          ),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        final updatedUser = initialUser.copyWith(
          name: name,
          email: email,
        );

        // Set initial authenticated state
        container.read(authProvider.notifier).state = AuthState(
          isAuthenticated: true,
          user: initialUser,
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
        );

        when(mockAuthRepository.updateProfile(
          name: name,
          email: email,
        )).thenAnswer((_) async => updatedUser);

        // Act
        await container.read(authProvider.notifier).updateProfile(
          name: name,
          email: email,
        );

        // Assert
        verify(mockAuthRepository.updateProfile(
          name: name,
          email: email,
        )).called(1);
        
        final authState = container.read(authProvider);
        expect(authState.user?.name, name);
        expect(authState.user?.email, email);
        expect(authState.isLoading, false);
        expect(authState.error, null);
      });
    });

    group('Logout', () {
      test('should logout user successfully', () async {
        // Arrange
        final user = User(
          id: 'user_id',
          phone: '+96171123456',
          preferredLocale: 'ar',
          notificationPreferences: const NotificationPreferences(
            pushEnabled: true,
            smsEnabled: true,
            emailEnabled: false,
          ),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        // Set initial authenticated state
        container.read(authProvider.notifier).state = AuthState(
          isAuthenticated: true,
          user: user,
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
        );

        when(mockStorageService.clearTokens())
            .thenAnswer((_) async => {});

        // Act
        await container.read(authProvider.notifier).logout();

        // Assert
        verify(mockStorageService.clearTokens()).called(1);
        
        final authState = container.read(authProvider);
        expect(authState.isAuthenticated, false);
        expect(authState.user, null);
        expect(authState.accessToken, null);
        expect(authState.refreshToken, null);
      });
    });

    group('Refresh Token', () {
      test('should refresh token successfully', () async {
        // Arrange
        const oldAccessToken = 'old_access_token';
        const newAccessToken = 'new_access_token';
        const refreshToken = 'refresh_token';

        final user = User(
          id: 'user_id',
          phone: '+96171123456',
          preferredLocale: 'ar',
          notificationPreferences: const NotificationPreferences(
            pushEnabled: true,
            smsEnabled: true,
            emailEnabled: false,
          ),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        // Set initial authenticated state
        container.read(authProvider.notifier).state = AuthState(
          isAuthenticated: true,
          user: user,
          accessToken: oldAccessToken,
          refreshToken: refreshToken,
        );

        when(mockAuthRepository.refreshToken(refreshToken))
            .thenAnswer((_) async => newAccessToken);
        when(mockStorageService.saveAccessToken(newAccessToken))
            .thenAnswer((_) async => {});

        // Act
        final result = await container.read(authProvider.notifier).refreshToken();

        // Assert
        expect(result, true);
        verify(mockAuthRepository.refreshToken(refreshToken)).called(1);
        verify(mockStorageService.saveAccessToken(newAccessToken)).called(1);
        
        final authState = container.read(authProvider);
        expect(authState.accessToken, newAccessToken);
      });

      test('should logout user when refresh token fails', () async {
        // Arrange
        const refreshToken = 'invalid_refresh_token';

        final user = User(
          id: 'user_id',
          phone: '+96171123456',
          preferredLocale: 'ar',
          notificationPreferences: const NotificationPreferences(
            pushEnabled: true,
            smsEnabled: true,
            emailEnabled: false,
          ),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        // Set initial authenticated state
        container.read(authProvider.notifier).state = AuthState(
          isAuthenticated: true,
          user: user,
          accessToken: 'access_token',
          refreshToken: refreshToken,
        );

        when(mockAuthRepository.refreshToken(refreshToken))
            .thenThrow(Exception('Invalid refresh token'));
        when(mockStorageService.clearTokens())
            .thenAnswer((_) async => {});

        // Act
        final result = await container.read(authProvider.notifier).refreshToken();

        // Assert
        expect(result, false);
        verify(mockAuthRepository.refreshToken(refreshToken)).called(1);
        verify(mockStorageService.clearTokens()).called(1);
        
        final authState = container.read(authProvider);
        expect(authState.isAuthenticated, false);
        expect(authState.user, null);
      });
    });

    group('Utility Methods', () {
      test('should clear error', () {
        // Arrange
        container.read(authProvider.notifier).state = const AuthState(
          error: 'Some error',
        );

        // Act
        container.read(authProvider.notifier).clearError();

        // Assert
        final authState = container.read(authProvider);
        expect(authState.error, null);
      });
    });
  });
}
