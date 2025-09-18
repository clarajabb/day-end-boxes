import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pinput/pinput.dart';

import '../../../../design_system/design_system.dart';
import '../../../../core/core.dart';
import '../providers/auth_provider.dart';

/// OTP verification screen with PIN input
class OtpVerificationScreen extends ConsumerStatefulWidget {
  const OtpVerificationScreen({
    super.key,
    required this.phone,
  });

  final String phone;

  @override
  ConsumerState<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends ConsumerState<OtpVerificationScreen> {
  final _otpController = TextEditingController();
  final _focusNode = FocusNode();
  
  bool _isLoading = false;
  bool _isResending = false;
  int _resendCountdown = 0;
  
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  @override
  void dispose() {
    _otpController.dispose();
    _focusNode.dispose();
    _timer.cancel();
    super.dispose();
  }

  void _startResendTimer() {
    _resendCountdown = 60; // 60 seconds
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          if (_resendCountdown > 0) {
            _resendCountdown--;
          } else {
            timer.cancel();
          }
        });
      }
    });
  }

  Future<void> _verifyOtp() async {
    if (_otpController.text.length != 6) {
      _showErrorSnackBar('Please enter the complete 6-digit code');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Log analytics
      final analytics = ref.read(analyticsServiceProvider);
      await analytics.logOtpVerified(widget.phone);
      
      // Verify OTP
      await ref.read(authStateProvider.notifier).verifyOtp(
        widget.phone,
        _otpController.text,
      );
      
      if (mounted) {
        context.go('/auth/profile-setup');
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

  Future<void> _resendOtp() async {
    if (_resendCountdown > 0) return;

    setState(() {
      _isResending = true;
    });

    try {
      // Get current locale
      final locale = await PreferencesService.instance.getLocale();
      
      // Resend OTP
      await ref.read(authStateProvider.notifier).sendOtp(
        widget.phone,
        locale,
      );
      
      if (mounted) {
        _startResendTimer();
        _showSuccessSnackBar('Verification code sent successfully');
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar(_getErrorMessage(e));
      }
    } finally {
      if (mounted) {
        setState(() {
          _isResending = false;
        });
      }
    }
  }

  String _getErrorMessage(dynamic error) {
    if (error.toString().contains('network')) {
      return 'Network error. Please check your connection.';
    } else if (error.toString().contains('invalid') || error.toString().contains('otp')) {
      return 'Invalid verification code. Please try again.';
    } else if (error.toString().contains('expired')) {
      return 'Verification code has expired. Please request a new one.';
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

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: DesignTokens.accentEco,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        ),
      ),
    );
  }

  String _maskPhoneNumber(String phone) {
    if (phone.length < 4) return phone;
    final visible = phone.substring(phone.length - 4);
    final masked = '*' * (phone.length - 4);
    return '$masked$visible';
  }

  @override
  Widget build(BuildContext context) {
    final defaultPinTheme = PinTheme(
      width: 56,
      height: 56,
      textStyle: Theme.of(context).textTheme.headlineSmall?.copyWith(
        color: DesignTokens.textInk,
        fontWeight: DesignTokens.fontWeightBold,
      ),
      decoration: BoxDecoration(
        color: DesignTokens.surface,
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        border: Border.all(color: DesignTokens.borderDivider),
      ),
    );

    final focusedPinTheme = defaultPinTheme.copyDecorationWith(
      border: Border.all(color: DesignTokens.accentEco, width: 2),
      color: DesignTokens.background,
    );

    final submittedPinTheme = defaultPinTheme.copyDecorationWith(
      border: Border.all(color: DesignTokens.accentEco),
      color: DesignTokens.accentEco.withOpacity(0.1),
    );

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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Text(
                'Verify Your Number',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: DesignTokens.textInk,
                  fontWeight: DesignTokens.fontWeightBold,
                ),
              ),
              SizedBox(height: DesignTokens.spacingSm),
              Text(
                'Enter the 6-digit code sent to ${_maskPhoneNumber(widget.phone)}',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: DesignTokens.textSecondary,
                ),
              ),
              
              SizedBox(height: DesignTokens.spacing4xl),
              
              // OTP Input
              Pinput(
                controller: _otpController,
                focusNode: _focusNode,
                length: 6,
                defaultPinTheme: defaultPinTheme,
                focusedPinTheme: focusedPinTheme,
                submittedPinTheme: submittedPinTheme,
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.done,
                onCompleted: (pin) => _verifyOtp(),
                onChanged: (value) {
                  if (value.length == 6) {
                    _verifyOtp();
                  }
                },
                validator: (value) {
                  if (value == null || value.length != 6) {
                    return 'Please enter the complete code';
                  }
                  return null;
                },
              ),
              
              SizedBox(height: DesignTokens.spacingXl),
              
              // Resend Code Button
              if (_resendCountdown > 0)
                Text(
                  'Resend in ${_resendCountdown}s',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: DesignTokens.textTertiary,
                  ),
                  textAlign: TextAlign.center,
                )
              else
                TextButton(
                  onPressed: _isResending ? null : _resendOtp,
                  child: _isResending
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(
                          'Resend Code',
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: DesignTokens.accentEco,
                            fontWeight: DesignTokens.fontWeightMedium,
                          ),
                        ),
                ),
              
              SizedBox(height: DesignTokens.spacingLg),
              
              // Change Number Button
              TextButton(
                onPressed: () => context.pop(),
                child: Text(
                  'Change Number',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: DesignTokens.textSecondary,
                  ),
                ),
              ),
              
              const Spacer(),
              
              // Verify Button
              PrimaryButton(
                text: 'Verify',
                onPressed: _isLoading ? null : _verifyOtp,
                isLoading: _isLoading,
                fullWidth: true,
                icon: Icons.check,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
