# Zilk - Local Deals & Rewards Platform

Zilk is a modern platform connecting local businesses with customers through deals and interactive rewards. The platform supports both web and mobile access, featuring location-based deal discovery and an innovative spin wheel mechanism for special rewards.

## Features

- **Public Access**
  - Browse local deals within 50 miles
  - View constant deals without login
  - Spin wheel for exclusive rewards (NFC activation required)
  - Location-based deal discovery

- **Business Features**
  - Comprehensive dashboard
  - Deal management system
  - Analytics and tracking
  - Staff management
  - NFC tag integration

## Tech Stack

- Frontend: Next.js + Expo
- Backend: Supabase
- Authentication: Supabase Auth
- Database: PostgreSQL (via Supabase)
- Mobile: React Native (Expo)
- Hosting: Vercel (Web), EAS (Mobile)

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for web deployment)
- Expo account (for mobile deployment)
- Git

## Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd zilk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database:
   - Copy the contents of `supabase/schema.sql`
   - Execute in your Supabase SQL editor

## Development

### Web Development
```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Mobile Development
```bash
# Start Expo development server
npm run mobile

# Start for iOS
npm run ios

# Start for Android
npm run android
```

## Deployment

### Web Deployment (Vercel)
1. Connect your repository to Vercel
2. Add environment variables
3. Deploy

### Mobile Deployment (EAS)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Configure EAS:
   ```bash
   eas init
   ```

3. Build and submit:
   ```bash
   # Build for testing
   eas build --platform ios
   eas build --platform android

   # Submit to stores
   eas submit -p ios
   eas submit -p android
   ```

## Project Structure

```
zilk/
├── src/
│   ├── app/                 # Next.js pages
│   ├── components/          # Shared components
│   └── lib/                 # Utilities and configurations
├── supabase/
│   └── schema.sql          # Database schema
├── public/                  # Static assets
└── app.config.ts           # Expo configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@zilk.com or join our Slack channel.
