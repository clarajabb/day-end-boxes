# Day-End Boxes 📦

> A TooGoodToGo-style marketplace for end-of-day food boxes in Lebanon

[![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)

## 🎯 Project Overview

Day-End Boxes is a comprehensive marketplace platform that connects Lebanese consumers with local restaurants, bakeries, and supermarkets offering discounted end-of-day food boxes. The platform reduces food waste while providing affordable, quality meals to users.

### Key Features
- 📱 **Cross-platform mobile app** (iOS/Android) with Arabic/English support
- 🌐 **Merchant web dashboard** for inventory management
- 🔒 **Secure OTP-based authentication** with Lebanese phone numbers
- 📍 **Location-based discovery** with geospatial search
- ⏰ **Time-limited reservations** with Redis-based locking
- 💰 **Dynamic pricing** with up to 70% discounts
- 🏪 **Multi-category support** (restaurants, bakeries, supermarkets)

## 🏗️ Architecture

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flutter App   │    │  Merchant Web   │    │  Admin Panel    │
│   (Consumer)    │    │   Dashboard     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   NestJS API    │
                    │    Gateway      │
                    └─────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │      Redis      │ │   S3/GCS       │
│   (Primary DB)  │ │ (Cache/Locks)   │ │  (Images)      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Technology Stack

#### Backend
- **NestJS** - Node.js framework with TypeScript
- **PostgreSQL** - Primary database with Prisma ORM
- **Redis** - Caching, distributed locks, and TTL management
- **JWT** - Authentication with refresh tokens
- **S3/GCS** - Cloud storage for images

#### Frontend
- **Flutter** - Cross-platform mobile development
- **Riverpod** - State management
- **GoRouter** - Navigation
- **Next.js** - Merchant dashboard
- **Tailwind CSS** - Styling

#### DevOps & Monitoring
- **GitHub Actions** - CI/CD pipelines
- **Sentry** - Error tracking
- **PostHog** - Analytics
- **Firebase** - Push notifications and crashlytics

## 📁 Project Structure

```
day-end-boxes/
├── 📄 README.md                    # This file
├── 📄 SPRINT_PLAN.md               # 2-week development plan
├── 📄 api-contract.yaml            # OpenAPI specification
│
├── 📂 backend/                     # NestJS API
│   ├── 📂 src/
│   │   ├── 📂 auth/                # Authentication module
│   │   ├── 📂 users/               # User management
│   │   ├── 📂 merchants/           # Merchant operations
│   │   ├── 📂 boxes/               # Box management
│   │   ├── 📂 reservations/        # Reservation system
│   │   └── 📂 services/
│   │       └── 📄 reservation-algorithm.md  # Detailed algorithm docs
│   └── 📂 prisma/
│       └── 📄 schema.prisma        # Database schema
│
├── 📂 flutter_app/                 # Mobile application
│   ├── 📄 pubspec.yaml             # Dependencies
│   ├── 📂 lib/
│   │   ├── 📄 main.dart            # App entry point
│   │   ├── 📂 core/
│   │   │   ├── 📂 config/          # App configuration
│   │   │   ├── 📂 theme/           # Design system
│   │   │   └── 📂 services/        # Core services
│   │   └── 📂 features/
│   │       ├── 📂 auth/            # Authentication
│   │       ├── 📂 home/            # Home & discovery
│   │       ├── 📂 boxes/           # Box management
│   │       └── 📂 reservations/    # Reservation system
│   ├── 📂 assets/
│   │   └── 📂 translations/
│   │       ├── 📄 en.json          # English translations
│   │       └── 📄 ar.json          # Arabic translations
│   └── 📂 test/                    # Unit & widget tests
│
└── 📂 merchant-dashboard/          # Next.js web app
    ├── 📄 package.json             # Dependencies
    ├── 📂 src/
    │   ├── 📂 pages/               # Next.js pages
    │   ├── 📂 components/          # React components
    │   └── 📂 hooks/               # Custom hooks
    └── 📂 public/                  # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Flutter 3.10+
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

### Backend Setup

```bash
# Clone repository
git clone https://github.com/your-org/day-end-boxes.git
cd day-end-boxes/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and Redis credentials

# Run database migrations
npx prisma migrate dev

# Seed initial data
npx prisma db seed

# Start development server
npm run start:dev
```

### Mobile App Setup

```bash
cd flutter_app

# Install dependencies
flutter pub get

# Generate code (models, providers)
flutter packages pub run build_runner build

# Run on iOS simulator
flutter run -d ios

# Run on Android emulator
flutter run -d android
```

### Merchant Dashboard Setup

```bash
cd merchant-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

## 📊 Database Schema

### Core Entities

#### Users (Consumers)
```sql
users {
  id: UUID (PK)
  phone: String (Unique)
  name: String?
  email: String?
  preferred_locale: String (ar|en)
  notification_preferences: JSON
  created_at: DateTime
  updated_at: DateTime
}
```

#### Merchants (Businesses)
```sql
merchants {
  id: UUID (PK)
  business_name: String
  contact_name: String
  email: String (Unique)
  phone: String
  category: Enum (BAKERY|RESTAURANT|SUPERMARKET|CAFE|GROCERY)
  address: String
  latitude: Float
  longitude: Float
  status: Enum (PENDING|APPROVED|REJECTED|SUSPENDED)
  created_at: DateTime
  updated_at: DateTime
}
```

#### Box Types (Templates)
```sql
box_types {
  id: UUID (PK)
  merchant_id: UUID (FK)
  name: String
  description: String
  original_price: Float
  discounted_price: Float
  category: Enum
  allergens: String[]
  dietary_info: Enum[]
  images: String[]
  is_active: Boolean
}
```

#### Box Inventory (Daily Availability)
```sql
box_inventory {
  id: UUID (PK)
  box_type_id: UUID (FK)
  available_date: Date
  original_quantity: Integer
  remaining_quantity: Integer
  price: Float
  pickup_start_time: Time
  pickup_end_time: Time
  status: Enum (ACTIVE|SOLD_OUT|EXPIRED)
}
```

#### Reservations
```sql
reservations {
  id: UUID (PK)
  user_id: UUID (FK)
  box_inventory_id: UUID (FK)
  status: Enum (ACTIVE|COMPLETED|CANCELLED|EXPIRED)
  pickup_code: String (Unique)
  total_amount: Float
  reserved_at: DateTime
  expires_at: DateTime
  completed_at: DateTime?
  cancelled_at: DateTime?
}
```

### Relationships
- User → Reservations (1:N)
- Merchant → BoxTypes (1:N)
- BoxType → BoxInventory (1:N)
- BoxInventory → Reservations (1:N)
- Reservation → Reviews (1:1)

## 🔐 Authentication Flow

### Consumer Authentication
1. **Phone Input**: Lebanese number validation (+961)
2. **OTP Verification**: 6-digit code with 5-minute expiry
3. **Profile Setup**: Name, email (optional), preferences
4. **JWT Tokens**: Access token (15min) + Refresh token (30 days)

### Merchant Authentication
1. **Email/Password**: Traditional login for web dashboard
2. **Session Management**: Server-side sessions with NextAuth.js
3. **Role-based Access**: Different permissions for staff/admin

## 📱 Mobile App Features

### Core Screens

#### 🔐 Authentication
- **Splash Screen**: App initialization with branding
- **Onboarding**: Value proposition and how-it-works
- **Phone Verification**: OTP-based registration
- **Profile Setup**: User preferences and notifications

#### 🏠 Home & Discovery
- **Home Screen**: Map/list toggle for nearby boxes
- **Search & Filters**: Category, price, distance, dietary
- **Box Cards**: Merchant info, pricing, availability
- **Box Details**: Full information, reviews, reservation

#### 📋 Reservations
- **Active Reservations**: Timer, pickup code, directions
- **Reservation History**: Past orders with status
- **Pickup Code**: QR code and numeric display
- **Cancellation**: Easy cancellation for active reservations

#### 👤 Profile
- **Personal Info**: Name, email, phone management
- **Preferences**: Language, notifications, dietary
- **Support**: Help, terms, privacy policy

### State Management (Riverpod)

```dart
// Authentication Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

// Box Discovery Provider
final nearbyBoxesProvider = FutureProvider.autoDispose<List<BoxInventoryWithMerchant>>((ref) {
  final location = ref.watch(locationProvider).value;
  final filters = ref.watch(filtersProvider);
  return ref.read(boxRepositoryProvider).getNearbyBoxes(location, filters);
});

// Reservation Provider
final reservationsProvider = StateNotifierProvider<ReservationNotifier, ReservationState>((ref) {
  return ReservationNotifier(ref.read(reservationRepositoryProvider));
});
```

## 🌐 Merchant Dashboard

### Key Features
- **Box Type Management**: Create and edit box templates
- **Daily Inventory**: Publish available quantities (< 2 minutes)
- **Reservation Management**: View and process orders
- **Analytics**: Sales performance and insights
- **Profile Management**: Business information and settings

### Dashboard Screens

#### 📊 Dashboard Overview
- Daily stats (reservations, revenue, availability)
- Quick actions (publish inventory, view reservations)
- Recent activity feed
- Performance metrics

#### 📦 Box Management
- Box type CRUD operations
- Image upload and management
- Pricing and discount configuration
- Category and dietary information

#### 📋 Inventory Publishing
- Date selection for availability
- Quantity and pricing per box type
- Pickup window configuration
- Bulk operations for efficiency

#### 🎯 Reservation Management
- Real-time reservation list
- Status updates (active, completed, cancelled)
- Pickup code validation
- Customer communication

## ⚡ Reservation Algorithm

### Core Business Rules
1. **Single Active Reservation**: One per user per merchant
2. **TTL Management**: 15-30 minute expiration windows
3. **Atomic Operations**: Redis distributed locks
4. **Inventory Consistency**: Real-time quantity updates

### Redis Lock Strategy

```typescript
// Reservation Creation Flow
async function createReservation(userId: string, boxInventoryId: string) {
  const locks = [
    `lock:inventory:${boxInventoryId}`,
    `lock:user_merchant:${userId}:${merchantId}`
  ];
  
  const lockAcquired = await acquireMultipleLocks(locks, 30); // 30s TTL
  
  if (!lockAcquired) {
    throw new Error('LOCK_ACQUISITION_FAILED');
  }
  
  try {
    // Validate business rules
    await validateReservationRules(userId, boxInventoryId);
    
    // Update inventory atomically
    await updateInventoryWithLock(boxInventoryId, -1);
    
    // Create reservation with TTL
    const reservation = await createReservationRecord(/* ... */);
    
    // Set up Redis TTL tracking
    await redis.setex(`reservation:ttl:${reservation.id}`, ttlSeconds, reservationData);
    
    return reservation;
  } finally {
    await releaseMultipleLocks(locks);
  }
}
```

### Failure Recovery
- **Lock Timeout**: Automatic release after 30 seconds
- **Partial Failures**: Compensation transactions
- **TTL Cleanup**: Background job processes expired reservations
- **Retry Logic**: Exponential backoff for transient failures

## 🌍 Internationalization

### Supported Languages
- **Arabic (ar)**: Primary language with RTL support
- **English (en)**: Secondary language

### Localization Features
- **RTL Layout**: Proper right-to-left text flow
- **Cultural Adaptation**: Lebanese context and terminology
- **Number Formatting**: Local currency and phone formats
- **Date/Time**: Arabic calendar support

### Translation Keys Structure
```json
{
  "onboarding": {
    "welcome": {
      "title": "مرحباً بك في صناديق نهاية اليوم",
      "subtitle": "بوابتك للحصول على طعام لذيذ بأسعار معقولة"
    }
  },
  "auth": {
    "phone_verification": {
      "title": "أدخل رقم هاتفك",
      "country_code": "961+"
    }
  }
}
```

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Service layer business logic
- **Integration Tests**: API endpoints and database
- **Load Tests**: Reservation system under concurrency
- **Security Tests**: Authentication and authorization

### Mobile Testing
- **Unit Tests**: Provider logic and utilities
- **Widget Tests**: UI components and interactions
- **Integration Tests**: Complete user flows
- **Golden Tests**: Visual regression testing

### Test Coverage Goals
- Backend: >80% line coverage
- Mobile: >70% line coverage
- Critical paths: 100% coverage

### Example Test
```dart
testWidgets('should display reservation information correctly', (tester) async {
  // Arrange
  final mockReservation = createMockReservation();
  
  // Act
  await tester.pumpWidget(createWidgetUnderTest(reservation: mockReservation));
  await tester.pumpAndSettle();
  
  // Assert
  expect(find.text('Test Restaurant'), findsOneWidget);
  expect(find.text('Surprise Box'), findsOneWidget);
  expect(find.text('\$10.00'), findsOneWidget);
});
```

## 🚀 Deployment

### Environment Setup
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live environment with monitoring

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy to staging
        run: npm run deploy:staging
```

### Mobile App Distribution
- **iOS**: TestFlight for beta, App Store for production
- **Android**: Internal testing, Play Console for production
- **Code Push**: Over-the-air updates for React Native components

## 📈 Monitoring & Analytics

### Error Tracking (Sentry)
- Real-time error reporting
- Performance monitoring
- User session replay
- Custom error boundaries

### Analytics (PostHog)
- User behavior tracking
- Conversion funnel analysis
- A/B testing framework
- Custom event tracking

### Business Metrics
- **User Metrics**: DAU, MAU, retention rates
- **Business Metrics**: GMV, conversion rates, merchant satisfaction
- **Technical Metrics**: API response times, error rates, uptime

## 🔒 Security Considerations

### Data Protection
- **GDPR Compliance**: User data rights and privacy
- **Encryption**: At-rest and in-transit encryption
- **PII Handling**: Minimal data collection and secure storage

### API Security
- **Rate Limiting**: Prevent abuse and DDoS
- **Input Validation**: Sanitize all user inputs
- **SQL Injection**: Parameterized queries with Prisma
- **XSS Protection**: Content security policies

### Mobile Security
- **Certificate Pinning**: Prevent man-in-the-middle attacks
- **Secure Storage**: Encrypted local storage for tokens
- **Biometric Auth**: Optional fingerprint/face unlock
- **Jailbreak Detection**: Additional security on compromised devices

## 🎯 Business Model

### Revenue Streams
1. **Commission**: Percentage of each completed reservation
2. **Subscription**: Premium merchant features
3. **Advertising**: Promoted listings and sponsored content
4. **Data Insights**: Aggregated analytics for merchants

### Key Metrics
- **Take Rate**: 15-20% commission on successful orders
- **Merchant Acquisition**: Cost and lifetime value
- **User Retention**: Monthly cohort analysis
- **Market Penetration**: Geographic coverage in Lebanon

## 🗺️ Roadmap

### Phase 1: MVP Launch (Weeks 1-2)
- [x] Core reservation system
- [x] Mobile app (iOS/Android)
- [x] Merchant dashboard
- [x] Basic payment (cash on pickup)

### Phase 2: Growth Features (Weeks 3-6)
- [ ] Payment gateway integration
- [ ] Advanced merchant analytics
- [ ] User reviews and ratings
- [ ] Push notification campaigns

### Phase 3: Scale & Optimize (Weeks 7-12)
- [ ] Delivery option
- [ ] Corporate accounts
- [ ] Loyalty program
- [ ] Advanced ML recommendations

### Phase 4: Regional Expansion (Months 4-6)
- [ ] Multi-country support
- [ ] Franchise model
- [ ] Partner integrations
- [ ] Advanced reporting suite

## 👥 Team Structure

### Development Team (5 members)
- **Backend Developer (2)**: API, database, infrastructure
- **Mobile Developer (2)**: Flutter app, native integrations
- **DevOps Engineer (1)**: Infrastructure, monitoring, deployment

### Recommended Additions
- **Product Manager**: Feature prioritization and roadmap
- **UI/UX Designer**: User experience and visual design
- **QA Engineer**: Testing automation and quality assurance
- **Marketing**: User acquisition and merchant onboarding

## 📞 Support & Contribution

### Getting Help
- **Documentation**: Check this README and inline code docs
- **Issues**: Create GitHub issues for bugs and features
- **Discussions**: Use GitHub discussions for questions
- **Email**: support@dayendboxes.lb

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- **Backend**: ESLint + Prettier
- **Mobile**: Dart formatter + Flutter lints
- **Commits**: Conventional commits format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TooGoodToGo**: Inspiration for the business model
- **Flutter Team**: Amazing cross-platform framework
- **NestJS Community**: Robust backend framework
- **Lebanese Tech Community**: Local market insights

---

## 📊 Project Status

- ✅ **API Design**: Complete OpenAPI specification
- ✅ **Database Schema**: Full Prisma schema with relationships
- ✅ **Mobile App Foundation**: Flutter app with core screens
- ✅ **Reservation Algorithm**: Redis-based locking system
- ✅ **Merchant Dashboard**: Next.js web application
- ✅ **Localization**: Arabic/English translations
- ✅ **Testing Suite**: Unit and widget tests
- ✅ **Sprint Plan**: 2-week development roadmap

**Ready for development team to begin implementation! 🚀**

---

*Built with ❤️ for the Lebanese community to reduce food waste and support local businesses.*
