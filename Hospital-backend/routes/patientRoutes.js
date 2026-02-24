import express from 'express';
import { addPatient, getPatients, getPatientById } from '../controllers/patientController.js';

const router = express.Router();

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', addPatient);

export default router;