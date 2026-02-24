import { db } from "../config/firebase.js";

export const addDoctor = async (req, res) => {
  try {
    const data = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const ref = await db.collection("doctors").add(data);
    res.status(201).json({ message: "Doctor added", doctor: { id: ref.id, ...data } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const snap = await db.collection("doctors").get();
    const doctors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doc = await db.collection("doctors").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: "Doctor not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
