import React from 'react';
import { Check, Star, Zap } from 'lucide-react';

const PricingSection: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for casual users',
      features: [
        '10 queries per day',
        '100,000 tokens per month',
        'Basic AI detection',
        'Chrome extension access',
        'Community support'
      ],
      buttonText: 'Get Started Free',
      buttonClass: 'border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600',
      popular: false
    },
    {
      name: 'Premium',
      price: '$2.99',
      period: 'per month',
      description: 'For power users and professionals',
      features: [
        'Unlimited daily queries',
        '1,000,000 tokens per month',
        'Advanced AI detection',
        'Priority processing',
        'Email support',
        'API access',
        'Custom alerts',
        'Detailed analytics'
      ],
      buttonText: 'Start Premium Trial',
      buttonClass: 'bg-blue-600 text-white hover:bg-blue-700',
      popular: true
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Start free and upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white rounded-2xl shadow-lg p-8 ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${plan.buttonClass}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Need a custom solution for your organization?</p>
          <button className="text-blue-600 hover:text-blue-700 font-semibold">
            Contact us for Enterprise pricing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;