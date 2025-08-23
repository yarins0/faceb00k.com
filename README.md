# faceb00k Login Demo - Complete Setup Guide

This project demonstrates a login form that connects to a Node.js backend with MySQL database. Perfect for learning full-stack development!

## What You'll Need to Install

### 1. Node.js
- Go to [https://nodejs.org](https://nodejs.org)
- Download the "LTS" version (recommended for most users)
- Run the installer and follow the setup wizard
- **Restart your computer** after installation

### 2. MySQL
- Go to [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
- Download "MySQL Installer for Windows"
- Run the installer and choose "Developer Default" setup
- Set a root password when prompted (remember this!)
- Complete the installation

### 3. Code Editor (Optional but Recommended)
- Download [Visual Studio Code](https://code.visualstudio.com/) for free
- Or use any text editor you prefer

## Step-by-Step Setup

### Step 1: Verify Installations
Open Command Prompt or PowerShell and run:
```bash
node --version
npm --version
mysql --version
```
You should see version numbers for each. If any command fails, restart your computer and try again.

### Step 2: Start MySQL
1. Press `Win + R`, type `services.msc`, press Enter
2. Find "MySQL80" or "MySQL" in the list
3. Right-click and select "Start" if it's not running
4. Note: MySQL should start automatically on boot

### Step 3: Configure the Project
1. Navigate to your project folder:
```bash
cd "c:\Users\Owner\Documents\faceb00k.com"
```

2. Copy the environment file:
```bash
copy example.env .env
```

3. Edit the `.env` file with your MySQL password:
```bash
notepad .env
```
Change `your_mysql_password` to the password you set during MySQL installation.

### Step 4: Install Dependencies
In the project folder, run:
```bash
npm install
```
This will download all required packages (Express, MySQL driver, bcrypt, etc.)

### Step 5: Start the Server
```bash
npm start
```
You should see: "Server listening on http://localhost:3001"

### Step 6: Test the Application
1. Open `index.html` in your web browser (double-click the file)
2. Click "Create new account" to register a test user
3. Then try logging in with the same credentials
4. You should see success alerts!

## How It Works

- **Frontend**: `index.html` - A simple login form styled like faceb00k
- **Backend**: `server.js` - Node.js server with Express
- **Database**: MySQL with auto-created `fb_demo` database and `users` table
- **Security**: Passwords are stored as plain text, SQL queries are parameterized

## API Endpoints

- **Register**: `POST /api/auth/register` - Creates new user account
- **Login**: `POST /api/auth/login` - Authenticates existing user

## Troubleshooting

### "npm is not recognized"
- Restart your computer after installing Node.js
- Make sure Node.js was installed successfully

### "MySQL connection failed"
- Check if MySQL service is running (services.msc)
- Verify your password in the `.env` file
- Make sure MySQL is installed correctly

### "Port 3001 already in use"
- Change the port in `.env` file: `PORT=3002`
- Or close other applications using port 3001

### "Cannot find module"
- Make sure you're in the project folder
- Run `npm install` again

## Next Steps

Once everything is working:
1. Try creating multiple user accounts
2. Check the MySQL database to see stored users

## Viewing Database Tables

### Option 1: MySQL Command Line
To see what's in your database tables, use the MySQL command line:

```bash
# View all users in the table
mysql -u root -p -e "USE fb_demo; SELECT * FROM users;"

# View users with specific information (without password hashes)
mysql -u root -p -e "USE fb_demo; SELECT id, email, created_at FROM users;"

# Count total users
mysql -u root -p -e "USE fb_demo; SELECT COUNT(*) FROM users;"

# Find a specific user
mysql -u root -p -e "USE fb_demo; SELECT * FROM users WHERE email = 'example@email.com';"
```

**Note:** You'll be prompted for your MySQL root password when running these commands.

### Option 2: MySQL Workbench (GUI)
If you prefer a visual interface:
1. Open MySQL Workbench
2. Connect to your local MySQL instance
3. Navigate to the `fb_demo` database
4. Right-click on the `users` table and select "Select Rows - Limit 1000"

### Option 3: Built-in API Endpoint
The project includes a built-in endpoint to view users through your web app. No additional code needed!

**Endpoint**: `GET /api/auth/users`
**Access it at**: `http://localhost:3001/api/auth/users`
**Returns**: JSON with all users including id, email, action_type, and created_at fields
**action_type values**:
- `signup`: User clicked "Create new account" button
- `login`: User clicked "Log in" button
**Note**: This endpoint returns all user data including password hashes. For production use, consider filtering sensitive fields.

## Resetting/Deleting the Database

### Option 1: Drop the entire table (removes all data)
```bash
mysql -u root -p -e "USE fb_demo; DROP TABLE users;"
```
**What happens**: 
- Completely removes the `users` table and all user data
- When you restart the server, it will automatically recreate the table with the new schema
- Use this when you want a completely fresh start

### Option 2: Drop and recreate the entire database
```bash
mysql -u root -p -e "DROP DATABASE fb_demo;"
```
**What happens**:
- Removes the entire `fb_demo` database
- All tables and data are permanently deleted
- Server will recreate everything from scratch on next startup

### Option 3: Delete all data but keep table structure
```bash
mysql -u root -p -e "USE fb_demo; DELETE FROM users;"
```
**What happens**:
- Keeps the table structure but removes all user records
- Useful when you want to keep the schema but start with no users

### Option 4: Reset specific user data
```bash
# Delete a specific user by email
mysql -u root -p -e "USE fb_demo; DELETE FROM users WHERE email = 'user@example.com';"

# Delete users with specific action types
mysql -u root -p -e "USE fb_demo; DELETE FROM users WHERE action_type = 'login';"
```

## After Resetting
When you restart your server (`npm start`), it will automatically:
1. Create the `fb_demo` database if it doesn't exist
2. Create the `users` table with the current schema (including `action_type` column)
3. Be ready to accept new users

## Need Help?

- Check that all programs are installed correctly
- Ensure MySQL service is running
- Verify your `.env` file has the correct MySQL password
- Make sure you're running commands from the project folder


