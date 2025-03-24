# AuthFlow

A full-stack authentication system with email and phone verification.

## Features

- User registration with email verification
- Phone number verification via SMS
- JWT-based authentication
- Protected routes
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Gmail account (for email verification)
- Twilio account (for SMS verification)

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd authflow
```

2. Install dependencies:

```bash
npm run install:all
```

3. Configure environment variables:

   Backend (.env):

   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=your-twilio-number
   FRONTEND_URL=http://localhost:3000
   ```

   Frontend (.env):

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development servers:

```bash
npm start
```

This will start both the backend (port 5000) and frontend (port 3000) servers concurrently.

## Development

- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:3000

## API Endpoints

- POST /api/auth/signup - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/verify-email - Verify email address
- POST /api/auth/send-phone-verification - Send SMS verification code
- POST /api/auth/verify-phone - Verify phone number

## Testing

To test the complete flow:

1. Register a new user
2. Check your email for verification link
3. Click the link to verify email
4. Login with your credentials
5. Add and verify your phone number
6. Access the protected dashboard

## License

MIT
