import express from 'express';
import { addDoctor, getDoctors, getDoctorById } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', addDoctor);

export default router;