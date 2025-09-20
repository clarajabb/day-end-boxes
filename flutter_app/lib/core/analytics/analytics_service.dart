import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';

part 'analytics_service.g.dart';

/// Analytics service for tracking user behavior and app performance
class AnalyticsService {
  AnalyticsService._();
  
  static final AnalyticsService instance = AnalyticsService._();
  
  final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;
  final FirebaseCrashlytics _crashlytics = FirebaseCrashlytics.instance;
  
  /// Track screen view
  Future<void> logScreenView(String screenName, {String? screenClass}) async {
    await _analytics.logScreenView(
      screenName: screenName,
      screenClass: screenClass,
    );
  }
  
  /// Track user login
  Future<void> logLogin(String loginMethod) async {
    await _analytics.logLogin(loginMethod: loginMethod);
  }
  
  /// Track user sign up
  Future<void> logSignUp(String signUpMethod) async {
    await _analytics.logSignUp(signUpMethod: signUpMethod);
  }
  
  /// Track search
  Future<void> logSearch(String searchTerm) async {
    await _analytics.logSearch(searchTerm: searchTerm);
  }
  
  /// Track view item
  Future<void> logViewItem({
    required String itemId,
    required String itemName,
    required String itemCategory,
    double? value,
    String? currency,
  }) async {
    await _analytics.logViewItem(
      itemId: itemId,
      itemName: itemName,
      itemCategory: itemCategory,
      value: value,
      currency: currency,
    );
  }
  
  /// Track add to cart
  Future<void> logAddToCart({
    required String itemId,
    required String itemName,
    required String itemCategory,
    required int quantity,
    double? value,
    String? currency,
  }) async {
    await _analytics.logAddToCart(
      itemId: itemId,
      itemName: itemName,
      itemCategory: itemCategory,
      quantity: quantity,
      value: value,
      currency: currency,
    );
  }
  
  /// Track purchase
  Future<void> logPurchase({
    required String transactionId,
    required double value,
    required String currency,
    List<Map<String, dynamic>>? items,
  }) async {
    await _analytics.logPurchase(
      transactionId: transactionId,
      value: value,
      currency: currency,
      items: items,
    );
  }
  
  /// Track custom event
  Future<void> logEvent(String name, {Map<String, dynamic>? parameters}) async {
    await _analytics.logEvent(
      name: name,
      parameters: parameters,
    );
  }
  
  /// Track reservation created
  Future<void> logReservationCreated({
    required String reservationId,
    required String boxId,
    required String merchantId,
    required double value,
    required String currency,
  }) async {
    await logEvent('reservation_created', parameters: {
      'reservation_id': reservationId,
      'box_id': boxId,
      'merchant_id': merchantId,
      'value': value,
      'currency': currency,
    });
  }
  
  /// Track reservation completed
  Future<void> logReservationCompleted({
    required String reservationId,
    required String boxId,
    required String merchantId,
    required double value,
    required String currency,
  }) async {
    await logEvent('reservation_completed', parameters: {
      'reservation_id': reservationId,
      'box_id': boxId,
      'merchant_id': merchantId,
      'value': value,
      'currency': currency,
    });
  }
  
  /// Track reservation cancelled
  Future<void> logReservationCancelled({
    required String reservationId,
    required String boxId,
    required String merchantId,
    String? reason,
  }) async {
    await logEvent('reservation_cancelled', parameters: {
      'reservation_id': reservationId,
      'box_id': boxId,
      'merchant_id': merchantId,
      'reason': reason,
    });
  }
  
  /// Track box viewed
  Future<void> logBoxViewed({
    required String boxId,
    required String merchantId,
    required String category,
    required double originalPrice,
    required double discountedPrice,
  }) async {
    await logViewItem(
      itemId: boxId,
      itemName: 'Box',
      itemCategory: category,
      value: discountedPrice,
      currency: 'LBP',
    );
  }
  
  /// Track merchant viewed
  Future<void> logMerchantViewed({
    required String merchantId,
    required String merchantName,
    required String category,
  }) async {
    await logEvent('merchant_viewed', parameters: {
      'merchant_id': merchantId,
      'merchant_name': merchantName,
      'category': category,
    });
  }
  
  /// Track location permission granted
  Future<void> logLocationPermissionGranted() async {
    await logEvent('location_permission_granted');
  }
  
  /// Track location permission denied
  Future<void> logLocationPermissionDenied() async {
    await logEvent('location_permission_denied');
  }
  
  /// Track OTP sent
  Future<void> logOtpSent(String phone) async {
    await logEvent('otp_sent', parameters: {
      'phone': phone,
    });
  }
  
  /// Track OTP verified
  Future<void> logOtpVerified(String phone) async {
    await logEvent('otp_verified', parameters: {
      'phone': phone,
    });
  }
  
  /// Track error
  Future<void> logError(String error, {String? context}) async {
    await _crashlytics.recordError(
      error,
      StackTrace.current,
      context: context,
    );
  }
  
  /// Set user properties
  Future<void> setUserProperties({
    String? userId,
    String? phone,
    String? locale,
    String? currency,
  }) async {
    if (userId != null) {
      await _analytics.setUserId(id: userId);
    }
    
    await _analytics.setUserProperties(
      phone: phone,
      locale: locale,
      currency: currency,
    );
  }
  
  /// Clear user data
  Future<void> clearUserData() async {
    await _analytics.setUserId(id: null);
    await _analytics.resetAnalyticsData();
  }
}

/// Analytics service provider
@riverpod
AnalyticsService analyticsService(AnalyticsServiceRef ref) {
  return AnalyticsService.instance;
}

