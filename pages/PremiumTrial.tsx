import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Check, ArrowLeft, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const PremiumTrial: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('auth-register', {
        body: { email, password, plan: 'premium_trial' }
      });

      if (error) throw error;

      setMessage('Premium trial started! Check your email to verify your account.');
    } catch (error: any) {
      setMessage(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 border-2 border-blue-200">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3 w-16 h-16 mx-auto mb-4">
              <Star className="w-10 h-10 text-white" />
            </div>
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1 mb-4">
              <Zap className="w-4 h-4" />
              14-Day Free Trial
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Premium Trial</h1>
            <p className="text-gray-600">Try all premium features risk-free</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Premium Trial Includes:</h3>
            <ul className="space-y-2">
              {[
                'Unlimited daily queries',
                '1,000,000 tokens per month',
                'Advanced AI detection',
                'Priority processing',
                'Email support',
                'API access',
                'Custom alerts',
                'Detailed analytics'
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Starting Trial...' : 'Start 14-Day Free Trial'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>No credit card required.</strong> Cancel anytime during the trial period. 
              After 14 days, continue for just $2.99/month or downgrade to free.
            </p>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${message.includes('started') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumTrial;