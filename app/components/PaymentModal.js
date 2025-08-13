'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Toast from './Toast';

export default function PaymentModal({ isOpen, onClose, plan, price }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Create order
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan,
          ...formData
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment');
      }
      
      // Use Razorpay directly (the script is already loaded via RazorpayLoader)
      if (window.Razorpay) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.order.amount,
          currency: "INR",
          name: "BUILDUP X",
          description: `${plan} Membership Plan`,
          order_id: data.order.id,
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              
              const verifyData = await verifyResponse.json();
              
              if (verifyData.success) {
                // Show success toast
                setToast({
                  show: true,
                  message: 'Payment successful! Your membership has been activated.',
                  type: 'success'
                });
                
                // Wait briefly before redirecting to account setup
                setTimeout(() => {
                  onClose();
                  router.push(`/setup-account?email=${encodeURIComponent(formData.email)}&plan=${plan}`);
                }, 2000);
              } else {
                throw new Error(verifyData.error || 'Payment verification failed');
              }
            } catch (error) {
              setError(error.message);
              setIsLoading(false);
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: "#10B981"
          }
        };
        
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        setError('Failed to load payment gateway');
        setIsLoading(false);
      }
      
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      {toast.show && (
        <Toast 
          key="toast"
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-xl p-6 shadow-2xl w-full max-w-md border border-gray-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {plan} Membership - ₹{price.toLocaleString()}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-300 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-400">
              <p>Your payment is secured by Razorpay</p>
              <div className="flex justify-center mt-2">
                <div className="h-6 text-blue-500 font-bold">Razorpay</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
