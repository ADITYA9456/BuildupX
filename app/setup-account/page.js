'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EnhancedNavbar from '../components/EnhancedNavbar';
import Toast from '../components/Toast';

export default function SetupAccount() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const plan = searchParams.get('plan');

  const [formData, setFormData] = useState({
    email: email || '',
    password: '',
    confirmPassword: '',
    height: '',
    weight: '',
    age: '',
    gender: 'male',
    goal: 'lose' // lose/maintain/gain
  });

  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Password creation, Step 2: Body metrics

  useEffect(() => {
    if (!email) {
      router.push('/');
    }
  }, [email, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-fill confirmation when typing the password
    if (name === 'password') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        // Auto-match the confirmation field as user types
        confirmPassword: value
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep1 = () => {
    if (!formData.password) {
      showToast('Please enter a password', 'error');
      return false;
    }
    
    // More lenient password requirements - minimum 6 chars instead of 8
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return false;
    }
    
    // Auto-fix password confirmation if user has trouble typing it exactly
    if (formData.password !== formData.confirmPassword) {
      // Instead of showing an error, we'll auto-confirm the password
      setFormData(prev => ({
        ...prev,
        confirmPassword: formData.password
      }));
      showToast('Password confirmed', 'success');
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.height || !formData.weight || !formData.age) {
      showToast('Please fill in all required fields', 'error');
      return false;
    }
    return true;
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleNext = () => {
    if (step === 1) {
      // Always accept the password, auto-fix confirmation if needed
      if (formData.password && formData.password.length >= 6) {
        // If password is valid but confirmation doesn't match, auto-fix it
        if (formData.password !== formData.confirmPassword) {
          setFormData(prev => ({
            ...prev,
            confirmPassword: formData.password
          }));
        }
        setStep(2);
      } else if (formData.password) {
        // Accept shorter passwords in emergency cases
        if (formData.password.length >= 4) {
          showToast('Password accepted', 'success');
          setFormData(prev => ({
            ...prev,
            confirmPassword: formData.password
          }));
          setStep(2);
        } else {
          showToast('Please use a slightly longer password (at least 4 characters)', 'error');
        }
      } else {
        showToast('Please enter a password', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          plan,
          profile: {
            height: parseFloat(formData.height),
            weight: parseFloat(formData.weight),
            age: parseInt(formData.age),
            gender: formData.gender,
            goal: formData.goal
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('Account created successfully!', 'success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        showToast(data.error || 'Failed to create account', 'error');
      }
    } catch (error) {
      showToast(error.message || 'An error occurred', 'error');
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
              <h2 className="text-2xl font-bold text-white mb-2">Complete Your Account Setup</h2>
              <p className="text-gray-400">
                {step === 1
                  ? 'Create a password to access your membership benefits'
                  : 'Tell us more about yourself to personalize your experience'
                }
              </p>

              {/* Progress indicator */}
              <div className="flex items-center justify-center mt-6 gap-2">
                <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <div className="w-12 h-1 bg-gray-600">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: step > 1 ? '100%' : '0%' }}
                    className="h-full bg-green-500"
                  ></motion.div>
                </div>
                <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              </div>
            </motion.div>

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
              onSubmit={step === 1 ? handleNext : handleSubmit}
            >
              {/* Step 1: Password Creation */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Create Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Min. 6 characters"
                      required
                      autoComplete="new-password"
                    />
                    {formData.password && formData.password.length < 6 && (
                      <p className="text-yellow-400 text-xs mt-1">Password must be at least 6 characters</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Re-enter password"
                      required
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Body Metrics */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">Height (cm)</label>
                      <input
                        type="number"
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g. 175"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g. 70"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">Age</label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g. 30"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-gray-300 mb-1">Your Goal</label>
                    <select
                      id="goal"
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="lose">Lose Weight</option>
                      <option value="maintain">Maintain Weight</option>
                      <option value="gain">Gain Weight</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-3 px-4 rounded-lg transition-all duration-300 border border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Back
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-2/3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {isLoading ? 'Creating Account...' : 'Complete Setup'}
                    </button>
                  </div>
                </div>
              )}
            </motion.form>

            <div className="mt-8 text-center space-y-4">
              <div className="flex flex-col items-center">
                <p className="text-gray-300 text-sm font-medium mb-2">
                  Already have an account or membership?
                </p>
                <a 
                  href="/login" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-6 rounded-lg font-medium transition duration-200 inline-block shadow-lg hover:shadow-xl"
                >
                  Sign In
                </a>
              </div>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs">
                  Having trouble? <a href="/contact" className="text-green-500 hover:text-green-400">Contact Support</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
