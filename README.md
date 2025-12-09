# Job Tracker Application

A full-stack job application tracking system with Kanban board, calendar view, and resume management.

## Features

- **Kanban Board**: Drag & drop job cards across customizable columns
- **Job Management**: Track company, role, location, tags, resume versions, and notes
- **Interview Tracking**: Schedule and manage interview rounds with calendar integration
- **Resume Manager**: Upload and manage multiple resume versions
- **Calendar View**: Visualize all interviews in monthly/weekly/daily views
- **Google OAuth**: Secure authentication with Google

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Zustand (state management)
- TanStack Query (server state)
- Tailwind CSS + Shadcn UI
- DnD Kit (drag & drop)
- React Big Calendar
- React Markdown
- React Hook Form + Zod

### Backend
- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- Google OAuth2
- JWT authentication
- Multer (file uploads)

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- Google OAuth credentials

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Backend Configuration

1. Create a `.env` file in the `backend` directory:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads/resumes
```

2. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:8000/auth/google/callback`
   - Copy Client ID and Client Secret to `.env`

3. Start MongoDB:
   ```bash
   # If using local MongoDB
   mongod
   ```

4. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

The backend will run on `http://localhost:8000`

### 3. Frontend Configuration

1. Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

The frontend will run on `http://localhost:3000`

## Default Setup

On first login, the application will automatically create default Kanban columns:
- Applied
- Recruiter Call
- OA
- Phone Screen
- Onsite
- Offer

You can add, rename, or delete columns as needed.

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Passport, database config
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── index.ts         # Entry point
│   ├── uploads/             # Resume uploads (created automatically)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   │   ├── ui/          # Shadcn UI components
    │   │   ├── KanbanBoard.tsx
    │   │   ├── JobCard.tsx
    │   │   └── ...
    │   ├── hooks/           # Custom hooks (TanStack Query)
    │   ├── pages/           # Page components
    │   ├── store/           # Zustand stores
    │   ├── types/           # TypeScript types
    │   ├── lib/             # Utilities, API client
    │   └── App.tsx
    └── package.json
```

## API Endpoints

### Auth
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Columns
- `GET /columns` - Get all columns
- `POST /columns` - Create column
- `PUT /columns/:id` - Update column
- `DELETE /columns/:id` - Delete column

### Jobs
- `GET /jobs` - Get all jobs
- `POST /jobs` - Create job
- `PUT /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job
- `PATCH /jobs/:id/move` - Move job to different column

### Interviews
- `POST /interviews` - Create interview
- `GET /interviews/jobs/:jobId` - Get interviews for a job
- `PUT /interviews/:id` - Update interview
- `DELETE /interviews/:id` - Delete interview

### Resumes
- `POST /resumes/upload` - Upload resume (multipart/form-data)
- `GET /resumes` - Get all resumes
- `DELETE /resumes/:id` - Delete resume

## Development

### Backend
```bash
cd backend
npm run dev    # Development with hot reload
npm run build  # Build for production
npm start      # Run production build
```

### Frontend
```bash
cd frontend
npm run dev    # Development server
npm run build  # Build for production
npm run preview # Preview production build
```

## Notes

- Resume files are stored in `backend/uploads/resumes/`
- JWT tokens are stored in localStorage on the frontend
- All API requests include the JWT token in the Authorization header
- The application uses MongoDB for data persistence

## Troubleshooting

1. **MongoDB connection error**: Ensure MongoDB is running and the connection string is correct
2. **OAuth redirect error**: Verify the callback URL matches exactly in Google Cloud Console
3. **File upload errors**: Ensure the `uploads/resumes` directory exists and has write permissions
4. **CORS errors**: Check that `FRONTEND_URL` in backend `.env` matches your frontend URL

## License

MIT

