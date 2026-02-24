import dotenv from "dotenv";
dotenv.config(); // Load .env as early as possible

import express from "express";
import cors from "cors";
import "./config/firebase.js"; // initialize Firebase Admin

import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";

console.log("✅ Starting server.js");
console.log("Loaded .env and initialized Firebase Admin");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health/root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'hospital-backend', 
    routes: ['/api/users', '/api/doctors', '/api/patients', '/api/emergency'] 
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/emergency", emergencyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
