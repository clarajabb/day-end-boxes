import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:retrofit/retrofit.dart';
import '../env/environment.dart';
import 'interceptors.dart';

/// HTTP client provider using Dio with interceptors
final httpClientProvider = Provider<Dio>((ref) {
  final dio = Dio();
  
  // Base configuration
  dio.options.baseUrl = Environment.apiBaseUrl;
  dio.options.connectTimeout = const Duration(seconds: 30);
  dio.options.receiveTimeout = const Duration(seconds: 30);
  dio.options.sendTimeout = const Duration(seconds: 30);
  
  // Add interceptors
  dio.interceptors.addAll([
    AuthInterceptor(),
    LoggingInterceptor(),
    RetryInterceptor(),
    ErrorInterceptor(),
  ]);
  
  return dio;
});

/// API client base class for Retrofit
abstract class ApiClient {
  static Dio? _dio;
  
  static Dio get dio {
    _dio ??= Dio();
    return _dio!;
  }
  
  static void configure(Dio dio) {
    _dio = dio;
  }
}

/// HTTP methods enum
enum HttpMethod {
  get,
  post,
  put,
  patch,
  delete,
}

/// API response wrapper
class ApiResponse<T> {
  const ApiResponse({
    required this.success,
    required this.data,
    this.message,
    this.errors,
  });

  final bool success;
  final T data;
  final String? message;
  final List<String>? errors;

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] ?? false,
      data: fromJsonT(json['data']),
      message: json['message'],
      errors: json['errors']?.cast<String>(),
    );
  }
}

/// API error model
class ApiError {
  const ApiError({
    required this.message,
    this.code,
    this.details,
  });

  final String message;
  final String? code;
  final Map<String, dynamic>? details;

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      message: json['message'] ?? 'An error occurred',
      code: json['code'],
      details: json['details'],
    );
  }
}

