import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../design_system/design_system.dart';
import '../../../../core/core.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

/// Profile screen for user settings and information
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignTokens.background,
      appBar: AppBar(
        backgroundColor: DesignTokens.background,
        elevation: 0,
        title: Text(
          'Profile',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: DesignTokens.textInk,
            fontWeight: DesignTokens.fontWeightBold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Consumer(
        builder: (context, ref, child) {
          final authState = ref.watch(authStateProvider);
          
          return authState.when(
            data: (user) => _buildProfileContent(user),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stack) => _buildErrorState(error),
          );
        },
      ),
    );
  }

  Widget _buildProfileContent(User? user) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(DesignTokens.spacingLg),
      child: Column(
        children: [
          // Profile Header
          _buildProfileHeader(user),
          
          SizedBox(height: DesignTokens.spacingXl),
          
          // Settings Sections
          _buildSettingsSection(),
          
          SizedBox(height: DesignTokens.spacingXl),
          
          // Support Section
          _buildSupportSection(),
          
          SizedBox(height: DesignTokens.spacingXl),
          
          // Sign Out Button
          _buildSignOutButton(),
        ],
      ),
    );
  }

  Widget _buildProfileHeader(User? user) {
    return Container(
      padding: const EdgeInsets.all(DesignTokens.spacingXl),
      decoration: BoxDecoration(
        color: DesignTokens.surface,
        borderRadius: BorderRadius.circular(DesignTokens.radiusXl),
        border: Border.all(color: DesignTokens.borderDivider),
      ),
      child: Column(
        children: [
          // Avatar
          CircleAvatar(
            radius: 40,
            backgroundColor: DesignTokens.accentEco,
            child: Text(
              user?.name?.substring(0, 1).toUpperCase() ?? 'U',
              style: const TextStyle(
                color: DesignTokens.background,
                fontSize: 24,
                fontWeight: DesignTokens.fontWeightBold,
              ),
            ),
          ),
          
          SizedBox(height: DesignTokens.spacingLg),
          
          // Name
          Text(
            user?.name ?? 'User',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: DesignTokens.textInk,
              fontWeight: DesignTokens.fontWeightBold,
            ),
          ),
          
          SizedBox(height: DesignTokens.spacingXs),
          
          // Phone
          Text(
            user?.phone ?? '',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: DesignTokens.textSecondary,
            ),
          ),
          
          if (user?.email != null) ...[
            SizedBox(height: DesignTokens.spacingXs),
            Text(
              user!.email!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: DesignTokens.textSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSettingsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Settings',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: DesignTokens.textInk,
            fontWeight: DesignTokens.fontWeightBold,
          ),
        ),
        SizedBox(height: DesignTokens.spacingLg),
        
        _buildSettingsItem(
          icon: Icons.language_outlined,
          title: 'Language',
          subtitle: 'English',
          onTap: () => _showLanguageDialog(),
        ),
        
        _buildSettingsItem(
          icon: Icons.currency_exchange_outlined,
          title: 'Currency',
          subtitle: 'LBP',
          onTap: () => _showCurrencyDialog(),
        ),
        
        _buildSettingsItem(
          icon: Icons.notifications_outlined,
          title: 'Notifications',
          subtitle: 'Manage your notifications',
          onTap: () => _showNotificationsSettings(),
        ),
        
        _buildSettingsItem(
          icon: Icons.location_on_outlined,
          title: 'Location',
          subtitle: 'Manage location settings',
          onTap: () => _showLocationSettings(),
        ),
      ],
    );
  }

  Widget _buildSupportSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Support',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: DesignTokens.textInk,
            fontWeight: DesignTokens.fontWeightBold,
          ),
        ),
        SizedBox(height: DesignTokens.spacingLg),
        
        _buildSettingsItem(
          icon: Icons.help_outline,
          title: 'Help Center',
          subtitle: 'Get help and support',
          onTap: () => _showHelpCenter(),
        ),
        
        _buildSettingsItem(
          icon: Icons.info_outline,
          title: 'About',
          subtitle: 'App version and info',
          onTap: () => _showAbout(),
        ),
        
        _buildSettingsItem(
          icon: Icons.privacy_tip_outlined,
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          onTap: () => _showPrivacyPolicy(),
        ),
        
        _buildSettingsItem(
          icon: Icons.description_outlined,
          title: 'Terms of Service',
          subtitle: 'Read our terms of service',
          onTap: () => _showTermsOfService(),
        ),
      ],
    );
  }

  Widget _buildSettingsItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: DesignTokens.spacingSm),
      decoration: BoxDecoration(
        color: DesignTokens.surface,
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        border: Border.all(color: DesignTokens.borderDivider),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: DesignTokens.textSecondary,
        ),
        title: Text(
          title,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: DesignTokens.textInk,
            fontWeight: DesignTokens.fontWeightMedium,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: DesignTokens.textSecondary,
          ),
        ),
        trailing: const Icon(
          Icons.chevron_right,
          color: DesignTokens.textTertiary,
        ),
        onTap: onTap,
      ),
    );
  }

  Widget _buildSignOutButton() {
    return PrimaryButton(
      text: 'Sign Out',
      onPressed: _signOut,
      fullWidth: true,
      icon: Icons.logout,
      backgroundColor: DesignTokens.danger,
    );
  }

  Widget _buildErrorState(Object error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 64,
            color: DesignTokens.danger,
          ),
          SizedBox(height: DesignTokens.spacingLg),
          Text(
            'Something went wrong',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: DesignTokens.textSecondary,
            ),
          ),
          SizedBox(height: DesignTokens.spacingSm),
          Text(
            error.toString(),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: DesignTokens.textTertiary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _showLanguageDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Language'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('English'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Change language to English
              },
            ),
            ListTile(
              title: const Text('العربية'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Change language to Arabic
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showCurrencyDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Currency'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('LBP (Lebanese Pound)'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Change currency to LBP
              },
            ),
            ListTile(
              title: const Text('USD (US Dollar)'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Change currency to USD
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showNotificationsSettings() {
    // TODO: Navigate to notifications settings
  }

  void _showLocationSettings() {
    // TODO: Navigate to location settings
  }

  void _showHelpCenter() {
    // TODO: Navigate to help center
  }

  void _showAbout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('About Day-End Boxes'),
        content: const Text('Version 1.0.0\n\nSave food, save money!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showPrivacyPolicy() {
    // TODO: Navigate to privacy policy
  }

  void _showTermsOfService() {
    // TODO: Navigate to terms of service
  }

  Future<void> _signOut() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final authNotifier = ref.read(authStateProvider.notifier);
      await authNotifier.logout();
      if (mounted) {
        context.go('/auth');
      }
    }
  }
}
