import React from 'react';
import { Heart, Shield, Users, Clock, User, Stethoscope } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-4 rounded-2xl">
              <Heart className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              LifeLine
            </span>
            <br />
            Emergency Health Records
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Quick, secure access to medical info during emergencies. Doctors can view records with Aadhaar; 
            users keep their details updated anytime.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* User Portal Card */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <User className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">User Portal</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Create and manage your emergency health records. Keep your medical information 
                updated and accessible during emergencies.
              </p>
              <button
                onClick={() => onNavigate('user')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Login as User
              </button>
            </div>
            
            {/* Doctor Portal Card */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-teal-200">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 rounded-xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Doctor Portal</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Access user records during emergencies. Secure verification ensures only authorized 
                medical professionals can view records.
              </p>
              <button
                onClick={() => onNavigate('doctor')}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Login as Doctor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose LifeLine?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our system addresses critical healthcare challenges with innovative technology solutions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl w-fit mx-auto mb-6">
                <Clock className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Access</h3>
              <p className="text-gray-600 leading-relaxed">
                Quick retrieval of medical records during critical emergencies
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl w-fit mx-auto mb-6">
                <Shield className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure</h3>
              <p className="text-gray-600 leading-relaxed">
                Multi-layer authentication ensures data privacy and security
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-xl w-fit mx-auto mb-6">
                <Heart className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Life Saving</h3>
              <p className="text-gray-600 leading-relaxed">
                Prevents medical errors and saves precious time in emergencies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl p-8 md:p-12 border border-red-100">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">The Problem We Solve</h2>
              <p className="text-xl text-gray-600">Critical healthcare challenges that cost lives</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-100">
                <h3 className="text-2xl font-bold text-red-700 mb-4">Emergency Situation</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  In accident or emergency cases, patients are often admitted without relatives or identification. 
                  Doctors waste precious time identifying the patient, collecting their medical history, allergies, 
                  or ongoing treatments. This delay may lead to <strong>incorrect medication, delayed treatment, 
                  or even loss of life</strong>.
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-semibold">
                    ✅ LifeLine provides instant access to critical medical information, eliminating these life-threatening delays.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;