# DementiAid Backend 

The DementiAid backend is a Node.js/Express server that serves as the brain of the application. It handles secure data management, AI-driven summarization, and automated notifications.

---

##  Features

- **Authentication**: Secure registration and login using JWT and Bcryptjs.
- **AI Processing**: Integration with Google Gemini Pro for summarizing transcribed conversations.
- **Face Data**: Manages subject profiles, including relationship data and visit frequencies.
- **Memory Store**: Persists conversation histories linked specifically to recognized subjects and the authenticated user.
- **Medication Scheduling**: Full CRUD for medication schedules with a background service (Node-cron) for email reminders.

---

##  Project Structure

- `controller/`: Request handlers for each resource (Auth, AI, People, Conversations, Medicines).
- `models/`: Mongoose schemas for MongoDB.
- `routes/`: API endpoint definitions.
- `middleware/`: Custom logic like the `auth` guard.
- `services/`: Specialized services like the email notification engine.

---

##  Environment Variables

Create a `.env` file in the `backend/` directory with the following keys:

```ini
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key

# Email Configuration (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

##  API Endpoints

### Authentication
- `POST /api/user/register`: Create a new caregiver account.
- `POST /api/user/login`: Authenticate and receive a JWT.

### Subjects (People)
- `GET /api/person`: Fetch all registered subjects for the user.
- `POST /api/person/register`: Register a new face subject.
- `PUT /api/person/:id`: Update subject details.
- `DELETE /api/person/:id`: Remove a subject.

### Memories (Conversations)
- `GET /api/conversation/user`: Retrieve all conversation summaries for the logged-in user.
- `POST /api/conversation/add`: Save a new conversation summary.

### AI
- `POST /api/ai/summarize`: Send a transcript to the Gemini AI for summarization.

### Medications
- `GET /api/medicine`: Fetch all medication schedules for the user.
- `POST /api/medicine`: Create a new medication schedule.
- `PUT /api/medicine/:id`: Update a schedule.
- `DELETE /api/medicine/:id`: Remove a medication entry.

---

##  Getting Started

1. Install dependencies: `npm install`
2. Configure your `.env` file.
3. Run in development mode: `node ./server.js`
4. Production start: `pm2 start server.js`
