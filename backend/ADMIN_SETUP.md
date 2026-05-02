# Admin Setup Guide

## How to Create an Admin User

### Method 1: Using the Script (Recommended)

Run the create-admin script from the backend directory:

```powershell
cd portal/backend
npm run create-admin
```

This will create an admin user with default credentials:
- **Email:** admin@example.com
- **Password:** admin123
- **Name:** Admin User

### Method 2: Custom Admin Credentials

You can specify custom credentials:

```powershell
cd portal/backend
npm run create-admin <email> <password> <name>
```

Example:
```powershell
npm run create-admin admin@mydomain.com MySecurePassword123 "Admin Name"
```

### Method 3: Manual Database Update

If you already have a user account, you can manually update their role in MongoDB:

1. Connect to your MongoDB database
2. Find the user:
   ```javascript
   db.users.findOne({ email: "user@example.com" })
   ```
3. Update the role:
   ```javascript
   db.users.updateOne(
     { email: "user@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## Admin Features

Once logged in as an admin, you will have access to:

1. **Admin Panel** - Accessible via the "Admin Panel" button in the navbar
2. **Approve Items** - Approve pending items to make them visible to users
3. **Delete Items** - Remove any items from the system
4. **View All Items** - See all items regardless of status (pending, approved, claimed)

## Admin Login

1. Go to the login page
2. Enter your admin email and password
3. You'll see "(Admin)" next to your name in the navbar
4. Click "Admin Panel" to access admin features

## Security Notes

- Admin users can approve/delete any items
- Only users with `role: 'admin'` can access admin endpoints
- Admin status is checked on both frontend and backend
- Make sure to use strong passwords for admin accounts

