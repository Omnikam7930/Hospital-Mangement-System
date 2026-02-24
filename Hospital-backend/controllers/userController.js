import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/firebase.js";

// Register Patient with Aadhaar
export const registerPatient = async (req, res) => {
  try {
    console.log('🔄 Patient registration request received:', {
      aadhaarNumber: req.body.aadhaarNumber,
      fullName: req.body.fullName,
      hasFaceImage: !!req.body.faceImage,
      faceImageLength: req.body.faceImage ? req.body.faceImage.length : 0,
      faceImagePreview: req.body.faceImage ? req.body.faceImage.substring(0, 50) + '...' : 'None',
      timestamp: new Date().toISOString()
    });

    const { 
      aadhaarNumber, 
      fullName, 
      phoneNumber, 
      email, 
      dateOfBirth, 
      gender, 
      bloodGroup, 
      height, 
      weight, 
      address, 
      emergencyContactName, 
      emergencyContactRelation, 
      emergencyContactPhone, 
      insuranceProvider, 
      policyNumber, 
      validUntil, 
      chronicConditions, 
      allergies, 
      previousHospitalizations, 
      pastSurgeries, 
      vaccinationHistory, 
      currentMedications, 
      familyMedicalHistory,
      medicalReports,
      deviceRequirementsMet,
      biometricVerified,
      faceImage
    } = req.body;

    // Check if patient already exists
    const patientsRef = db.collection("patients");
    const existing = await patientsRef.where("aadhaarNumber", "==", aadhaarNumber).limit(1).get();
    
    if (!existing.empty) {
      // Update existing patient
      console.log('📝 Updating existing patient:', aadhaarNumber);
      const doc = existing.docs[0];
      const patientData = {
        fullName,
        phoneNumber,
        email,
        dateOfBirth,
        gender,
        bloodGroup,
        height,
        weight,
        address,
        emergencyContactName,
        emergencyContactRelation,
        emergencyContactPhone,
        insuranceProvider,
        policyNumber,
        validUntil,
        chronicConditions,
        allergies,
        previousHospitalizations,
        pastSurgeries,
        vaccinationHistory,
        currentMedications,
        familyMedicalHistory,
        medicalReports,
        deviceRequirementsMet,
        biometricVerified,
        faceImage,
        lastUpdated: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await doc.ref.update(patientData);
      console.log('✅ Patient updated successfully:', doc.id);
      return res.json({ message: "Patient updated successfully", patient: { id: doc.id, ...patientData } });
    }

    // Create new patient
    const newPatient = {
      aadhaarNumber,
      fullName,
      phoneNumber,
      email,
      dateOfBirth,
      gender,
      bloodGroup,
      height,
      weight,
      address,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone,
      insuranceProvider,
      policyNumber,
      validUntil,
      chronicConditions: chronicConditions || [],
      allergies: allergies || [],
      previousHospitalizations: previousHospitalizations || [],
      pastSurgeries: pastSurgeries || [],
      vaccinationHistory: vaccinationHistory || [],
      currentMedications: currentMedications || [],
      familyMedicalHistory,
      medicalReports: medicalReports || [],
      deviceRequirementsMet,
      biometricVerified,
      faceImage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await patientsRef.add(newPatient);
    const patient = { id: docRef.id, ...newPatient };

    console.log('✅ New patient created successfully:', docRef.id);
    res.status(201).json({ message: "Patient registered successfully", patient });
  } catch (error) {
    console.error("Patient registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Patient by Aadhaar
export const getPatientByAadhaar = async (req, res) => {
  try {
    const { aadhaarNumber } = req.params;
    
    const patientsRef = db.collection("patients");
    const snapshot = await patientsRef.where("aadhaarNumber", "==", aadhaarNumber).limit(1).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const doc = snapshot.docs[0];
    const patient = { id: doc.id, ...doc.data() };

    res.json({ message: "Patient found", patient });
  } catch (error) {
    console.error("Get patient error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Register Doctor
export const registerDoctor = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      specialization, 
      licenseNumber, 
      hospital, 
      department, 
      phoneNumber,
      experience,
      documents
    } = req.body;

    // Check if doctor already exists
    const doctorsRef = db.collection("doctors");
    const existing = await doctorsRef.where("email", "==", email).limit(1).get();
    if (!existing.empty) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = {
      name,
      email,
      password: hashedPassword,
      specialization,
      licenseNumber,
      hospital,
      department,
      phoneNumber,
      experience,
      documents: documents || [],
      status: 'pending', // pending, approved, rejected
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await doctorsRef.add(newDoctor);
    const doctor = { id: docRef.id, ...newDoctor };

    res.status(201).json({ message: "Doctor registered successfully", doctor });
  } catch (error) {
    console.error("Doctor registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Login Doctor
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctorsRef = db.collection("doctors");
    const snapshot = await doctorsRef.where("email", "==", email).limit(1).get();
    if (snapshot.empty) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const doc = snapshot.docs[0];
    const doctor = { id: doc.id, ...doc.data() };

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (doctor.status !== 'approved') {
      return res.status(403).json({ message: "Doctor account not approved yet" });
    }

    const token = jwt.sign({ id: doctor.id, role: 'doctor' }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "Login successful", token, doctor });
  } catch (error) {
    console.error("Doctor login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Legacy functions for backward compatibility
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const usersRef = db.collection("users");
    const existing = await usersRef.where("email", "==", email).limit(1).get();
    if (!existing.empty) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: role || "patient",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await usersRef.add(newUser);
    const user = { id: docRef.id, ...newUser };

    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).limit(1).get();
    if (snapshot.empty) return res.status(400).json({ message: "Invalid credentials" });

    const doc = snapshot.docs[0];
    const user = { id: doc.id, ...doc.data() };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
