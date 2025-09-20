import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'screens.dart';

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'TooGoodToGo Lebanon',
      theme: ThemeData(
        primarySwatch: Colors.green,
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.green,
          brightness: Brightness.light,
        ),
      ),
      routerConfig: _router,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en', 'US'),
        Locale('ar', 'LB'),
      ],
      debugShowCheckedModeBanner: false,
    );
  }
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/auth',
      builder: (context, state) => const AuthScreen(),
    ),
    GoRoute(
      path: '/merchants',
      builder: (context, state) => const MerchantsScreen(),
    ),
    GoRoute(
      path: '/boxes',
      builder: (context, state) => const BoxesScreen(),
    ),
    GoRoute(
      path: '/reservations',
      builder: (context, state) => const ReservationsScreen(),
    ),
    GoRoute(
      path: '/admin',
      builder: (context, state) => const AdminScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfileScreen(),
    ),
  ],
);

// API Service Provider
final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

class ApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://localhost:3000/api/v1',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  // Auth endpoints
  Future<Map<String, dynamic>> sendOtp(String phone, String locale) async {
    final response = await _dio.post('/auth-test/send-otp', data: {
      'phone': phone,
      'locale': locale,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    final response = await _dio.post('/auth-test/verify-otp', data: {
      'phone': phone,
      'otp': otp,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    final response = await _dio.post('/auth/refresh', data: {
      'refreshToken': refreshToken,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> getProfile(String token) async {
    final response = await _dio.get('/auth/profile', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
    return response.data;
  }

  Future<Map<String, dynamic>> updateProfile(String token, Map<String, dynamic> data) async {
    final response = await _dio.patch('/auth/profile', 
      data: data,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return response.data;
  }

  Future<Map<String, dynamic>> logout(String token) async {
    final response = await _dio.post('/auth/logout', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
    return response.data;
  }

  // Merchants endpoints
  Future<Map<String, dynamic>> getMerchants() async {
    final response = await _dio.get('/merchants');
    return response.data;
  }

  Future<Map<String, dynamic>> getMerchantById(String id) async {
    final response = await _dio.get('/merchants/$id');
    return response.data;
  }

  // Boxes endpoints
  Future<Map<String, dynamic>> getNearbyBoxes(double lat, double lng, double radius) async {
    final response = await _dio.get('/boxes/nearby', queryParameters: {
      'lat': lat,
      'lng': lng,
      'radius': radius,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> getBoxById(String id) async {
    final response = await _dio.get('/boxes/$id');
    return response.data;
  }

  // Reservations endpoints
  Future<Map<String, dynamic>> getReservations(String token) async {
    final response = await _dio.get('/reservations', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
    return response.data;
  }

  Future<Map<String, dynamic>> createReservation(String token, Map<String, dynamic> data) async {
    final response = await _dio.post('/reservations', 
      data: data,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return response.data;
  }

  // Admin endpoints
  Future<Map<String, dynamic>> getAdminStats(String token) async {
    final response = await _dio.get('/admin/stats', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
    return response.data;
  }
}

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  List<Map<String, dynamic>> _merchants = [];
  List<Map<String, dynamic>> _boxes = [];
  bool _isLoading = false;
  String _status = 'Ready to connect to backend';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _status = 'Loading data...';
    });

    try {
      final apiService = ref.read(apiServiceProvider);
      
      // Load merchants
      final merchantsResponse = await apiService.getMerchants();
      final merchants = List<Map<String, dynamic>>.from(merchantsResponse['data'] ?? []);
      
      // Load nearby boxes (using Beirut coordinates)
      final boxesResponse = await apiService.getNearbyBoxes(33.8938, 35.5018, 10.0);
      final boxes = List<Map<String, dynamic>>.from(boxesResponse['data'] ?? []);
      
      setState(() {
        _merchants = merchants;
        _boxes = boxes;
        _status = '✅ Loaded ${merchants.length} merchants and ${boxes.length} boxes';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Failed to load data: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _testAuth() async {
    setState(() {
      _isLoading = true;
      _status = 'Testing authentication...';
    });

    try {
      final apiService = ref.read(apiServiceProvider);
      await apiService.sendOtp('+96170123456', 'en');
      
      setState(() {
        _status = '✅ OTP sent successfully! Check backend logs for OTP code';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Auth test failed: $e';
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
        title: const Text('TooGoodToGo Lebanon'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.go('/profile'),
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
                  'Backend Status',
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
                const SizedBox(height: 12),
                Row(
                  children: [
                    ElevatedButton(
                      onPressed: _isLoading ? null : _loadData,
                      child: const Text('Refresh Data'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _testAuth,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Test Auth'),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => context.go('/auth'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.purple,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Go to Auth Screen'),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Tabs for different data
          DefaultTabController(
            length: 2,
            child: Expanded(
              child: Column(
                children: [
                  const TabBar(
                    tabs: [
                      Tab(text: 'Merchants', icon: Icon(Icons.store)),
                      Tab(text: 'Boxes', icon: Icon(Icons.inventory)),
                    ],
                  ),
                  Expanded(
                    child: TabBarView(
                      children: [
                        // Merchants Tab
                        _isLoading
                            ? const Center(child: CircularProgressIndicator())
                            : _merchants.isEmpty
                                ? const Center(
                                    child: Text(
                                      'No merchants found.\nTap "Refresh Data" to load.',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(fontSize: 16),
                                    ),
                                  )
                                : ListView.builder(
                                    padding: const EdgeInsets.symmetric(horizontal: 16),
                                    itemCount: _merchants.length,
                                    itemBuilder: (context, index) {
                                      final merchant = _merchants[index];
                                      return Card(
                                        margin: const EdgeInsets.only(bottom: 12),
                                        child: ListTile(
                                          leading: CircleAvatar(
                                            backgroundColor: Colors.green[100],
                                            child: const Icon(Icons.store, color: Colors.green),
                                          ),
                                          title: Text(
                                            merchant['businessName'] ?? 'Unknown Merchant',
                                            style: const TextStyle(fontWeight: FontWeight.bold),
                                          ),
                                          subtitle: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text('Type: ${merchant['category'] ?? 'N/A'}'),
                                              Text('Phone: ${merchant['phone'] ?? 'N/A'}'),
                                              Text('Address: ${merchant['address'] ?? 'N/A'}'),
                                            ],
                                          ),
                                          trailing: ElevatedButton(
                                            onPressed: () {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(
                                                  content: Text('Selected: ${merchant['businessName'] ?? 'Unknown Merchant'}'),
                                                  backgroundColor: Colors.green,
                                                ),
                                              );
                                            },
                                            child: const Text('Select'),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                        // Boxes Tab
                        _isLoading
                            ? const Center(child: CircularProgressIndicator())
                            : _boxes.isEmpty
                                ? const Center(
                                    child: Text(
                                      'No boxes found.\nTap "Refresh Data" to load.',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(fontSize: 16),
                                    ),
                                  )
                                : ListView.builder(
                                    padding: const EdgeInsets.symmetric(horizontal: 16),
                                    itemCount: _boxes.length,
                                    itemBuilder: (context, index) {
                                      final box = _boxes[index];
                                      return Card(
                                        margin: const EdgeInsets.only(bottom: 12),
                                        child: ListTile(
                                          leading: CircleAvatar(
                                            backgroundColor: Colors.blue[100],
                                            child: const Icon(Icons.inventory, color: Colors.blue),
                                          ),
                                          title: Text(
                                            box['name'] ?? 'Unknown Box',
                                            style: const TextStyle(fontWeight: FontWeight.bold),
                                          ),
                                          subtitle: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text('Type: ${box['type'] ?? 'N/A'}'),
                                              Text('Price: ${box['price'] ?? 'N/A'}'),
                                              Text('Available: ${box['availableQuantity'] ?? 'N/A'}'),
                                            ],
                                          ),
                                          trailing: ElevatedButton(
                                            onPressed: () {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(
                                                  content: Text('Selected: ${box['name'] ?? 'Unknown Box'}'),
                                                  backgroundColor: Colors.blue,
                                                ),
                                              );
                                            },
                                            child: const Text('Reserve'),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: 0,
        onTap: (index) {
          switch (index) {
            case 0:
              context.go('/');
              break;
            case 1:
              context.go('/merchants');
              break;
            case 2:
              context.go('/boxes');
              break;
            case 3:
              context.go('/reservations');
              break;
            case 4:
              context.go('/auth');
              break;
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.store),
            label: 'Merchants',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory),
            label: 'Boxes',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.book),
            label: 'Reservations',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.login),
            label: 'Auth',
          ),
        ],
      ),
    );
  }
}