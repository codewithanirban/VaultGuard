# VaultGuard — Secure Password Manager

![VaultGuard](https://img.shields.io/badge/Status-Active-success) ![License](https://img.shields.io/badge/License-MIT-blue)

VaultGuard is a robust, full-stack password manager application built with modern web technologies. It provides a secure, intuitive, and responsive interface for users to store, manage, and monitor their sensitive credentials with confidence.

## Key Features

- **Secure Authentication**: Traditional Email/Password login paired with seamless Google OAuth integration.
- **End-to-End Encryption**: All stored passwords are symmetrically encrypted using AES-256-CBC before reaching the database, ensuring robust data security.
- **Password Generator**: Built-in utility to generate strong, complex passwords on the fly.
- **Health Monitoring**: Analyze the strength and vulnerability of your stored passwords.
- **Secure Data Export**: Safely export your vault data when needed.
- **Modern UI/UX**: A responsive, aesthetically pleasing interface built with React, Vite, and modern CSS practices.

## Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Vanilla CSS with modern design tokens
- **Deployment**: Vercel

### Backend
- **Framework**: Node.js & Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens) & Google OAuth 2.0
- **Security**:
  - `bcrypt` for password hashing
  - Built-in Node.js `crypto` module for AES-256 encryption
  - Joi validation middleware
  - Granular rate limiting
- **Deployment**: Render

## Project Structure

```text
VaultGuard/
├── Backend/       # Node.js + Express API server, MongoDB models, Auth controllers
├── Frontend/      # Vite + React SPA, Components, Views, API services
├── DEPLOY.md      # Detailed deployment instructions for Render, Vercel, and Atlas
└── README.md      # Project documentation
```

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas cluster)
- Google Cloud Console Project (for OAuth credentials)

### 1. Repository Setup
```bash
cd "Password Manager"
```

### 2. Backend Setup
```bash
cd Backend
npm install
```
Create a `.env` file in the `Backend` directory with the necessary variables (see `DEPLOY.md` for reference on required keys like `MONGO_URI`, `JWT_SECRET`, `ENCRYPTION_KEY`, etc.):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your_64_char_hex_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```
Start the development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd Frontend
npm install
```
Create a `.env` file in the `Frontend` directory:
```env
VITE_API_URL=http://localhost:5000
```
Start the Vite development server:
```bash
npm run dev
```

## Deployment

For comprehensive, step-by-step instructions on deploying the application to production (Vercel, Render, and MongoDB Atlas), please refer to the [DEPLOY.md](./DEPLOY.md) file included in this repository.

## License

This project is open-source and available under the [MIT License](./LICENSE).
