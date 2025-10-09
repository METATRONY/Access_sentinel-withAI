import React from 'react';
import { Chrome, Download, Shield, Zap, Eye, CheckCircle } from 'lucide-react';

const ExtensionShowcase: React.FC = () => {
  const features = [
    {
      icon: Eye,
      title: 'Real-time Scanning',
      description: 'Automatically analyze content as you browse'
    },
    {
      icon: Shield,
      title: 'Privacy Protected',
      description: 'All analysis happens securely with your data protected'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get authenticity scores in milliseconds'
    },
    {
      icon: CheckCircle,
      title: 'High Accuracy',
      description: '99.2% accuracy in detecting AI-generated content'
    }
  ];

  const steps = [
    {
      step: '1',
      title: 'Install Extension',
      description: 'Add Access Sentinel to your Chrome browser in one click'
    },
    {
      step: '2',
      title: 'Browse Normally',
      description: 'Continue browsing as usual - the extension works automatically'
    },
    {
      step: '3',
      title: 'Get Alerts',
      description: 'Receive instant notifications when AI-generated content is detected'
    }
  ];

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Chrome Extension
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Install our Chrome extension and start protecting yourself from AI-generated deception instantly.
          </p>
        </div>

        {/* Extension Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Installation Steps */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Get Started in 3 Simple Steps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <Chrome className="w-16 h-16 mx-auto mb-4 text-blue-200" />
            <h3 className="text-2xl font-bold mb-4">Ready to Install?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of users who are already protecting themselves from AI-generated deception.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                <Chrome className="w-5 h-5" />
                Add to Chrome - Free
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download for Other Browsers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionShowcase;