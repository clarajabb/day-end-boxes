import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Secure storage service for sensitive data like JWT tokens
class SecureStorageService {
  SecureStorageService._();
  
  static final SecureStorageService instance = SecureStorageService._();
  
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );
  
  // Keys
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userIdKey = 'user_id';
  static const String _phoneKey = 'phone';
  
  /// Save authentication tokens
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: accessToken),
      _storage.write(key: _refreshTokenKey, value: refreshToken),
    ]);
  }
  
  /// Get access token
  Future<String?> get accessToken async {
    return await _storage.read(key: _accessTokenKey);
  }
  
  /// Get refresh token
  Future<String?> get refreshToken async {
    return await _storage.read(key: _refreshTokenKey);
  }
  
  /// Save user ID
  Future<void> saveUserId(String userId) async {
    await _storage.write(key: _userIdKey, value: userId);
  }
  
  /// Get user ID
  Future<String?> get userId async {
    return await _storage.read(key: _userIdKey);
  }
  
  /// Save phone number
  Future<void> savePhone(String phone) async {
    await _storage.write(key: _phoneKey, value: phone);
  }
  
  /// Get phone number
  Future<String?> get phone async {
    return await _storage.read(key: _phoneKey);
  }
  
  /// Clear all tokens
  Future<void> clearTokens() async {
    await _storage.deleteAll();
  }
  
  /// Check if user is logged in
  Future<bool> get isLoggedIn async {
    final token = await accessToken;
    return token != null && token.isNotEmpty;
  }
  
  /// Get all stored data
  Future<Map<String, String?>> getAll() async {
    return await _storage.readAll();
  }
  
  /// Delete specific key
  Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }
  
  /// Check if key exists
  Future<bool> containsKey(String key) async {
    return await _storage.containsKey(key: key);
  }
}

/// Provider for secure storage service
final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService.instance;
});
