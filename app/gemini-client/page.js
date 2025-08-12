'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function GeminiClientPage() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Check if API key is available
      if (!process.env.NEXT_PUBLIC_GEMINI_KEY) {
        throw new Error('NEXT_PUBLIC_GEMINI_KEY is not configured. Please check your .env.local file.');
      }
      
      // Add a timeout to prevent hanging on slow responses
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      // Directly call Gemini API from client side
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.NEXT_PUBLIC_GEMINI_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: input.trim(),
                  },
                ],
              },
            ],
          }),
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error response:', errorData);
        throw new Error(`API error (${response.status}): ${errorData || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Extract the generated text from the response
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
      setResponse(generatedText);
      
    } catch (err) {
      console.error('Error calling Gemini API:', err);
      
      let errorMessage = 'Failed to get response from Gemini API';
      
      if (err.name === 'AbortError') {
        errorMessage = 'The request took too long to respond. Please try again with a shorter message.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-8 text-center">
              Gemini AI Client Demo
            </h1>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
              <form onSubmit={handleSubmit} className="mb-8">
                <label htmlFor="prompt" className="block text-gray-300 mb-2 text-sm font-medium">
                  Enter your prompt:
                </label>
                <div className="flex gap-2">
                  <textarea
                    id="prompt"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Gemini AI anything..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-all duration-300 resize-none min-h-[120px]"
                    disabled={isLoading}
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Submit
                      </>
                    )}
                  </motion.button>
                </div>
              </form>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200"
                  >
                    <p className="font-medium mb-1">Error</p>
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}

                {response && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="border border-gray-700 rounded-lg p-5 bg-gray-900/50"
                  >
                    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        Gemini Response
                      </span>
                    </h2>
                    <div className="prose prose-invert max-w-none">
                      <p className="whitespace-pre-wrap">{response}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 text-center text-gray-400 text-sm">
              <p>
                This demo uses the Gemini API directly from the client side.
                <br />
                Your API key is stored in <code className="bg-gray-800 px-1 py-0.5 rounded text-xs">.env.local</code> as <code className="bg-gray-800 px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_GEMINI_KEY</code>.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
