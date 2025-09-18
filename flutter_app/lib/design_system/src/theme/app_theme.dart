import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../tokens/tokens.dart';

/// App theme following Uber/Uber Eats/TooGoodToGo design principles
/// Clean, high-contrast, fast, and straight to the point
class AppTheme {
  AppTheme._();

  /// Light theme (primary theme for v1)
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      
      // Color scheme
      colorScheme: const ColorScheme.light(
        primary: DesignTokens.accentEco,
        secondary: DesignTokens.accentEco,
        surface: DesignTokens.surface,
        background: DesignTokens.background,
        error: DesignTokens.danger,
        onPrimary: DesignTokens.background,
        onSecondary: DesignTokens.background,
        onSurface: DesignTokens.textInk,
        onBackground: DesignTokens.textInk,
        onError: DesignTokens.background,
      ),

      // Typography
      textTheme: _buildTextTheme(),
      
      // App bar theme
      appBarTheme: _buildAppBarTheme(),
      
      // Card theme
      cardTheme: _buildCardTheme(),
      
      // Button themes
      elevatedButtonTheme: _buildElevatedButtonTheme(),
      textButtonTheme: _buildTextButtonTheme(),
      outlinedButtonTheme: _buildOutlinedButtonTheme(),
      
      // Input decoration theme
      inputDecorationTheme: _buildInputDecorationTheme(),
      
      // Bottom sheet theme
      bottomSheetTheme: _buildBottomSheetTheme(),
      
      // Chip theme
      chipTheme: _buildChipTheme(),
      
      // Icon theme
      iconTheme: _buildIconTheme(),
      
      // Divider theme
      dividerTheme: _buildDividerTheme(),
      
      // Scaffold background
      scaffoldBackgroundColor: DesignTokens.background,
      
