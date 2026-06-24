import React from 'react';
import { ArrowLeft, Users, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

interface AboutUsProps {
  onNavigate: (page: string) => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onNavigate }) => {
  const teamMembers = [
    { name: "Atharava Keval", role: "Lead Developer", description: "Project lead and full-stack development" },
    { name: "Sahil Shelkar", role: "Backend Developer", description: "Database design and API development" },
    { name: "Om Nikam", role: "Frontend Developer", description: "User interface and experience design" },
    { name: "Nikhil Nikam", role: "UI/UX Designer", description: "Visual design and user research" },
    { name: "Aditya Vairagar", role: "Database Designer", description: "Database architecture and optimization" },
    { name: "Sudhanshu Raktate", role: "Quality Assurance", description: "Testing and quality control" }
  ];

  const userSteps = [
    "Register with Aadhaar number and biometric verification",
    "Complete comprehensive medical information form",
    "Upload medical reports and keep information updated",
    "Records are instantly accessible during emergencies"
  ];

  const doctorSteps = [
    "Verify identity with special medical professional ID",
    "Complete authentication with Aadhaar or biometric",
    "Enter professional credentials and hospital details",
    "Search and access patient records instantly"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">LifeLine</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Revolutionizing emergency healthcare through innovative digital health records technology
          </p>
        </div>

        {/* Problem Statement */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl p-8 md:p-12 border border-red-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">The Critical Problem</h2>
              <p className="text-lg text-gray-600">Understanding the healthcare emergency we're solving</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-100">
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                In accident or emergency cases, patients are often admitted without relatives or identification. 
                Doctors waste precious time identifying the patient, collecting their medical history, allergies, 
                or ongoing treatments. This delay may lead to <strong className="text-red-600">incorrect medication, 
                delayed treatment, or even loss of life</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                There is a strong need for a digital health record system accessible instantly in emergencies. 
                <strong className="text-blue-600"> LifeLine bridges this critical gap</strong>, providing immediate 
                access to life-saving medical information when every second counts.
              </p>
            </div>
          </div>
        </div>

        {/* How LifeLine Works */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How LifeLine Works</h2>
            <p className="text-lg text-gray-600">Simple, secure, and life-saving process for users and doctors</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Users */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-blue-600 mb-6 text-center">For Users</h3>
              <div className="space-y-6">
                {userSteps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* For Doctors */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-teal-600 mb-6 text-center">For Doctors</h3>
              <div className="space-y-6">
                {doctorSteps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Development Team */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Development Team</h2>
            <p className="text-lg text-gray-600">Meet the talented students behind LifeLine</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
              <p className="text-gray-300 text-lg">Get in touch with our development team</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-6">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-blue-400" />
                    <span>omnikam7930@gmail.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-blue-400" />
                    <span>+91 7028403839</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6">Institution</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-blue-400 mt-1" />
                    <div>
                      <p className="font-semibold">Ajjenkya Dy patil  College of Engineering</p>
                      <p className="text-gray-300">Pune, Maharashtra</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <p className="text-center text-gray-300">
                This project was developed as part of our academic curriculum to address real-world 
                healthcare challenges through innovative technology solutions.
              </p>
            </div>
          </div>
        </div>

        {/* Project Impact */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border border-green-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Project Impact</h2>
              <p className="text-lg text-gray-600">How LifeLine makes a difference in emergency healthcare</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-fit mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Saves Lives</h3>
                <p className="text-gray-600">Instant access to critical medical information during emergencies</p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-fit mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Reduces Errors</h3>
                <p className="text-gray-600">Accurate medical history prevents incorrect treatments</p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-fit mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Improves Care</h3>
                <p className="text-gray-600">Better informed doctors can provide superior treatment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
