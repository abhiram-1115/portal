# Lost & Found Portal - Backend

The backend server for the Lost & Found Portal application, built with Node.js and Express.

## Features

- User authentication (Sign up and Login)
- JWT-based authorization
- Item management (Add, view, and claim lost/found items)
- File upload support for item images
- Role-based access control (Admin and User roles)
- Admin panel for managing items and users

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (if using MongoDB)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
NODE_ENV=development
```

3. Create admin user (optional):
```bash
npm run create-admin
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## Project Structure

```
backend/
├── controllers/      # Request handlers
├── middleware/       # Custom middleware (auth, file upload)
├── models/          # Database models
├── routes/          # API routes
├── scripts/         # Utility scripts (admin setup)
├── uploads/         # Uploaded files directory
├── package.json     # Dependencies and scripts
└── server.js        # Main server file
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user

### Items
- `GET /items` - Get all items
- `GET /items/:id` - Get specific item
- `POST /items` - Create new item (authenticated)
- `PUT /items/:id` - Update item (authenticated)
- `DELETE /items/:id` - Delete item (authenticated/admin)
- `POST /items/:id/claim` - Claim an item (authenticated)

### Admin
- `GET /admin/users` - List all users (admin only)
- `GET /admin/items` - List all items (admin only)

## Middleware

- **authMiddleware** - Validates JWT tokens and authenticates requests
- **uploadMiddleware** - Handles file uploads with size and type validation

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## File Uploads

Files are uploaded to the `uploads/` directory. Supported file types:
- JPEG, PNG, GIF, WebP

Maximum file size: 5MB (configurable in uploadMiddleware)

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT
