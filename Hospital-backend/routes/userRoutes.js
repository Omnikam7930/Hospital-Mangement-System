import express from 'express';
import { 
  registerUser, 
  loginUser, 
  registerPatient, 
  getPatientByAadhaar, 
  registerDoctor, 
  loginDoctor 
} from '../controllers/userController.js';

const router = express.Router();

// Legacy auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Patient routes
router.post('/patient/register', registerPatient);
router.get('/patient/:aadhaarNumber', getPatientByAadhaar);

// Doctor routes
router.post('/doctor/register', registerDoctor);
router.post('/doctor/login', loginDoctor);

export default router;