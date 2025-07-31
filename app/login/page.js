'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EnhancedNavbar from '../components/EnhancedNavbar';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Clear any previous errors that might be visible
    showToast('', '');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      setIsLoading(false);
      return;
    }

    // Ensure password is not empty
    if (!formData.password || formData.password.trim() === '') {
      showToast('Please enter your password', 'error');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting login with email:', formData.email);
      const result = await login(formData.email, formData.password);

      if (result.success) {
        showToast('Login successful! Redirecting...', 'success');
        // Router navigation is handled in the login function
      } else {
        showToast(result.error || 'Invalid email or password', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.message || 'An error occurred during login', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <EnhancedNavbar />
      <main className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen pt-24 px-4">
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}

        <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="py-8 px-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
              <p className="text-gray-400">Sign in to access your membership benefits</p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </motion.form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <a href="/" className="text-green-500 hover:text-green-400 font-medium">
                  Join Now
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
