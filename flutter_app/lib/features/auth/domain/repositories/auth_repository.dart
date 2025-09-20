import '../../../../core/models/models.dart';

/// Authentication repository interface
abstract class AuthRepository {
  /// Send OTP to phone number
  Future<SendOtpResponse> sendOtp(SendOtpRequest request);
  
  /// Verify OTP and get tokens
  Future<VerifyOtpResponse> verifyOtp(VerifyOtpRequest request);
  
  /// Refresh access token
  Future<RefreshTokenResponse> refreshToken(RefreshTokenRequest request);
  
  /// Get user profile
  Future<UserProfileResponse> getProfile();
  
  /// Update user profile
  Future<UserProfileResponse> updateProfile(UpdateProfileRequest request);
  
  /// Logout user
  Future<LogoutResponse> logout(LogoutRequest request);
}

