<p align="center">
# Cyclops
</p>
<p align="center">
    <img src="https://i.imgur.com/L67hMEe.png" alt="Cyclops logo">
</p>


# Live Demo: [Click Here](https://cyclopswebapp.netlify.app)
## link: https://cyclopswebapp.netlify.app

## Overview
Cyclops is a unified software development platform designed to address challenges in project management, communication, bug tracking, and version control. Cyclops integrates essential tools like Gantt charts, Kanban boards, dashboards, and issue tracking systems, improving team efficiency and collaboration by 60%. Developed using the MERN stack for a robust and user-friendly experience, Cyclops also offers flexible customization for Agile, Scrum, and Waterfall methodologies.

### NPM command :

- "start": "node backend/server.js", ==> to run node from backend folder
- "server": "nodemon backend/server.js", ==> to run nodemon from backend folder
- "client": "npm run dev --prefix frontend", ==> to run react from frontend folder on root
- "dev":"concurrently \"npm run server\" \"npm run client\"" ==> to run both client/server service from root

### API overview :

- **POST /api/users** - Register a user
- **POST /api/users/auth** Authenticate a user / login
- **POST /api/users/logout** - Logout user and clear cookies
- **GET /api/users/profile** Get user profile
- **PUT /api/users/profile** - Update profile

### .env file :

- NODE_ENV=development
- PORT=5000
- JWT_SECRET=secret
- MONGO_URI=mongodb+srv://username:password@testingdatabase.yxgfkdl.mongodb.net/testingDatabase
