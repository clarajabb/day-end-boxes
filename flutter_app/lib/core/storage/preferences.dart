import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Preferences service for non-sensitive app settings
class PreferencesService {
  PreferencesService._();
  
  static final PreferencesService instance = PreferencesService._();
  
  SharedPreferences? _prefs;
  
  /// Initialize preferences
  Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }
  
  /// Ensure preferences are initialized
  Future<void> _ensureInitialized() async {
    if (_prefs == null) {
      await init();
    }
  }
  
  // Keys
  static const String _localeKey = 'locale';
  static const String _currencyKey = 'currency';
  static const String _notificationsKey = 'notifications_enabled';
  static const String _locationPermissionKey = 'location_permission_granted';
  static const String _onboardingCompletedKey = 'onboarding_completed';
  static const String _themeKey = 'theme';
  static const String _lastLocationLatKey = 'last_location_lat';
  static const String _lastLocationLngKey = 'last_location_lng';
  static const String _searchRadiusKey = 'search_radius';
  static const String _favoriteMerchantsKey = 'favorite_merchants';
  static const String _recentSearchesKey = 'recent_searches';
  
  /// Save locale preference
  Future<void> setLocale(String locale) async {
    await _ensureInitialized();
    await _prefs!.setString(_localeKey, locale);
  }
  
  /// Get locale preference
  Future<String> getLocale() async {
    await _ensureInitialized();
    return _prefs!.getString(_localeKey) ?? 'en';
  }
  
  /// Save currency preference
  Future<void> setCurrency(String currency) async {
    await _ensureInitialized();
    await _prefs!.setString(_currencyKey, currency);
  }
  
  /// Get currency preference
  Future<String> getCurrency() async {
    await _ensureInitialized();
    return _prefs!.getString(_currencyKey) ?? 'LBP';
  }
  
  /// Save notifications preference
  Future<void> setNotificationsEnabled(bool enabled) async {
    await _ensureInitialized();
    await _prefs!.setBool(_notificationsKey, enabled);
  }
  
  /// Get notifications preference
  Future<bool> getNotificationsEnabled() async {
    await _ensureInitialized();
    return _prefs!.getBool(_notificationsKey) ?? true;
  }
  
  /// Save location permission status
  Future<void> setLocationPermissionGranted(bool granted) async {
    await _ensureInitialized();
    await _prefs!.setBool(_locationPermissionKey, granted);
  }
  
  /// Get location permission status
  Future<bool> getLocationPermissionGranted() async {
    await _ensureInitialized();
    return _prefs!.getBool(_locationPermissionKey) ?? false;
  }
  
  /// Save onboarding completion status
  Future<void> setOnboardingCompleted(bool completed) async {
    await _ensureInitialized();
    await _prefs!.setBool(_onboardingCompletedKey, completed);
  }
  
  /// Get onboarding completion status
  Future<bool> getOnboardingCompleted() async {
    await _ensureInitialized();
    return _prefs!.getBool(_onboardingCompletedKey) ?? false;
  }
  
  /// Save theme preference
  Future<void> setTheme(String theme) async {
    await _ensureInitialized();
    await _prefs!.setString(_themeKey, theme);
  }
  
  /// Get theme preference
  Future<String> getTheme() async {
    await _ensureInitialized();
    return _prefs!.getString(_themeKey) ?? 'light';
  }
  
  /// Save last known location
  Future<void> setLastLocation(double latitude, double longitude) async {
    await _ensureInitialized();
    await Future.wait([
      _prefs!.setDouble(_lastLocationLatKey, latitude),
      _prefs!.setDouble(_lastLocationLngKey, longitude),
    ]);
  }
  
  /// Get last known location
  Future<Map<String, double?>> getLastLocation() async {
    await _ensureInitialized();
    return {
      'latitude': _prefs!.getDouble(_lastLocationLatKey),
      'longitude': _prefs!.getDouble(_lastLocationLngKey),
    };
  }
  
  /// Save search radius
  Future<void> setSearchRadius(double radius) async {
    await _ensureInitialized();
    await _prefs!.setDouble(_searchRadiusKey, radius);
  }
  
  /// Get search radius
  Future<double> getSearchRadius() async {
    await _ensureInitialized();
    return _prefs!.getDouble(_searchRadiusKey) ?? 10.0;
  }
  
  /// Save favorite merchants
  Future<void> setFavoriteMerchants(List<String> merchantIds) async {
    await _ensureInitialized();
    await _prefs!.setStringList(_favoriteMerchantsKey, merchantIds);
  }
  
  /// Get favorite merchants
  Future<List<String>> getFavoriteMerchants() async {
    await _ensureInitialized();
    return _prefs!.getStringList(_favoriteMerchantsKey) ?? [];
  }
  
  /// Add favorite merchant
  Future<void> addFavoriteMerchant(String merchantId) async {
    final favorites = await getFavoriteMerchants();
    if (!favorites.contains(merchantId)) {
      favorites.add(merchantId);
      await setFavoriteMerchants(favorites);
    }
  }
  
  /// Remove favorite merchant
  Future<void> removeFavoriteMerchant(String merchantId) async {
    final favorites = await getFavoriteMerchants();
    favorites.remove(merchantId);
    await setFavoriteMerchants(favorites);
  }
  
  /// Save recent searches
  Future<void> setRecentSearches(List<String> searches) async {
    await _ensureInitialized();
    await _prefs!.setStringList(_recentSearchesKey, searches);
  }
  
  /// Get recent searches
  Future<List<String>> getRecentSearches() async {
    await _ensureInitialized();
    return _prefs!.getStringList(_recentSearchesKey) ?? [];
  }
  
  /// Add recent search
  Future<void> addRecentSearch(String search) async {
    final searches = await getRecentSearches();
    searches.remove(search); // Remove if already exists
    searches.insert(0, search); // Add to beginning
    if (searches.length > 10) {
      searches.removeLast(); // Keep only last 10
    }
    await setRecentSearches(searches);
  }
  
  /// Clear all preferences
  Future<void> clearAll() async {
    await _ensureInitialized();
    await _prefs!.clear();
  }
  
  /// Clear specific preference
  Future<void> clear(String key) async {
    await _ensureInitialized();
    await _prefs!.remove(key);
  }
}

/// Provider for preferences service
final preferencesProvider = Provider<PreferencesService>((ref) {
  return PreferencesService.instance;
});

