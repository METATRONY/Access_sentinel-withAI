import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Zap, Brain, Eye, Lock, BarChart3, Bell, Globe } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Detection',
      description: 'Our cutting-edge algorithms can identify AI-generated text, images, and deepfakes with industry-leading accuracy.',
      details: ['GPT detection', 'Image synthesis detection', 'Deepfake identification', 'Audio manipulation detection']
    },
    {
      icon: Zap,
      title: 'Real-time Analysis',
      description: 'Get instant results as you browse. No waiting, no delays - just immediate protection from AI-generated content.',
      details: ['Instant scanning', 'Live content analysis', 'Background processing', 'Minimal performance impact']
    },
    {
      icon: Eye,
      title: 'Visual Indicators',
      description: 'Clear, intuitive badges and overlays show you exactly which content is AI-generated and with what confidence level.',
      details: ['Color-coded badges', 'Confidence scores', 'Detailed tooltips', 'Customizable alerts']
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Your browsing data stays private. We analyze content without storing or tracking your personal information.',
      details: ['No data collection', 'Local processing', 'Encrypted communications', 'GDPR compliant']
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Track your protection stats, see detection trends, and understand the AI content landscape around you.',
      details: ['Usage statistics', 'Detection history', 'Trend analysis', 'Custom reports']
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Get notified when suspicious content is detected, with customizable alert levels and notification preferences.',
      details: ['Custom thresholds', 'Email notifications', 'Browser alerts', 'Weekly summaries']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-6">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Digital Protection
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access Sentinel combines advanced AI technology with user-friendly design to provide comprehensive protection against digital deception.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 rounded-lg p-3 w-12 h-12 mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 md:p-12 text-white text-center mb-16">
            <Globe className="w-16 h-16 mx-auto mb-6 text-blue-200" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Protecting the Internet, One Page at a Time
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Access Sentinel to help them navigate the increasingly complex landscape of AI-generated content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup/free"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Start Free Today
              </Link>
              <Link
                to="/extension/install"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Install Extension
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-2">99.2%</div>
              <div className="text-gray-600">Detection Accuracy</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-2">50M+</div>
              <div className="text-gray-600">Content Items Analyzed</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;