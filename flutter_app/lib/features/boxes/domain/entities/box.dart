import 'package:json_annotation/json_annotation.dart';

part 'box.g.dart';

@JsonSerializable()
class BoxType {
  final String id;
  final String merchantId;
  final String name;
  final String description;
  final double originalPrice;
  final double discountedPrice;
  final BoxCategory category;
  final List<String> allergens;
  final List<DietaryInfo> dietaryInfo;
  final List<String> images;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  const BoxType({
    required this.id,
    required this.merchantId,
    required this.name,
    required this.description,
    required this.originalPrice,
    required this.discountedPrice,
    required this.category,
    required this.allergens,
    required this.dietaryInfo,
    required this.images,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory BoxType.fromJson(Map<String, dynamic> json) => _$BoxTypeFromJson(json);
  Map<String, dynamic> toJson() => _$BoxTypeToJson(this);

  double get savingsPercentage => 
      ((originalPrice - discountedPrice) / originalPrice * 100);

  @override
  String toString() => 'BoxType(id: $id, name: $name, category: $category)';
}

@JsonSerializable()
class BoxInventory {
  final String id;
  final String boxTypeId;
  final DateTime availableDate;
  final int originalQuantity;
  final int remainingQuantity;
  final double price;
  final String pickupStartTime;
  final String pickupEndTime;
  final InventoryStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  const BoxInventory({
    required this.id,
    required this.boxTypeId,
    required this.availableDate,
    required this.originalQuantity,
    required this.remainingQuantity,
    required this.price,
    required this.pickupStartTime,
    required this.pickupEndTime,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory BoxInventory.fromJson(Map<String, dynamic> json) => 
      _$BoxInventoryFromJson(json);
  Map<String, dynamic> toJson() => _$BoxInventoryToJson(this);

  bool get isAvailable => status == InventoryStatus.active && remainingQuantity > 0;
  
  double get availabilityPercentage => 
      originalQuantity > 0 ? (remainingQuantity / originalQuantity) : 0.0;

  @override
  String toString() => 'BoxInventory(id: $id, remaining: $remainingQuantity)';
}

@JsonSerializable()
class Merchant {
  final String id;
  final String businessName;
  final String contactName;
  final String email;
  final String phone;
  final MerchantCategory category;
  final String address;
  final double latitude;
  final double longitude;
  final String? description;
  final String? businessLicense;
  final String? profileImage;
  final Map<String, dynamic> operatingHours;
  final MerchantStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Merchant({
    required this.id,
    required this.businessName,
    required this.contactName,
    required this.email,
    required this.phone,
    required this.category,
    required this.address,
    required this.latitude,
    required this.longitude,
    this.description,
    this.businessLicense,
    this.profileImage,
    required this.operatingHours,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Merchant.fromJson(Map<String, dynamic> json) => 
      _$MerchantFromJson(json);
  Map<String, dynamic> toJson() => _$MerchantToJson(this);

  @override
  String toString() => 'Merchant(id: $id, businessName: $businessName)';
}

@JsonSerializable()
class BoxInventoryWithMerchant {
  final BoxInventory boxInventory;
  final BoxType boxType;
  final Merchant merchant;
  final double? distance; // Distance in kilometers

  const BoxInventoryWithMerchant({
    required this.boxInventory,
    required this.boxType,
    required this.merchant,
    this.distance,
  });

  factory BoxInventoryWithMerchant.fromJson(Map<String, dynamic> json) => 
      _$BoxInventoryWithMerchantFromJson(json);
  Map<String, dynamic> toJson() => _$BoxInventoryWithMerchantToJson(this);

  String get distanceText => distance != null 
      ? '${distance!.toStringAsFixed(1)} km'
      : '';

  @override
  String toString() => 
      'BoxInventoryWithMerchant(merchant: ${merchant.businessName}, distance: $distance)';
}

@JsonSerializable()
class Review {
  final String id;
  final String userId;
  final String merchantId;
  final String reservationId;
  final int rating;
  final String? comment;
  final bool isVisible;
  final DateTime createdAt;
  final DateTime updatedAt;
  final ReviewUser? user;

  const Review({
    required this.id,
    required this.userId,
    required this.merchantId,
    required this.reservationId,
    required this.rating,
    this.comment,
    required this.isVisible,
    required this.createdAt,
    required this.updatedAt,
    this.user,
  });

  factory Review.fromJson(Map<String, dynamic> json) => _$ReviewFromJson(json);
  Map<String, dynamic> toJson() => _$ReviewToJson(this);

  @override
  String toString() => 'Review(id: $id, rating: $rating)';
}

@JsonSerializable()
class ReviewUser {
  final String name;

  const ReviewUser({required this.name});

  factory ReviewUser.fromJson(Map<String, dynamic> json) => 
      _$ReviewUserFromJson(json);
  Map<String, dynamic> toJson() => _$ReviewUserToJson(this);
}

// Enums
enum BoxCategory {
  @JsonValue('BAKERY')
  bakery,
  @JsonValue('RESTAURANT')
  restaurant,
  @JsonValue('SUPERMARKET')
  supermarket,
  @JsonValue('CAFE')
  cafe,
  @JsonValue('GROCERY')
  grocery,
}

enum DietaryInfo {
  @JsonValue('VEGETARIAN')
  vegetarian,
  @JsonValue('VEGAN')
  vegan,
  @JsonValue('GLUTEN_FREE')
  glutenFree,
  @JsonValue('DAIRY_FREE')
  dairyFree,
  @JsonValue('HALAL')
  halal,
}

enum MerchantCategory {
  @JsonValue('BAKERY')
  bakery,
  @JsonValue('RESTAURANT')
  restaurant,
  @JsonValue('SUPERMARKET')
  supermarket,
  @JsonValue('CAFE')
  cafe,
  @JsonValue('GROCERY')
  grocery,
}

enum MerchantStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('APPROVED')
  approved,
  @JsonValue('REJECTED')
  rejected,
  @JsonValue('SUSPENDED')
  suspended,
}

enum InventoryStatus {
  @JsonValue('ACTIVE')
  active,
  @JsonValue('SOLD_OUT')
  soldOut,
  @JsonValue('EXPIRED')
  expired,
}

// Extension methods for better display
extension BoxCategoryExtension on BoxCategory {
  String get displayName {
    switch (this) {
      case BoxCategory.bakery:
        return 'Bakery';
      case BoxCategory.restaurant:
        return 'Restaurant';
      case BoxCategory.supermarket:
        return 'Supermarket';
      case BoxCategory.cafe:
        return 'Café';
      case BoxCategory.grocery:
        return 'Grocery';
    }
  }

  IconData get icon {
    switch (this) {
      case BoxCategory.bakery:
        return Icons.bakery_dining;
      case BoxCategory.restaurant:
        return Icons.restaurant;
      case BoxCategory.supermarket:
        return Icons.store;
      case BoxCategory.cafe:
        return Icons.local_cafe;
      case BoxCategory.grocery:
        return Icons.shopping_cart;
    }
  }
}

extension DietaryInfoExtension on DietaryInfo {
  String get displayName {
    switch (this) {
      case DietaryInfo.vegetarian:
        return 'Vegetarian';
      case DietaryInfo.vegan:
        return 'Vegan';
      case DietaryInfo.glutenFree:
        return 'Gluten-Free';
      case DietaryInfo.dairyFree:
        return 'Dairy-Free';
      case DietaryInfo.halal:
        return 'Halal';
    }
  }

  Color get color {
    switch (this) {
      case DietaryInfo.vegetarian:
        return Colors.green;
      case DietaryInfo.vegan:
        return Colors.lightGreen;
      case DietaryInfo.glutenFree:
        return Colors.orange;
      case DietaryInfo.dairyFree:
        return Colors.blue;
      case DietaryInfo.halal:
        return Colors.purple;
    }
  }
}