      // Visual density
      visualDensity: VisualDensity.adaptivePlatformDensity,
    );
  }

  static TextTheme _buildTextTheme() {
    final baseTextTheme = GoogleFonts.interTextTheme();
    
    return baseTextTheme.copyWith(
      // Display styles
      displayLarge: GoogleFonts.inter(
        fontSize: DesignTokens.fontSize4xl,
        fontWeight: DesignTokens.fontWeightBold,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingTight,
      ),
      displayMedium: GoogleFonts.inter(
        fontSize: DesignTokens.fontSize3xl,
        fontWeight: DesignTokens.fontWeightBold,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingTight,
      ),
      displaySmall: GoogleFonts.inter(
        fontSize: DesignTokens.fontSize2xl,
        fontWeight: DesignTokens.fontWeightSemibold,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingTight,
      ),
      
      // Headline styles
      headlineLarge: GoogleFonts.inter(
        fontSize: DesignTokens.fontSize2xl,
        fontWeight: DesignTokens.fontWeightSemibold,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingTight,
      ),
      headlineMedium: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeXl,
        fontWeight: DesignTokens.fontWeightSemibold,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingTight,
      ),
      headlineSmall: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeLg,
        fontWeight: DesignTokens.fontWeightMedium,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingNormal,
      ),
      
      // Title styles
      titleLarge: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeLg,
        fontWeight: DesignTokens.fontWeightMedium,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingNormal,
      ),
      titleMedium: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeMd,
        fontWeight: DesignTokens.fontWeightMedium,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingNormal,
      ),
      titleSmall: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeSm,
        fontWeight: DesignTokens.fontWeightMedium,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingNormal,
      ),
      
      // Body styles
      bodyLarge: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeMd,
        fontWeight: DesignTokens.fontWeightNormal,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingNormal,
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeSm,
        fontWeight: DesignTokens.fontWeightNormal,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingNormal,
      ),
      bodySmall: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeXs,
        fontWeight: DesignTokens.fontWeightNormal,
        color: DesignTokens.textSecondary,
        letterSpacing: DesignTokens.letterSpacingNormal,
      ),
      
      // Label styles
      labelLarge: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeSm,
        fontWeight: DesignTokens.fontWeightMedium,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingWide,
      ),
      labelMedium: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeXs,
        fontWeight: DesignTokens.fontWeightMedium,
        color: DesignTokens.textInk,
        letterSpacing: DesignTokens.letterSpacingWide,
      ),
      labelSmall: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeXs,
        fontWeight: DesignTokens.fontWeightNormal,
        color: DesignTokens.textSecondary,
        letterSpacing: DesignTokens.letterSpacingWide,
      ),
    );
  }

  static AppBarTheme _buildAppBarTheme() {
    return AppBarTheme(
      backgroundColor: DesignTokens.background,
      foregroundColor: DesignTokens.textInk,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeLg,
        fontWeight: DesignTokens.fontWeightSemibold,
        color: DesignTokens.textInk,
      ),
      iconTheme: const IconThemeData(
        color: DesignTokens.textInk,
        size: 24,
      ),
    );
  }

  static CardTheme _buildCardTheme() {
    return CardTheme(
      color: DesignTokens.surface,
      elevation: DesignTokens.elevationSm,
      shadowColor: Colors.black.withOpacity(0.1),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
      ),
      margin: const EdgeInsets.all(DesignTokens.spacingSm),
    );
  }

  static ElevatedButtonThemeData _buildElevatedButtonTheme() {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: DesignTokens.accentEco,
        foregroundColor: DesignTokens.background,
        elevation: DesignTokens.elevationSm,
        shadowColor: DesignTokens.accentEco.withOpacity(0.3),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: DesignTokens.spacingXl,
          vertical: DesignTokens.spacingMd,
        ),
        minimumSize: const Size(0, DesignTokens.touchTargetMin),
        textStyle: GoogleFonts.inter(
          fontSize: DesignTokens.fontSizeMd,
          fontWeight: DesignTokens.fontWeightMedium,
          letterSpacing: DesignTokens.letterSpacingWide,
        ),
      ),
    );
  }

  static TextButtonThemeData _buildTextButtonTheme() {
    return TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: DesignTokens.accentEco,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: DesignTokens.spacingLg,
          vertical: DesignTokens.spacingMd,
        ),
        minimumSize: const Size(0, DesignTokens.touchTargetMin),
        textStyle: GoogleFonts.inter(
          fontSize: DesignTokens.fontSizeMd,
          fontWeight: DesignTokens.fontWeightMedium,
          letterSpacing: DesignTokens.letterSpacingWide,
        ),
      ),
    );
  }

  static OutlinedButtonThemeData _buildOutlinedButtonTheme() {
    return OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: DesignTokens.textInk,
        side: const BorderSide(color: DesignTokens.borderDivider),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: DesignTokens.spacingXl,
          vertical: DesignTokens.spacingMd,
        ),
        minimumSize: const Size(0, DesignTokens.touchTargetMin),
        textStyle: GoogleFonts.inter(
          fontSize: DesignTokens.fontSizeMd,
          fontWeight: DesignTokens.fontWeightMedium,
          letterSpacing: DesignTokens.letterSpacingWide,
        ),
      ),
    );
  }

  static InputDecorationTheme _buildInputDecorationTheme() {
    return InputDecorationTheme(
      filled: true,
      fillColor: DesignTokens.surface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        borderSide: const BorderSide(color: DesignTokens.borderDivider),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        borderSide: const BorderSide(color: DesignTokens.borderDivider),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        borderSide: const BorderSide(color: DesignTokens.accentEco, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        borderSide: const BorderSide(color: DesignTokens.danger),
      ),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: DesignTokens.spacingLg,
        vertical: DesignTokens.spacingMd,
      ),
      hintStyle: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeMd,
        fontWeight: DesignTokens.fontWeightNormal,
        color: DesignTokens.textTertiary,
      ),
    );
  }

  static BottomSheetThemeData _buildBottomSheetTheme() {
    return BottomSheetThemeData(
      backgroundColor: DesignTokens.background,
      elevation: DesignTokens.elevationLg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(DesignTokens.radiusXl),
        ),
      ),
    );
  }

  static ChipThemeData _buildChipTheme() {
    return ChipThemeData(
      backgroundColor: DesignTokens.surface,
      selectedColor: DesignTokens.accentEco.withOpacity(0.1),
      labelStyle: GoogleFonts.inter(
        fontSize: DesignTokens.fontSizeSm,
        fontWeight: DesignTokens.fontWeightMedium,
        color: DesignTokens.textInk,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(DesignTokens.radiusFull),
      ),
      padding: const EdgeInsets.symmetric(
        horizontal: DesignTokens.spacingMd,
        vertical: DesignTokens.spacingSm,
      ),
    );
  }

  static IconThemeData _buildIconTheme() {
    return const IconThemeData(
      color: DesignTokens.textInk,
      size: 24,
    );
  }

  static DividerThemeData _buildDividerTheme() {
    return const DividerThemeData(
      color: DesignTokens.borderDivider,
      thickness: 1,
      space: 1,
    );
  }
}
