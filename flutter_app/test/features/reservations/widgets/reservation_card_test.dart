import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:day_end_boxes/features/reservations/presentation/widgets/reservation_card.dart';
import 'package:day_end_boxes/features/reservations/domain/entities/reservation.dart';
import 'package:day_end_boxes/features/boxes/domain/entities/box.dart';
import 'package:day_end_boxes/core/theme/app_theme.dart';

void main() {
  group('ReservationCard Widget Tests', () {
    late ReservationWithDetails mockReservation;

    setUp(() {
      final merchant = Merchant(
        id: 'merchant_1',
        businessName: 'Test Restaurant',
        contactName: 'John Doe',
        email: 'test@restaurant.com',
        phone: '+96171123456',
        category: MerchantCategory.restaurant,
        address: '123 Test Street, Beirut',
        latitude: 33.8938,
        longitude: 35.5018,
        operatingHours: {},
        status: MerchantStatus.approved,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      final boxType = BoxType(
        id: 'box_type_1',
        merchantId: 'merchant_1',
        name: 'Surprise Box',
        description: 'A delicious surprise box with various items',
        originalPrice: 30.0,
        discountedPrice: 10.0,
        category: BoxCategory.restaurant,
        allergens: ['nuts', 'dairy'],
        dietaryInfo: [DietaryInfo.vegetarian],
        images: ['image1.jpg', 'image2.jpg'],
        isActive: true,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      final boxInventory = BoxInventory(
        id: 'inventory_1',
        boxTypeId: 'box_type_1',
        availableDate: DateTime.now(),
        originalQuantity: 10,
        remainingQuantity: 5,
        price: 10.0,
        pickupStartTime: '18:00',
        pickupEndTime: '20:00',
        status: InventoryStatus.active,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      final boxInventoryWithMerchant = BoxInventoryWithMerchant(
        boxInventory: boxInventory,
        boxType: boxType,
        merchant: merchant,
        distance: 2.5,
      );

      final reservation = Reservation(
        id: 'reservation_1',
        userId: 'user_1',
        boxInventoryId: 'inventory_1',
        status: ReservationStatus.active,
        pickupCode: '123456',
        totalAmount: 10.0,
        reservedAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(minutes: 20)),
        paymentStatus: PaymentStatus.pending,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      mockReservation = ReservationWithDetails(
        reservation: reservation,
        boxInventory: boxInventoryWithMerchant,
      );
    });

    Widget createWidgetUnderTest({
      ReservationWithDetails? reservation,
      VoidCallback? onTap,
      VoidCallback? onCancel,
    }) {
      return ProviderScope(
        child: MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: ReservationCard(
              reservation: reservation ?? mockReservation,
              onTap: onTap,
              onCancel: onCancel,
            ),
          ),
        ),
      );
    }

    testWidgets('should display reservation information correctly', (tester) async {
      // Act
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Test Restaurant'), findsOneWidget);
      expect(find.text('Surprise Box'), findsOneWidget);
      expect(find.text('\$10.00'), findsOneWidget);
      expect(find.text('18:00 - 20:00'), findsOneWidget);
      expect(find.text('123456'), findsOneWidget);
    });

    testWidgets('should show active status badge for active reservation', (tester) async {
      // Act
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Active'), findsOneWidget);
      
      // Check if the badge has the correct color
      final badge = tester.widget<Container>(
        find.descendant(
          of: find.byType(Container),
          matching: find.byWidgetPredicate((widget) =>
              widget is Container &&
              widget.decoration is BoxDecoration &&
              (widget.decoration as BoxDecoration).color == Colors.green.withOpacity(0.1)),
        ),
      );
      expect(badge, isNotNull);
    });

    testWidgets('should show completed status for completed reservation', (tester) async {
      // Arrange
      final completedReservation = ReservationWithDetails(
        reservation: mockReservation.reservation.copyWith(
          status: ReservationStatus.completed,
          completedAt: DateTime.now(),
        ),
        boxInventory: mockReservation.boxInventory,
      );

      // Act
      await tester.pumpWidget(createWidgetUnderTest(reservation: completedReservation));
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Completed'), findsOneWidget);
    });

    testWidgets('should show time remaining for active reservation', (tester) async {
      // Act
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Assert
      expect(find.textContaining('m'), findsOneWidget); // Should show minutes remaining
    });

    testWidgets('should call onTap when card is tapped', (tester) async {
      // Arrange
      bool onTapCalled = false;
      void onTap() => onTapCalled = true;

      // Act
      await tester.pumpWidget(createWidgetUnderTest(onTap: onTap));
      await tester.pumpAndSettle();
      
      await tester.tap(find.byType(Card));
      await tester.pumpAndSettle();

      // Assert
      expect(onTapCalled, true);
    });

    testWidgets('should show cancel button for active reservation', (tester) async {
      // Act
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Cancel'), findsOneWidget);
    });

    testWidgets('should not show cancel button for completed reservation', (tester) async {
      // Arrange
      final completedReservation = ReservationWithDetails(
        reservation: mockReservation.reservation.copyWith(
          status: ReservationStatus.completed,
          completedAt: DateTime.now(),
        ),
        boxInventory: mockReservation.boxInventory,
      );

      // Act
      await tester.pumpWidget(createWidgetUnderTest(reservation: completedReservation));
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Cancel'), findsNothing);
    });

    testWidgets('should call onCancel when cancel button is tapped', (tester) async {
      // Arrange
      bool onCancelCalled = false;
      void onCancel() => onCancelCalled = true;

      // Act
      await tester.pumpWidget(createWidgetUnderTest(onCancel: onCancel));
      await tester.pumpAndSettle();
      
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();

      // Assert
      expect(onCancelCalled, true);
    });

    testWidgets('should show expired status for expired reservation', (tester) async {
      // Arrange
      final expiredReservation = ReservationWithDetails(
        reservation: mockReservation.reservation.copyWith(
          status: ReservationStatus.expired,
          expiresAt: DateTime.now().subtract(const Duration(minutes: 10)),
        ),
        boxInventory: mockReservation.boxInventory,
      );

      // Act
      await tester.pumpWidget(createWidgetUnderTest(reservation: expiredReservation));
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Expired'), findsOneWidget);
      expect(find.text('Cancel'), findsNothing); // No cancel button for expired
    });

    testWidgets('should display merchant address', (tester) async {
      // Act
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('123 Test Street, Beirut'), findsOneWidget);
    });

    testWidgets('should display distance if available', (tester) async {
      // Act
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('2.5 km away'), findsOneWidget);
    });

    testWidgets('should display dietary info chips', (tester) async {
      // Act
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Vegetarian'), findsOneWidget);
    });

    testWidgets('should have proper accessibility labels', (tester) async {
      // Act
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Assert
      expect(
        find.bySemanticsLabel('Reservation card for Test Restaurant'),
        findsOneWidget,
      );
    });
  });
}
