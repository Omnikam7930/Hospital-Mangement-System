import { db } from "../config/firebase.js";

// Add new patient
export const addPatient = async (req, res) => {
  try {
    const data = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const ref = await db.collection("patients").add(data);
    res.status(201).json({ message: "Patient added", patient: { id: ref.id, ...data } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all patients
export const getPatients = async (req, res) => {
  try {
    const snap = await db.collection("patients").get();
    const patients = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single patient by ID
export const getPatientById = async (req, res) => {
  try {
    const doc = await db.collection("patients").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: "Patient not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
