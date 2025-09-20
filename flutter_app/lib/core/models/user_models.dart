import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_models.freezed.dart';
part 'user_models.g.dart';

/// User profile model
@freezed
class UserProfile with _$UserProfile {
  const factory UserProfile({
    required String id,
    required String phone,
    String? name,
    String? email,
    required String locale,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _UserProfile;

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);
}

/// User statistics model
@freezed
class UserStats with _$UserStats {
  const factory UserStats({
    required int totalReservations,
    required int activeReservations,
    required int completedReservations,
    required int cancelledReservations,
    required double totalSavings,
    required double averageRating,
  }) = _UserStats;

  factory UserStats.fromJson(Map<String, dynamic> json) =>
      _$UserStatsFromJson(json);
}

/// User profile response model
@freezed
class UserProfileResponse with _$UserProfileResponse {
  const factory UserProfileResponse({
    required bool success,
    required UserProfile data,
    String? message,
  }) = _UserProfileResponse;

  factory UserProfileResponse.fromJson(Map<String, dynamic> json) =>
      _$UserProfileResponseFromJson(json);
}

/// User stats response model
@freezed
class UserStatsResponse with _$UserStatsResponse {
  const factory UserStatsResponse({
    required bool success,
    required UserStats data,
    String? message,
  }) = _UserStatsResponse;

  factory UserStatsResponse.fromJson(Map<String, dynamic> json) =>
      _$UserStatsResponseFromJson(json);
}

