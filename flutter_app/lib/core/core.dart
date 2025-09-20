/// Core package for Day-End Boxes app
/// 
/// Provides core services, utilities, and infrastructure
library core;

export 'storage/secure_storage.dart';
export 'storage/preferences.dart';
export 'routing/app_router.dart';
export 'env/environment.dart';
export 'localization/app_localizations.dart';
export 'api/api_client.dart';
export 'models/models.dart';

// Providers
export '../features/auth/presentation/providers/auth_provider.dart';
export '../features/boxes/presentation/providers/boxes_provider.dart';
export '../features/merchants/presentation/providers/merchants_provider.dart';
export '../features/reservations/presentation/providers/reservations_provider.dart';
