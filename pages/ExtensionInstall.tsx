import React from 'react';
import { Link } from 'react-router-dom';
import { Chrome, Download, ArrowLeft, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const ExtensionInstall: React.FC = () => {
  const handleInstallExtension = () => {
    // In a real app, this would redirect to Chrome Web Store
    window.open('https://chrome.google.com/webstore/category/extensions', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-6">
              <Chrome className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Install Access Sentinel Extension</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Add our Chrome extension to start detecting AI-generated content and deepfakes in real-time as you browse.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Installation</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Click Install Extension</h3>
                    <p className="text-gray-600 text-sm">You'll be redirected to the Chrome Web Store</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Add to Chrome</h3>
                    <p className="text-gray-600 text-sm">Click "Add to Chrome" button in the store</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Start Protecting</h3>
                    <p className="text-gray-600 text-sm">The extension will automatically start analyzing content</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleInstallExtension}
                className="w-full mt-8 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Chrome className="w-5 h-5" />
                Install Extension
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Extension Features</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Real-time Analysis</h3>
                    <p className="text-gray-600 text-sm">Automatically scans content as you browse</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Visual Indicators</h3>
                    <p className="text-gray-600 text-sm">Clear badges show AI detection confidence</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Privacy Focused</h3>
                    <p className="text-gray-600 text-sm">No personal data collection or tracking</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Lightweight</h3>
                    <p className="text-gray-600 text-sm">Minimal impact on browser performance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">System Requirements</h3>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Chrome browser version 88 or higher</li>
                  <li>• Active internet connection for real-time analysis</li>
                  <li>• Free or Premium Access Sentinel account</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-6">
              Check out our installation guide or contact our support team if you encounter any issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/help"
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
              >
                Installation Guide
              </Link>
              <Link
                to="/contact"
                className="bg-blue-100 text-blue-700 px-6 py-2 rounded-lg hover:bg-blue-200"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionInstall;