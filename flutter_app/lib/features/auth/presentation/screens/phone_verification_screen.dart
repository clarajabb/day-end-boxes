import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:country_picker/country_picker.dart';

import '../../../../design_system/design_system.dart';
import '../../../../core/core.dart';
import '../providers/auth_provider.dart';

/// Phone verification screen for Lebanese phone numbers
class PhoneVerificationScreen extends ConsumerStatefulWidget {
  const PhoneVerificationScreen({super.key});

  @override
  ConsumerState<PhoneVerificationScreen> createState() => _PhoneVerificationScreenState();
}

class _PhoneVerificationScreenState extends ConsumerState<PhoneVerificationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _focusNode = FocusNode();
  
  String _selectedCountryCode = '+961';
  String _selectedLocale = 'en';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadUserPreferences();
  }

  Future<void> _loadUserPreferences() async {
    final locale = await PreferencesService.instance.getLocale();
    setState(() {
      _selectedLocale = locale;
    });
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final fullPhone = '$_selectedCountryCode${_phoneController.text}';
      
      // Log analytics
      final analytics = ref.read(analyticsServiceProvider);
      await analytics.logOtpSent(fullPhone);
      
      // Send OTP
      await ref.read(authStateProvider.notifier).sendOtp(
        fullPhone,
        _selectedLocale,
      );
      
      if (mounted) {
        context.go('/auth/otp', extra: fullPhone);
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar(_getErrorMessage(e));
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _getErrorMessage(dynamic error) {
    if (error.toString().contains('network')) {
      return 'Network error. Please check your connection.';
    } else if (error.toString().contains('phone')) {
      return 'Please enter a valid Lebanese phone number.';
    } else {
      return 'Something went wrong. Please try again.';
    }
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: DesignTokens.danger,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        ),
      ),
    );
  }

  void _showCountryPicker() {
    showCountryPicker(
      context: context,
      showPhoneCode: true,
      onSelect: (country) {
        setState(() {
          _selectedCountryCode = '+${country.phoneCode}';
        });
      },
      countryListTheme: CountryListThemeData(
        flagSize: 25,
        backgroundColor: DesignTokens.background,
        textStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
          color: DesignTokens.textInk,
        ),
        bottomSheetHeight: 500,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(DesignTokens.radiusXl),
        ),
        inputDecoration: InputDecoration(
          labelText: 'Search',
          hintText: 'Start typing to search',
          prefixIcon: const Icon(Icons.search),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignTokens.background,
      appBar: AppBar(
        backgroundColor: DesignTokens.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(DesignTokens.spacingXl),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                Text(
                  'Enter Your Phone Number',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: DesignTokens.textInk,
                    fontWeight: DesignTokens.fontWeightBold,
                  ),
                ),
                SizedBox(height: DesignTokens.spacingSm),
                Text(
                  'We\'ll send you a verification code to confirm your number',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: DesignTokens.textSecondary,
                  ),
                ),
                
                SizedBox(height: DesignTokens.spacing4xl),
                
                // Phone Input
                Text(
                  'Phone Number',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: DesignTokens.textInk,
                    fontWeight: DesignTokens.fontWeightMedium,
                  ),
                ),
                SizedBox(height: DesignTokens.spacingSm),
                
                Row(
                  children: [
                    // Country Code Button
                    GestureDetector(
                      onTap: _showCountryPicker,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: DesignTokens.spacingLg,
                          vertical: DesignTokens.spacingMd,
                        ),
                        decoration: BoxDecoration(
                          color: DesignTokens.surface,
                          borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
                          border: Border.all(color: DesignTokens.borderDivider),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              _selectedCountryCode,
                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                color: DesignTokens.textInk,
                                fontWeight: DesignTokens.fontWeightMedium,
                              ),
                            ),
                            SizedBox(width: DesignTokens.spacingXs),
                            const Icon(
                              Icons.keyboard_arrow_down,
                              color: DesignTokens.textSecondary,
                              size: 20,
                            ),
                          ],
                        ),
                      ),
                    ),
                    
                    SizedBox(width: DesignTokens.spacingMd),
                    
                    // Phone Number Input
                    Expanded(
                      child: TextFormField(
                        controller: _phoneController,
                        focusNode: _focusNode,
                        keyboardType: TextInputType.phone,
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) => _sendOtp(),
                        decoration: InputDecoration(
                          hintText: '71 123 456',
                          prefixText: ' ',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your phone number';
                          }
                          if (value.length < 8) {
                            return 'Please enter a valid phone number';
                          }
                          return null;
                        },
                      ),
                    ),
                  ],
                ),
                
                SizedBox(height: DesignTokens.spacingXl),
                
                // Language Selection
                Text(
                  'Preferred Language',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: DesignTokens.textInk,
                    fontWeight: DesignTokens.fontWeightMedium,
                  ),
                ),
                SizedBox(height: DesignTokens.spacingSm),
                
                Row(
                  children: [
                    Expanded(
                      child: _buildLanguageOption('en', 'English'),
                    ),
                    SizedBox(width: DesignTokens.spacingMd),
                    Expanded(
                      child: _buildLanguageOption('ar', 'العربية'),
                    ),
                  ],
                ),
                
                const Spacer(),
                
                // Terms Agreement
                Text(
                  'By continuing, you agree to our Terms of Service and Privacy Policy',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: DesignTokens.textTertiary,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                SizedBox(height: DesignTokens.spacingXl),
                
                // Send Code Button
                PrimaryButton(
                  text: 'Send Code',
                  onPressed: _isLoading ? null : _sendOtp,
                  isLoading: _isLoading,
                  fullWidth: true,
                  icon: Icons.send,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLanguageOption(String locale, String label) {
    final isSelected = _selectedLocale == locale;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedLocale = locale;
        });
        PreferencesService.instance.setLocale(locale);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: DesignTokens.spacingLg,
          vertical: DesignTokens.spacingMd,
        ),
        decoration: BoxDecoration(
          color: isSelected ? DesignTokens.accentEco : DesignTokens.surface,
          borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
          border: Border.all(
            color: isSelected ? DesignTokens.accentEco : DesignTokens.borderDivider,
          ),
        ),
        child: Text(
          label,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: isSelected ? DesignTokens.background : DesignTokens.textInk,
            fontWeight: DesignTokens.fontWeightMedium,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}

