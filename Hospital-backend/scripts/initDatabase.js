import { db } from '../config/firebase.js';

// Initialize database with detailed schema and sample data
const initDatabase = async () => {
  console.log('🗄️ Initializing database with detailed schema...');

  try {
    // 1. Users collection (patients and doctors)
    const usersData = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        password: '$2a$10$example', // bcrypt hash
        role: 'doctor',
        specialization: 'Cardiology',
        phone: '+1-555-0101',
        licenseNumber: 'MD123456',
        experience: 8,
        schedule: [
          { day: 'Monday', time: '9:00 AM - 5:00 PM' },
          { day: 'Wednesday', time: '9:00 AM - 5:00 PM' },
          { day: 'Friday', time: '9:00 AM - 5:00 PM' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@hospital.com',
        password: '$2a$10$example',
        role: 'doctor',
        specialization: 'Neurology',
        phone: '+1-555-0102',
        licenseNumber: 'MD789012',
        experience: 12,
        schedule: [
          { day: 'Tuesday', time: '8:00 AM - 4:00 PM' },
          { day: 'Thursday', time: '8:00 AM - 4:00 PM' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        password: '$2a$10$example',
        role: 'patient',
        aadhaarNumber: '123456789012',
        phone: '+1-555-0201',
        emergencyContact: {
          name: 'Jane Smith',
          phone: '+1-555-0202',
          relationship: 'Spouse'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // 2. Patients collection (detailed medical records)
    const patientsData = [
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        aadhaarNumber: '123456789012',
        age: 45,
        gender: 'Male',
        phone: '+1-555-0201',
        address: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        emergencyContact: {
          name: 'Jane Smith',
          phone: '+1-555-0202',
          relationship: 'Spouse',
          address: '123 Main St, Mumbai'
        },
        medicalHistory: [
          {
            condition: 'Hypertension',
            diagnosisDate: '2020-01-15',
            treatment: 'Lisinopril 10mg daily',
            status: 'Active',
            doctor: 'Dr. Sarah Johnson'
          },
          {
            condition: 'Diabetes Type 2',
            diagnosisDate: '2019-06-20',
            treatment: 'Metformin 500mg twice daily',
            status: 'Active',
            doctor: 'Dr. Michael Chen'
          }
        ],
        allergies: [
          { allergen: 'Penicillin', severity: 'Severe', reaction: 'Rash, difficulty breathing' },
          { allergen: 'Shellfish', severity: 'Moderate', reaction: 'Hives' }
        ],
        medications: [
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            startDate: '2020-01-15',
            prescribedBy: 'Dr. Sarah Johnson'
          },
          {
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            startDate: '2019-06-20',
            prescribedBy: 'Dr. Michael Chen'
          }
        ],
        assignedDoctor: 'Dr. Sarah Johnson',
        lastVisit: '2024-01-15',
        nextAppointment: '2024-02-15',
        insurance: {
          provider: 'HealthPlus Insurance',
          policyNumber: 'HP123456789',
          expiryDate: '2024-12-31'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        aadhaarNumber: '987654321098',
        age: 32,
        gender: 'Female',
        phone: '+1-555-0301',
        address: {
          street: '456 Oak Ave',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India'
        },
        emergencyContact: {
          name: 'Robert Davis',
          phone: '+1-555-0302',
          relationship: 'Brother',
          address: '456 Oak Ave, Delhi'
        },
        medicalHistory: [
          {
            condition: 'Asthma',
            diagnosisDate: '2018-03-10',
            treatment: 'Albuterol inhaler as needed',
            status: 'Active',
            doctor: 'Dr. Michael Chen'
          }
        ],
        allergies: [
          { allergen: 'Dust mites', severity: 'Moderate', reaction: 'Wheezing' }
        ],
        medications: [
          {
            name: 'Albuterol',
            dosage: '90mcg',
            frequency: 'As needed',
            startDate: '2018-03-10',
            prescribedBy: 'Dr. Michael Chen'
          }
        ],
        assignedDoctor: 'Dr. Michael Chen',
        lastVisit: '2024-01-10',
        nextAppointment: '2024-03-10',
        insurance: {
          provider: 'MediCare Plus',
          policyNumber: 'MP987654321',
          expiryDate: '2024-11-30'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // 3. Appointments collection
    const appointmentsData = [
      {
        patientId: 'patient1',
        doctorId: 'doctor1',
        patientName: 'John Smith',
        doctorName: 'Dr. Sarah Johnson',
        date: '2024-02-15',
        time: '10:00 AM',
        duration: 30,
        type: 'Follow-up',
        status: 'Scheduled',
        notes: 'Blood pressure check',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        patientId: 'patient2',
        doctorId: 'doctor2',
        patientName: 'Emily Davis',
        doctorName: 'Dr. Michael Chen',
        date: '2024-03-10',
        time: '2:00 PM',
        duration: 45,
        type: 'Consultation',
        status: 'Scheduled',
        notes: 'Asthma management review',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // 4. Medical Records collection
    const medicalRecordsData = [
      {
        patientId: 'patient1',
        patientName: 'John Smith',
        recordType: 'Lab Results',
        date: '2024-01-15',
        doctor: 'Dr. Sarah Johnson',
        results: {
          bloodPressure: '140/90',
          heartRate: 85,
          bloodSugar: '180 mg/dL',
          cholesterol: '220 mg/dL'
        },
        notes: 'Patient shows improvement in blood pressure control',
        attachments: ['lab_report_001.pdf'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Insert sample data
    console.log('📝 Adding users...');
    for (const user of usersData) {
      await db.collection('users').add(user);
    }

    console.log('👥 Adding patients...');
    for (const patient of patientsData) {
      await db.collection('patients').add(patient);
    }

    console.log('📅 Adding appointments...');
    for (const appointment of appointmentsData) {
      await db.collection('appointments').add(appointment);
    }

    console.log('📋 Adding medical records...');
    for (const record of medicalRecordsData) {
      await db.collection('medicalRecords').add(record);
    }

    console.log('✅ Database initialized successfully!');
    console.log('📊 Collections created:');
    console.log('  - users (doctors and patients)');
    console.log('  - patients (detailed medical records)');
    console.log('  - appointments (scheduled visits)');
    console.log('  - medicalRecords (lab results, etc.)');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

// Run initialization
initDatabase().then(() => {
  console.log('🎉 Database setup complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
});
