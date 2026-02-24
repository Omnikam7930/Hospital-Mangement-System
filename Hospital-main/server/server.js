const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Parse incoming JSON

// 1️⃣ Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lifelineDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// 2️⃣ Define User Data Schema
const userSchema = new mongoose.Schema({
  aadhaarNumber: { type: String, required: true },
  deviceRequirementsMet: Boolean,
  biometricVerified: Boolean,
  medicalForm: {
    name: String,
    age: Number,
    medicalHistory: String
    // Add more fields as needed
  }
});

const User = mongoose.model('User', userSchema);

// 3️⃣ API Route to Save User Data
app.post('/api/user', async (req, res) => {
  try {
    const { aadhaarNumber, deviceRequirementsMet, biometricVerified, medicalForm } = req.body;

    // Check if Aadhaar already exists
    let user = await User.findOne({ aadhaarNumber });

    if (user) {
      // Update existing user
      user.deviceRequirementsMet = deviceRequirementsMet;
      user.biometricVerified = biometricVerified;
      user.medicalForm = medicalForm;
    } else {
      // New user
      user = new User({
        aadhaarNumber,
        deviceRequirementsMet,
        biometricVerified,
        medicalForm
      });
    }

    await user.save();
    res.json({ message: '✅ User data saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// 4️⃣ Start Server
app.listen(5000, () => {
  console.log('🚀 Server running at http://localhost:5000');
});
