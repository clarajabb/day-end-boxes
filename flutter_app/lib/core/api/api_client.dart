import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../http/http_client.dart';
import '../models/models.dart';

part 'api_client.g.dart';

/// Main API client for Day-End Boxes backend
@RestApi(baseUrl: 'http://localhost:3000/api/v1')
abstract class ApiClient {
  factory ApiClient(Dio dio, {String baseUrl}) = _ApiClient;
  
  /// Authentication endpoints
  @POST('/auth/send-otp')
  Future<SendOtpResponse> sendOtp(@Body() SendOtpRequest request);
  
  @POST('/auth/verify-otp')
  Future<VerifyOtpResponse> verifyOtp(@Body() VerifyOtpRequest request);
  
  @POST('/auth/refresh')
  Future<RefreshTokenResponse> refreshToken(@Body() RefreshTokenRequest request);
  
  @GET('/auth/profile')
  Future<UserProfileResponse> getProfile();
  
  @PATCH('/auth/profile')
  Future<UserProfileResponse> updateProfile(@Body() UpdateProfileRequest request);
  
  @POST('/auth/logout')
  Future<LogoutResponse> logout(@Body() LogoutRequest request);
  
  /// User endpoints
  @GET('/users/profile')
  Future<UserProfileResponse> getUserProfile();
  
  @GET('/users/stats')
  Future<UserStatsResponse> getUserStats();
  
  /// Merchant endpoints
  @GET('/merchants')
  Future<MerchantListResponse> getMerchants();
  
  @GET('/merchants/:id')
  Future<MerchantDetailsResponse> getMerchantDetails(@Path('id') String id);
  
  @GET('/merchants-test/stats')
  Future<MerchantStatsResponse> getMerchantStats();
  
  @GET('/merchants-test/top-rated')
  Future<MerchantListResponse> getTopRatedMerchants();
  
  @GET('/merchants-test/sustainable')
  Future<MerchantListResponse> getSustainableMerchants();
  
  @GET('/merchants-test/search')
  Future<MerchantListResponse> searchMerchants(@Queries() Map<String, dynamic> queries);
  
  /// Box endpoints
  @GET('/boxes/nearby')
  Future<BoxListResponse> getNearbyBoxes(@Queries() Map<String, dynamic> queries);
  
  @GET('/boxes/:id')
  Future<BoxDetailsResponse> getBoxDetails(@Path('id') String id);
  
  /// Reservation endpoints
  @GET('/reservations')
  Future<ReservationListResponse> getReservations();
  
  @POST('/reservations')
  Future<CreateReservationResponse> createReservation(@Body() BoxReservationRequest request);
  
  @DELETE('/reservations/:id')
  Future<CancelReservationResponse> cancelReservation(
    @Path('id') String id,
    @Body() CancelReservationRequest request,
  );
  
  /// Admin endpoints
  @GET('/admin/stats')
  Future<Map<String, dynamic>> getAdminStats();
}

/// API client provider
final apiClientProvider = Provider<ApiClient>((ref) {
  final dio = ref.watch(httpClientProvider);
  return ApiClient(dio);
});

