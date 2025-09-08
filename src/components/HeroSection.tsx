import React from 'react';
import { Shield, Zap, Chrome } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-purple-700 to-blue-900 text-white overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url('https://d64gsuwffb70l.cloudfront.net/68beaef035219b1f72aed65e_1757329057877_7dacf29e.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
              <Shield className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Access Sentinel
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Detect AI-generated content, deepfakes, and misinformation in real-time. 
            Protect yourself from digital deception with advanced AI authenticity verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
              <Chrome className="w-5 h-5" />
              Install Extension
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Zap className="w-8 h-8 text-yellow-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Real-time Detection</h3>
                <p className="text-blue-100 text-sm">Instantly analyze content as you browse</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Shield className="w-8 h-8 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-blue-100 text-sm">Advanced algorithms detect sophisticated fakes</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Chrome className="w-8 h-8 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chrome Integration</h3>
                <p className="text-blue-100 text-sm">Seamlessly integrated into your browser</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;