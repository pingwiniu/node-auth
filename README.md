# node-auth

Welcome to node-auth! This project is designed to provide a foundation for handling user authentication and registration for my own apps using Express.js. It uses JSON Web Tokens (JWT) for secure authentication and provides functionalities for user registration, email verification, login, and protected routes (its a simple project, for educational purposes only, don't use in prod.).

## Features
- User registration with email verification
- User login with JWT-based authentication
- Protected routes for authorized users
- Dynamic route loading for modular route management
- Basic HTML frontend for user interactions

## Setup
1. Clone the repository to your local machine:
   ```sh
   git clone https://github.com/pingwiniu/node-auth.git
   ```

2. Install the required dependencies:
   ```sh
   npm install
   ```

3. Run a local SMTP server.
   

4. Set up SMTP configuration as specified in the code.


## Usage
1. Run the application:
   ```sh
   node server.js
   ```

2. Access the application in your web browser:
   - Landing Page: http://localhost:3000/
   - Login Page: http://localhost:3000/login
   - Registration Page: http://localhost:3000/register
   - Panel Page (protected): http://localhost:3000/panel (requires authentication)

## Routes
- `/`: Landing page.
- `/login`: Login page.
- `/register`: Registration page.
- `/panel`: User panel page (protected; requires authentication).
- `/api/v1/auth/login`: User login route.
- `/api/v1/auth/register`: User registration route.
- `/api/v1/auth/verify/:token`: Email verification route.
- `/api/v1/user/info`: Information about a user.
- You can add more routes by adding folders, the folder tree defines the url path and the file name defines the path ending.

## License
This project is licensed under the GNU General Public License (GPL) Version 3. For more details, see the [LICENSE](LICENSE) file.
