import { useState } from 'react';
import { Heart } from 'lucide-react';
import Home from './components/Home';
import AboutUs from './components/AboutUs';
import UserPortal from './components/UserPortal';
import DoctorPortal from './components/DoctorPortal';
import AdminPanel from './components/AdminPanel';
import CameraTest from './components/CameraTest';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'about':
        return <AboutUs onNavigate={setCurrentPage} />;
      case 'user':
        return <UserPortal onNavigate={setCurrentPage} />;
      case 'doctor':
        return <DoctorPortal onNavigate={setCurrentPage} />;
      case 'admin':
        return <AdminPanel onBack={() => setCurrentPage('home')} />;
      case 'camera-test':
        return <CameraTest />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                LifeLine
              </span>
            </div>
            <div className="flex space-x-8">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  currentPage === 'home'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  currentPage === 'about'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                About Us
              </button>
                      <button
                        onClick={() => setCurrentPage('admin')}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                          currentPage === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        Admin Panel
                      </button>
                      <button
                        onClick={() => setCurrentPage('camera-test')}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                          currentPage === 'camera-test'
                            ? 'bg-orange-100 text-orange-700'
                            : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                        }`}
                      >
                        Camera Test
                      </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{renderPage()}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">LifeLine</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Emergency Health Records System providing instant access to critical medical 
                information during emergencies.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Development Team</h3>
              <div className="space-y-1 text-gray-300">
                <p>Snehal Kadam</p>
                <p>Krishna Kadam</p>
                <p>Atharva Keval</p>
                <p>Anushka Deokar</p>
                <p>Pallavi Gunjal</p>
                <p>Sanika Kale</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-2 text-gray-300">
                <p>snehalKadam2030@gmail.com</p>
                <p>+91 8329656866</p>
                <p className="mt-4">Sanjivani College of Engineering</p>
                <p>Kopargaon, Maharashtra</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 LifeLine Emergency Health Records System. Developed by students of Sanjivani College of Engineering.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;