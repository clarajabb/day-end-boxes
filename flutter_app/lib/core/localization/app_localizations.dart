import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart';

/// App localization configuration
class AppLocalizations {
  AppLocalizations._();

  /// Supported locales
  static const List<Locale> supportedLocales = [
    Locale('en', 'US'),
    Locale('ar', 'LB'),
  ];

  /// Localizations delegates
  static const List<LocalizationsDelegate> delegates = [
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ];

  /// Locale resolution callback
  static Locale? localeResolutionCallback(
    List<Locale>? locales,
    Iterable<Locale> supportedLocales,
  ) {
    if (locales == null || locales.isEmpty) {
      return supportedLocales.first;
    }

    // Check for exact match
    for (final locale in locales) {
      if (supportedLocales.contains(locale)) {
        return locale;
      }
    }

    // Check for language match
    for (final locale in locales) {
      final languageCode = locale.languageCode;
      for (final supportedLocale in supportedLocales) {
        if (supportedLocale.languageCode == languageCode) {
          return supportedLocale;
        }
      }
    }

    return supportedLocales.first;
  }

  /// Format currency for Lebanon
  static String formatCurrency(
    double amount, {
    String currency = 'LBP',
    String locale = 'en_US',
  }) {
    final formatter = NumberFormat.currency(
      locale: locale,
      symbol: currency,
      decimalDigits: currency == 'LBP' ? 0 : 2,
    );
    return formatter.format(amount);
  }

  /// Format date for Lebanon
  static String formatDate(
    DateTime date, {
    String locale = 'en_US',
    String pattern = 'MMM dd, yyyy',
  }) {
    final formatter = DateFormat(pattern, locale);
    return formatter.format(date);
  }

  /// Format time for Lebanon
  static String formatTime(
    DateTime time, {
    String locale = 'en_US',
    bool use24Hour = true,
  }) {
    final pattern = use24Hour ? 'HH:mm' : 'h:mm a';
    final formatter = DateFormat(pattern, locale);
    return formatter.format(time);
  }

  /// Format date and time for Lebanon
  static String formatDateTime(
    DateTime dateTime, {
    String locale = 'en_US',
    String datePattern = 'MMM dd, yyyy',
    bool use24Hour = true,
  }) {
    final timePattern = use24Hour ? 'HH:mm' : 'h:mm a';
    final formatter = DateFormat('$datePattern $timePattern', locale);
    return formatter.format(dateTime);
  }

  /// Format distance for Lebanon
  static String formatDistance(
    double distanceInKm, {
    String locale = 'en_US',
  }) {
    if (distanceInKm < 1) {
      final meters = (distanceInKm * 1000).round();
      return locale == 'ar' ? '$meters م' : '${meters}m';
    } else {
      final km = distanceInKm.toStringAsFixed(1);
      return locale == 'ar' ? '$km كم' : '${km}km';
    }
  }

  /// Format percentage
  static String formatPercentage(
    double percentage, {
    String locale = 'en_US',
  }) {
    final formatter = NumberFormat.percentPattern(locale);
    return formatter.format(percentage / 100);
  }

  /// Format number with thousands separator
  static String formatNumber(
    double number, {
    String locale = 'en_US',
    int decimalDigits = 0,
  }) {
    final formatter = NumberFormat('#,###', locale);
    if (decimalDigits > 0) {
      formatter.minimumFractionDigits = decimalDigits;
      formatter.maximumFractionDigits = decimalDigits;
    }
    return formatter.format(number);
  }

  /// Get RTL direction for locale
  static TextDirection getTextDirection(String locale) {
    return locale.startsWith('ar') ? TextDirection.rtl : TextDirection.ltr;
  }

  /// Check if locale is RTL
  static bool isRTL(String locale) {
    return locale.startsWith('ar');
  }

  /// Get locale from language code
  static Locale getLocaleFromLanguageCode(String languageCode) {
    switch (languageCode) {
      case 'ar':
        return const Locale('ar', 'LB');
      case 'en':
      default:
        return const Locale('en', 'US');
    }
  }

  /// Get language code from locale
  static String getLanguageCodeFromLocale(Locale locale) {
    return locale.languageCode;
  }

  /// Get country code from locale
  static String getCountryCodeFromLocale(Locale locale) {
    return locale.countryCode ?? 'US';
  }

  /// Get display name for locale
  static String getDisplayName(Locale locale) {
    switch (locale.languageCode) {
      case 'ar':
        return 'العربية';
      case 'en':
      default:
        return 'English';
    }
  }

  /// Get currency symbol for locale
  static String getCurrencySymbol(String currency) {
    switch (currency) {
      case 'LBP':
        return 'ل.ل';
      case 'USD':
        return '\$';
      default:
        return currency;
    }
  }

  /// Get currency name for locale
  static String getCurrencyName(String currency, String locale) {
    switch (currency) {
      case 'LBP':
        return locale == 'ar' ? 'ليرة لبنانية' : 'Lebanese Pound';
      case 'USD':
        return locale == 'ar' ? 'دولار أمريكي' : 'US Dollar';
      default:
        return currency;
    }
  }
}
