import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'main.dart';

// Merchants Screen
class MerchantsScreen extends ConsumerStatefulWidget {
  const MerchantsScreen({super.key});

  @override
  ConsumerState<MerchantsScreen> createState() => _MerchantsScreenState();
}

class _MerchantsScreenState extends ConsumerState<MerchantsScreen> {
  List<Map<String, dynamic>> _merchants = [];
  bool _isLoading = false;
  String _status = 'Ready to load merchants';

  @override
  void initState() {
    super.initState();
    _loadMerchants();
  }

  Future<void> _loadMerchants() async {
    setState(() {
      _isLoading = true;
      _status = 'Loading merchants...';
    });

    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.getMerchants();
      final merchants = List<Map<String, dynamic>>.from(response['data'] ?? []);
      setState(() {
        _merchants = merchants;
        _status = '✅ Loaded ${_merchants.length} merchants';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Failed to load merchants: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Merchants'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(_status, style: TextStyle(color: _status.startsWith('✅') ? Colors.green : Colors.red)),
          ),
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : Expanded(
            child: _merchants.isEmpty
                ? const Center(child: Text('No merchants found.'))
                : ListView.builder(
              itemCount: _merchants.length,
              itemBuilder: (context, index) {
                final merchant = _merchants[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    title: Text(merchant['businessName'] ?? 'N/A'),
                    subtitle: Text(merchant['address'] ?? 'N/A'),
                    trailing: const Icon(Icons.arrow_forward),
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Merchant: ${merchant['businessName']}')),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// Boxes Screen
class BoxesScreen extends ConsumerStatefulWidget {
  const BoxesScreen({super.key});

  @override
  ConsumerState<BoxesScreen> createState() => _BoxesScreenState();
}

class _BoxesScreenState extends ConsumerState<BoxesScreen> {
  List<Map<String, dynamic>> _boxes = [];
  bool _isLoading = false;
  String _status = 'Ready to load boxes';

  @override
  void initState() {
    super.initState();
    _loadBoxes();
  }

  Future<void> _loadBoxes() async {
    setState(() {
      _isLoading = true;
      _status = 'Loading boxes...';
    });

    try {
      final apiService = ref.read(apiServiceProvider);
      // Using Beirut coordinates for nearby boxes
      final response = await apiService.getNearbyBoxes(33.8938, 35.5018, 10.0);
      final boxes = List<Map<String, dynamic>>.from(response['data'] ?? []);
      setState(() {
        _boxes = boxes;
        _status = '✅ Loaded ${_boxes.length} boxes';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Failed to load boxes: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Boxes'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(_status, style: TextStyle(color: _status.startsWith('✅') ? Colors.blue : Colors.red)),
          ),
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : Expanded(
            child: _boxes.isEmpty
                ? const Center(child: Text('No boxes found.'))
                : ListView.builder(
              itemCount: _boxes.length,
              itemBuilder: (context, index) {
                final box = _boxes[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    title: Text(box['name'] ?? 'N/A'),
                    subtitle: Text('Price: ${box['price'] ?? 'N/A'}, Quantity: ${box['availableQuantity'] ?? 'N/A'}'),
                    trailing: const Icon(Icons.arrow_forward),
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Box: ${box['name']}')),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// Reservations Screen
class ReservationsScreen extends ConsumerStatefulWidget {
  const ReservationsScreen({super.key});

  @override
  ConsumerState<ReservationsScreen> createState() => _ReservationsScreenState();
}

class _ReservationsScreenState extends ConsumerState<ReservationsScreen> {
  List<Map<String, dynamic>> _reservations = [];
  bool _isLoading = false;
  String _status = 'Please log in to view reservations';
  String? _token; // Placeholder for JWT token

  @override
  void initState() {
    super.initState();
    // In a real app, you'd load the token from secure storage
    _token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token
    if (_token != null && _token!.isNotEmpty) {
      _loadReservations();
    }
  }

  Future<void> _loadReservations() async {
    setState(() {
      _isLoading = true;
      _status = 'Loading reservations...';
    });

    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.getUserReservations(_token!);
      final reservations = List<Map<String, dynamic>>.from(response['data'] ?? []);
      setState(() {
        _reservations = reservations;
        _status = '✅ Loaded ${_reservations.length} reservations';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Failed to load reservations: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reservations'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            onPressed: () => context.go('/'),
            icon: const Icon(Icons.home),
            tooltip: 'Back to Home',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadReservations,
            tooltip: 'Refresh Reservations',
          ),
        ],
      ),
      body: Column(
        children: [
          // Status Card
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Reservations Status',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _status,
                  style: TextStyle(
                    color: _status.startsWith('✅') ? Colors.green : Colors.red,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Note: You need to authenticate first to view reservations',
                  style: TextStyle(
                    color: Colors.orange[700],
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () => context.go('/auth'),
                  icon: const Icon(Icons.login),
                  label: const Text('Go to Authentication'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.purple,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          
          // Reservations List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _reservations.isEmpty
                    ? const Center(
                        child: Text(
                          'No reservations found.\nPlease authenticate first.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 16),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _reservations.length,
                        itemBuilder: (context, index) {
                          final reservation = _reservations[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Colors.purple[100],
                                child: const Icon(Icons.book, color: Colors.purple),
                              ),
                              title: Text(
                                reservation['box']?['name'] ?? 'Unknown Reservation',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Status: ${reservation['status'] ?? 'N/A'}'),
                                  Text('Quantity: ${reservation['quantity'] ?? 'N/A'}'),
                                  Text('Total: ${reservation['totalAmount'] ?? 'N/A'}'),
                                  Text('Created: ${reservation['createdAt'] ?? 'N/A'}'),
                                ],
                              ),
                              trailing: ElevatedButton(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('Selected: ${reservation['id'] ?? 'Unknown Reservation'}'),
                                      backgroundColor: Colors.green,
                                    ),
                                  );
                                },
                                child: const Text('View'),
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

// Auth Screen
class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  final _phoneController = TextEditingController(text: '+96170123456');
  final _otpController = TextEditingController();
  final _localeController = TextEditingController(text: 'en');
  final _refreshTokenController = TextEditingController();
  
  bool _isLoading = false;
  String _status = 'Ready to test authentication';
  String? _accessToken;
  String? _refreshTokenValue;

  Future<void> _sendOtp() async {
    setState(() {
      _isLoading = true;
      _status = 'Sending OTP...';
    });

    try {
      // Use test endpoint directly to ensure it works
      final dio = Dio(BaseOptions(
        baseUrl: 'http://localhost:3000/api/v1',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
      ));
      final response = await dio.post('/auth-test/send-otp', data: {
        'phone': _phoneController.text,
        'locale': _localeController.text,
      });
      
      setState(() {
        _status = '✅ OTP sent successfully! Check backend logs for OTP code';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Failed to send OTP: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _verifyOtp() async {
    setState(() {
      _isLoading = true;
      _status = 'Verifying OTP...';
    });

    try {
      // Use test endpoint directly to ensure it works
      final dio = Dio(BaseOptions(
        baseUrl: 'http://localhost:3000/api/v1',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
      ));
      final response = await dio.post('/auth-test/verify-otp', data: {
        'phone': _phoneController.text,
        'otp': _otpController.text,
      });
      
      setState(() {
        _accessToken = response.data['data']['accessToken'];
        _refreshTokenValue = response.data['data']['refreshToken'];
        _status = '✅ OTP verified successfully! Tokens received';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Failed to verify OTP: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _refreshToken() async {
    setState(() {
      _isLoading = true;
      _status = 'Refreshing token...';
    });
    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.refreshToken(_refreshTokenController.text);
      
      setState(() {
        _accessToken = response['accessToken'];
        _refreshTokenValue = response['refreshToken'];
        _status = '✅ Token refreshed successfully!';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Failed to refresh token: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _getProfile() async {
    if (_accessToken == null) {
      setState(() => _status = '❌ Not logged in.');
      return;
    }
    setState(() {
      _isLoading = true;
      _status = 'Getting profile...';
    });
    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.getProfile(_accessToken!);
      setState(() {
        _status = '✅ Profile: ${response['name'] ?? 'N/A'} (${response['phone'] ?? 'N/A'})';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Failed to get profile: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _logout() async {
    if (_accessToken == null) {
      setState(() => _status = '❌ Not logged in.');
      return;
    }
    setState(() {
      _isLoading = true;
      _status = 'Logging out...';
    });
    try {
      final apiService = ref.read(apiServiceProvider);
      await apiService.logout(_accessToken!);
      
      setState(() {
        _accessToken = null;
        _refreshTokenValue = null;
        _status = '✅ Logged out successfully!';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Failed to logout: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Authentication'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        actions: [
          // Add a "Back to Home" button in the app bar
          IconButton(
            onPressed: () => context.go('/'),
            icon: const Icon(Icons.home),
            tooltip: 'Back to Home',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Authentication Status',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _status,
                    style: TextStyle(
                      color: _status.startsWith('✅') ? Colors.green : Colors.red,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  if (_accessToken != null) ...[
                    const SizedBox(height: 8),
                    Text('Access Token: ${_accessToken!.substring(0, 20)}...'),
                  ],
                  if (_refreshTokenValue != null) ...[
                    Text('Refresh Token: ${_refreshTokenValue!.substring(0, 20)}...'),
                  ],
                ],
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Navigation Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Quick Navigation',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => context.go('/'),
                            icon: const Icon(Icons.home),
                            label: const Text('Home'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => context.go('/boxes'),
                            icon: const Icon(Icons.fastfood),
                            label: const Text('Boxes'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => context.go('/reservations'),
                            icon: const Icon(Icons.receipt),
                            label: const Text('Reservations'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.orange,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => context.go('/profile'),
                            icon: const Icon(Icons.person),
                            label: const Text('Profile'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.teal,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Send OTP Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Send OTP',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _phoneController,
                      decoration: const InputDecoration(
                        labelText: 'Phone Number',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _localeController,
                      decoration: const InputDecoration(
                        labelText: 'Locale (en/ar)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _sendOtp,
                      child: const Text('Send OTP'),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Verify OTP Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Verify OTP',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _otpController,
                      decoration: const InputDecoration(
                        labelText: 'OTP Code',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _verifyOtp,
                      child: const Text('Verify OTP'),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Token Operations Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Token Operations',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _refreshTokenController,
                      decoration: const InputDecoration(
                        labelText: 'Refresh Token',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _refreshToken,
                            child: const Text('Refresh Token'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _getProfile,
                            child: const Text('Get Profile'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _logout,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('Logout'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            if (_isLoading) ...[
              const SizedBox(height: 20),
              const Center(child: CircularProgressIndicator()),
            ],
            
            // Success message with navigation options
            if (_accessToken != null) ...[
              const SizedBox(height: 20),
              Card(
                color: Colors.green.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.check_circle, color: Colors.green),
                          const SizedBox(width: 8),
                          Text(
                            'Authentication Successful!',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.green,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Text('You can now access all features:'),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => context.go('/'),
                              icon: const Icon(Icons.home),
                              label: const Text('Go to Home'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green,
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => context.go('/reservations'),
                              icon: const Icon(Icons.receipt),
                              label: const Text('Check Reservations'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.orange,
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// Profile Screen
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: const Center(
        child: Text('User Profile Details Here (Requires Auth)'),
      ),
    );
  }
}

// Admin Screen
class AdminScreen extends ConsumerStatefulWidget {
  const AdminScreen({super.key});

  @override
  ConsumerState<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends ConsumerState<AdminScreen> {
  String _status = 'Admin access requires authentication';
  bool _isLoading = false;
  String? _adminStats;
  String? _token; // Placeholder for JWT token

  @override
  void initState() {
    super.initState();
    // In a real app, you'd load the token from secure storage
    _token = 'YOUR_ADMIN_JWT_TOKEN_HERE'; // Replace with actual admin token
    if (_token != null && _token!.isNotEmpty) {
      _loadAdminStats();
    }
  }

  Future<void> _loadAdminStats() async {
    setState(() {
      _isLoading = true;
      _status = 'Loading admin stats...';
    });

    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.getAdminStats(_token!);
      setState(() {
        _adminStats = response.toString();
        _status = '✅ Admin Stats Loaded';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Failed to load admin stats: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        backgroundColor: Colors.red,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_status, style: TextStyle(color: _status.startsWith('✅') ? Colors.green : Colors.red)),
            const SizedBox(height: 16),
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _adminStats != null
                ? Text(_adminStats!)
                : const Text('No admin stats available. Ensure you have an admin token.'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isLoading ? null : _loadAdminStats,
              child: const Text('Refresh Admin Stats'),
            ),
          ],
        ),
      ),
    );
  }
}
