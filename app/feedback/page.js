'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    rating: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  // This ensures the component renders the same on server and client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!formData.rating) newErrors.rating = 'Rating is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus({ success: false, message: '' });
    
    try {
      // Basic feedback data
      const feedbackData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        rating: formData.rating
      };
      
      // Send to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      // Handle non-OK responses
      if (!response.ok) {
        throw new Error('Failed to submit feedback. Please try again.');
      }

      // Success path
      setSubmitStatus({ 
        success: true, 
        message: 'Thank you for your feedback! We appreciate your input.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        rating: 0
      });
      
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus({ 
        success: false, 
        message: 'Unable to submit feedback. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render star ratings until client-side
  if (!isClient) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-black text-white pt-28 pb-20">
          <div className="max-w-4xl mx-auto px-4 flex justify-center items-center h-screen">
            <div className="animate-pulse text-xl">Loading...</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-green-200 to-green-500 bg-clip-text text-transparent mb-4">
              Your Feedback Matters
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-green-400 to-green-600 mx-auto mb-6 rounded-full" />
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              We value your thoughts and suggestions. Help us improve and provide better fitness solutions by sharing your experience.
            </p>
          </motion.div>

          {/* Feedback Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 md:p-10 border border-gray-700/50 shadow-xl"
          >
            {submitStatus.success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-gray-300">{submitStatus.message}</p>
                <button
                  onClick={() => setSubmitStatus({ success: false, message: '' })}
                  className="mt-8 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full cursor-pointer"
                >
                  Submit Another Feedback
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-gray-300 mb-2 text-sm font-medium">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full bg-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 border ${
                        errors.name ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-2 text-sm font-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full bg-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 border ${
                        errors.email ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder="johndoe@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Subject Field */}
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-gray-300 mb-2 text-sm font-medium">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 border ${
                      errors.subject ? 'border-red-500' : 'border-gray-700'
                    }`}
                    placeholder="Feedback about your service"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                  )}
                </div>

                {/* Message Field */}
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-300 mb-2 text-sm font-medium">
                    Your Feedback
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 border ${
                      errors.message ? 'border-red-500' : 'border-gray-700'
                    }`}
                    placeholder="Share your experience with us..."
                    rows="5"
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Star Rating */}
                <div className="mb-8">
                  <label className="block text-gray-300 mb-3 text-sm font-medium">
                    Rate Your Experience
                  </label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className="cursor-pointer mr-2 p-1"
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                      >
                        <FaStar
                          className={`text-3xl cursor-pointer ${
                            star <= (hoveredRating || formData.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-600'
                          }`}
                          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                          onClick={() => handleRatingClick(star)}
                        />
                      </div>
                    ))}
                    <span className="ml-3 text-gray-400">
                      {formData.rating ? `${formData.rating}/5` : 'Select Rating'}
                    </span>
                  </div>
                  {errors.rating && (
                    <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>

                {/* Error Message */}
                {submitStatus.message && !submitStatus.success && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-center">
                    {submitStatus.message}
                  </div>
                )}
              </form>
            )}
          </motion.div>

          {/* Extra Info Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-400 mb-4">
              Your feedback helps us continuously improve our services. We appreciate the time you've taken to share your thoughts with us.
            </p>
            <p className="text-gray-500 text-sm">
              For urgent inquiries, please contact us directly at{' '}
              <a href="mailto:info@gymx.com" className="text-green-500 hover:text-green-400 transition-colors duration-300 cursor-pointer">
                info@gymx.com
              </a>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
