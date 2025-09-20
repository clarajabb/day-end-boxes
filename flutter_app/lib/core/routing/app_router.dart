import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/auth/presentation/screens/phone_verification_screen.dart';
import '../../features/auth/presentation/screens/otp_verification_screen.dart';
import '../../features/auth/presentation/screens/profile_setup_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/boxes/presentation/screens/box_details_screen.dart';
import '../../features/cart/presentation/screens/cart_screen.dart';
import '../../features/reservations/presentation/screens/reservations_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';

/// App router configuration with typed routes
final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuthenticated = authState.when(
        data: (user) => user != null,
        loading: () => false,
        error: (_, __) => false,
      );
      
      final isOnAuthRoute = state.fullPath?.startsWith('/auth') ?? false;
      final isOnSplashRoute = state.fullPath == '/splash';
      
      // If not authenticated and not on auth/splash routes, redirect to splash
      if (!isAuthenticated && !isOnAuthRoute && !isOnSplashRoute) {
        return '/splash';
      }
      
      // If authenticated and on auth routes, redirect to home
      if (isAuthenticated && isOnAuthRoute) {
        return '/home';
      }
      
      return null;
    },
    routes: [
      // Splash Screen
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      
      // Authentication Routes
      GoRoute(
        path: '/auth',
        builder: (context, state) => const PhoneVerificationScreen(),
        routes: [
          GoRoute(
            path: 'otp',
            name: 'otp-verification',
            builder: (context, state) {
              final phone = state.extra as String?;
              return OtpVerificationScreen(phone: phone ?? '');
            },
          ),
          GoRoute(
            path: 'profile-setup',
            name: 'profile-setup',
            builder: (context, state) => const ProfileSetupScreen(),
          ),
        ],
      ),
      
      // Main App Routes
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (context, state) => const HomeScreen(),
      ),
      
      GoRoute(
        path: '/box/:id',
        name: 'box-details',
        builder: (context, state) {
          final boxId = state.pathParameters['id']!;
          return BoxDetailsScreen(boxId: boxId);
        },
      ),
      
      GoRoute(
        path: '/cart',
        name: 'cart',
        builder: (context, state) => const CartScreen(),
      ),
      
      GoRoute(
        path: '/reservations',
        name: 'reservations',
        builder: (context, state) => const ReservationsScreen(),
      ),
      
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) => const ProfileScreen(),
      ),
    ],
    
    // Error handling
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'The page you\'re looking for doesn\'t exist.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
});

/// Typed route extensions for better navigation
extension AppRouterExtensions on GoRouter {
  void goToSplash() => go('/splash');
  void goToAuth() => go('/auth');
  void goToOtpVerification(String phone) => go('/auth/otp', extra: phone);
  void goToProfileSetup() => go('/auth/profile-setup');
  void goToHome() => go('/home');
  void goToBoxDetails(String boxId) => go('/box/$boxId');
  void goToCart() => go('/cart');
  void goToReservations() => go('/reservations');
  void goToProfile() => go('/profile');
  
  void pushBoxDetails(String boxId) => push('/box/$boxId');
  void pushCart() => push('/cart');
  void pushReservations() => push('/reservations');
  void pushProfile() => push('/profile');
}
