import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import contactRoutes from './routes/contact.routes.js'; 
import courseRoutes from './routes/course.routes.js';// FIXED: Using ES Import with explicit .js extension
import notesRoutes from './routes/notes.routes.js'; 
import assignmentRoutes from './routes/assignment.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import courseAnalysisRoutes from "./routes/courseanalysis.routes.js";
import feedbackRoutes from './routes/feedback.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import adminOverviewRoutes from './routes/adminoverview.routes.js';



import path from 'path';



// Global Middlewares
dotenv.config();

const app = express();

const allowedOrigins = [
  "https://eduvanta-app.vercel.app",
  "http://localhost:5173"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());


app.use('/uploads', express.static('uploads'));

app.use(express.urlencoded({ extended: true }));

// Test Route (Health Check)
app.get('/', (req, res) => {
  res.status(200).json({ status: "active", message: "E-Learning API is fully functional!" });
});

// Route Mountpoints
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes); // FIXED: Clean ES module routing reference
app.use('/api/courses', courseRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(
  "/api/course-analysis",
  courseAnalysisRoutes
);

app.use('/api/feedback', feedbackRoutes);

// Global Error Handler (Prevents silent backend crashes)
app.use((err, req, res, next) => {
  console.error('Backend Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use('/api/announcements', announcementRoutes);
app.use('/api/course_notes', notesRoutes);

app.use(
  '/api/admin/overview',
  adminOverviewRoutes
);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`🚀 Server listening on: http://localhost:${PORT}`);
    console.log(`=========================================`);
  });
}



export default app;
