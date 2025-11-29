# Lost and Found Portal

## Prerequisites
- Node.js (v14 or higher)
- MongoDB database (local or cloud like MongoDB Atlas)
- npm or yarn

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd portal/backend

# Install dependencies
npm install

# Create .env file in backend directory with the following variables:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret_key
# PORT=5000

# Create uploads directory for storing images
mkdir uploads

# Run backend server (development mode with auto-reload)
npm run dev

# OR run in production mode
npm start
```

**Backend will run on:** `http://localhost:5000`

### 2. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd portal/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

**Frontend will run on:** `http://localhost:5173` (or the port Vite assigns)

### 3. Environment Variables

Create a `.env` file in `portal/backend/` directory:

```env
MONGO_URI=mongodb://localhost:27017/lostandfound
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lostandfound

JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

### 4. Quick Start (All Commands)

**Terminal 1 - Backend:**
```bash
cd portal/backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd portal/frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Items
- `GET /api/items` - Get all approved items
- `POST /api/items/add` - Add new item (requires authentication)
- `PUT /api/items/claim/:id` - Claim an item (requires authentication)
- `PUT /api/items/approve/:id` - Approve item (admin only)
- `DELETE /api/items/delete/:id` - Delete item (requires authentication)

## Features
- User authentication (Signup/Login)
- Browse Lost Items
- Browse Found Items
- Toggle between Lost and Found items
- Image upload for items
- Responsive design

## Troubleshooting

1. **Backend not connecting to MongoDB:**
   - Check your `MONGO_URI` in `.env` file
   - Ensure MongoDB is running (if local)

2. **CORS errors:**
   - Backend has CORS enabled, but if issues persist, check the frontend API URL

3. **Images not loading:**
   - Ensure `uploads` directory exists in backend
   - Check that backend is serving static files from `/uploads`

4. **Port already in use:**
   - Change `PORT` in backend `.env` file
   - Update frontend API URL accordingly

