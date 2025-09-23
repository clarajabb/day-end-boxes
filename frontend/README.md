# Day-End Boxes Frontend

A modern React/Next.js frontend for the Day-End Boxes TooGoodToGo-style marketplace application.

## Features

- 🔐 **OTP Authentication** - Lebanese phone number-based login with SMS verification
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- 🗺️ **Location Services** - Find nearby food boxes using geolocation
- 🛒 **Reservation Management** - View and manage food box reservations
- 👤 **User Profile** - Manage personal information and preferences
- 🌍 **Multi-language Support** - Arabic and English localization
- 🎨 **Modern UI** - Clean, accessible interface with Radix UI components

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=Day-End Boxes
NEXT_PUBLIC_APP_DESCRIPTION=TooGoodToGo-style marketplace for end-of-day food boxes in Lebanon
NODE_ENV=development
PORT=3001
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main dashboard page
│   ├── login/             # Authentication page
│   ├── profile/           # User profile page
│   ├── reservations/      # Reservations management
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects)
├── components/            # Reusable UI components
│   ├── AuthenticatedLayout.tsx
│   └── Navigation.tsx
├── contexts/              # React Context providers
│   └── AuthContext.tsx
├── lib/                   # Utility functions and configurations
│   ├── api.ts            # API service layer
│   ├── config.ts         # App configuration
│   └── utils.ts          # Utility functions
└── middleware.ts          # Next.js middleware for auth
```

## Key Features

### Authentication Flow

1. **Phone Number Input**: Lebanese phone number validation
2. **OTP Verification**: 6-digit SMS code verification
3. **JWT Token Management**: Automatic token refresh and storage
4. **Protected Routes**: Middleware-based route protection

### Dashboard

- **Welcome Section**: Personalized greeting
- **Statistics Cards**: User reservation stats
- **Search & Filters**: Find boxes by location, cuisine, area
- **Box Cards**: Detailed box information with pricing
- **Location Services**: Automatic nearby box detection

### User Profile

- **Personal Information**: Name, email, phone management
- **Language Preferences**: Arabic/English selection
- **Notification Settings**: Push, SMS, email preferences
- **Quick Stats**: Reservation summary

### Reservations

- **Status Filtering**: Active, completed, cancelled reservations
- **QR Code Management**: Download and share reservation QR codes
- **Detailed Information**: Pickup times, merchant details
- **Action Buttons**: Cancel, view details, share

## API Integration

The frontend integrates with the backend API through:

- **ApiService**: Centralized API client with Axios
- **Authentication**: JWT token management
- **Error Handling**: Comprehensive error responses
- **Type Safety**: TypeScript interfaces for all API responses

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Theme**: Extended color palette and spacing
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Prepared for future dark mode implementation

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Quality

- **ESLint**: Code linting with Next.js config
- **TypeScript**: Full type safety
- **Prettier**: Code formatting (configured)
- **Husky**: Git hooks for quality checks

## Testing

The application includes:

- **Component Testing**: React component unit tests
- **Integration Testing**: API integration tests
- **E2E Testing**: End-to-end user flow tests

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Required environment variables for production:

```env
NEXT_PUBLIC_API_URL=https://api.dayendboxes.lb/api/v1
NEXT_PUBLIC_APP_NAME=Day-End Boxes
NEXT_PUBLIC_APP_DESCRIPTION=TooGoodToGo-style marketplace for end-of-day food boxes in Lebanon
NODE_ENV=production
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.