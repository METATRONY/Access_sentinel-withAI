import React from 'react';
import { Eye, FileText, Users, BarChart3, Shield, Zap } from 'lucide-react';

const FeatureShowcase: React.FC = () => {
  const features = [
    {
      icon: Eye,
      title: 'Deepfake Detection',
      description: 'Advanced AI algorithms detect manipulated images and videos with 99.2% accuracy.',
      image: 'https://d64gsuwffb70l.cloudfront.net/68beaef035219b1f72aed65e_1757329059511_b23b732b.webp'
    },
    {
      icon: FileText,
      title: 'Text Analysis',
      description: 'Identify AI-generated text, fake news, and misinformation in real-time.',
      image: 'https://d64gsuwffb70l.cloudfront.net/68beaef035219b1f72aed65e_1757329058771_f4452a3c.webp'
    },
    {
      icon: BarChart3,
      title: 'Content Monitoring',
      description: 'Real-time dashboard showing authenticity scores and threat analysis.',
      image: 'https://d64gsuwffb70l.cloudfront.net/68beaef035219b1f72aed65e_1757329060228_c2fb9c32.webp'
    }
  ];

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive AI Detection Suite
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Protect yourself from digital deception with our advanced AI-powered authenticity verification tools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 h-full shadow-lg hover:shadow-xl transition-shadow">
                <div className="aspect-video rounded-lg mb-6 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-lg p-2 mr-3">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Secure Your Digital Experience?</h3>
          <p className="text-blue-100 mb-6">Join thousands of users protecting themselves from AI-generated deception.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Install Free Extension
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;