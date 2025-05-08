# SmatiCo - Service Orders Auction App

A mobile app that allows users to sign up, select a role (customer or service provider), place orders, and track/manage deliveries or services.

## Features

### User Authentication
- Registration and login system
- Role selection (customer or service provider)

### Customer Features
- Create and manage service orders
- View and select service providers
- Track order status
- Rate and review service providers

### Service Provider Features
- View available orders
- Place bids on orders
- Track assigned orders
- Manage profile and ratings

### Core Functionality
- Order creation and management
- Bidding system for service providers
- Real-time order status updates
- User profiles and ratings
- Search and filtering of orders

## Technologies Used

- **React Native** - Mobile app framework
- **Expo** - React Native toolchain
- **Expo Router** - Navigation and routing
- **AsyncStorage** - Local data persistence
- **Context API** - State management
- **Expo Vector Icons** - Icon library

## Installation and Setup

1. **Prerequisites**
   - Node.js (v14 or higher)
   - npm or yarn
   - Expo CLI (`npm install -g expo-cli`)

2. **Clone the repository**
   ```
   git clone <repository-url>
   cd SmaticoApp
   ```

3. **Install dependencies**
   ```
   npm install
   ```

4. **Start the development server**
   ```
   npm start
   ```

5. **Run on a device or emulator**
   - Use the Expo Go app on your physical device by scanning the QR code
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator (Mac only)

## App Structure

The app follows the Expo Router file-based routing structure:

- `app/` - Main application code
  - `(auth)/` - Authentication screens (login, signup)
  - `(app)/` - Main app screens (after logging in)
  - `(onboarding)/` - Onboarding screens
  - `context/` - App context and data management
  - `components/` - Reusable UI components
  - `constants/` - App constants and theme

## Data Persistence

The app uses AsyncStorage for local data persistence. In a production environment, this would be replaced with a proper backend server and database.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or feedback, please reach out to [contact email].
