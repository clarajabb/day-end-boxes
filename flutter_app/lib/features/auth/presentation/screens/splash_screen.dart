import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../design_system/design_system.dart';
import '../../../../core/core.dart';
import '../providers/auth_provider.dart';

/// Splash screen with app initialization and authentication check
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _logoController;
  late AnimationController _textController;
  late Animation<double> _logoAnimation;
  late Animation<double> _textAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _initializeApp();
  }

  void _setupAnimations() {
    _logoController = AnimationController(
      duration: DesignTokens.animationNormal,
      vsync: this,
    );
    
    _textController = AnimationController(
      duration: DesignTokens.animationNormal,
      vsync: this,
    );

    _logoAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _logoController,
      curve: Curves.easeOutBack,
    ));

    _textAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _textController,
      curve: Curves.easeOut,
    ));

    _logoController.forward();
    Future.delayed(const Duration(milliseconds: 300), () {
      _textController.forward();
    });
  }

  Future<void> _initializeApp() async {
    try {
      // Initialize core services
      await _initializeServices();
      
      // Wait for animations to complete
      await Future.delayed(const Duration(milliseconds: 1500));
      
      // Check authentication status
      final authState = ref.read(authStateProvider);
      
      if (mounted) {
        authState.when(
          data: (user) {
            if (user != null) {
              context.go('/home');
            } else {
              context.go('/auth');
            }
          },
          loading: () {
            // Keep showing splash while loading
          },
          error: (error, stack) {
            // On error, go to auth screen
            context.go('/auth');
          },
        );
      }
    } catch (e) {
      if (mounted) {
        context.go('/auth');
      }
    }
  }

  Future<void> _initializeServices() async {
    // Initialize preferences
    await PreferencesService.instance.init();
    
    // Initialize analytics
    final analytics = ref.read(analyticsServiceProvider);
    await analytics.logScreenView('splash_screen');
    
    // Initialize location service
    final locationService = ref.read(locationServiceProvider);
    await locationService.init();
  }

  @override
  void dispose() {
    _logoController.dispose();
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignTokens.background,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo Animation
              AnimatedBuilder(
                animation: _logoAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _logoAnimation.value,
                    child: Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: DesignTokens.accentEco,
                        borderRadius: BorderRadius.circular(DesignTokens.radiusXl),
                        boxShadow: DesignShadows.lg,
                      ),
                      child: const Icon(
                        Icons.restaurant,
                        size: 60,
                        color: DesignTokens.background,
                      ),
                    ),
                  );
                },
              ),
              
              SizedBox(height: DesignTokens.spacingXl),
              
              // App Name Animation
              AnimatedBuilder(
                animation: _textAnimation,
                builder: (context, child) {
                  return Opacity(
                    opacity: _textAnimation.value,
                    child: Column(
                      children: [
                        Text(
                          'Day-End Boxes',
                          style: Theme.of(context).textTheme.displayMedium?.copyWith(
                            color: DesignTokens.textInk,
                            fontWeight: DesignTokens.fontWeightBold,
                          ),
                        ),
                        SizedBox(height: DesignTokens.spacingSm),
                        Text(
                          'Save Food, Save Money',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: DesignTokens.textSecondary,
                            fontWeight: DesignTokens.fontWeightMedium,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
              
              SizedBox(height: DesignTokens.spacing4xl),
              
              // Loading Indicator
              AnimatedBuilder(
                animation: _textAnimation,
                builder: (context, child) {
                  return Opacity(
                    opacity: _textAnimation.value,
                    child: const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          DesignTokens.accentEco,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}