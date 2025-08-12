'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { IoChatbubbleEllipses } from 'react-icons/io5';

export default function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage = message.trim();
    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Add a timeout to prevent hanging on slow responses
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Failed to parse response from server');
      }
      
      if (response.ok && data.response) {
        setChatHistory((prev) => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        console.error('API error:', data.error || 'Unknown error');
        setChatHistory((prev) => [
          ...prev,
          { 
            role: 'assistant', 
            content: `I'm having trouble connecting to my brain right now. ${data.error || 'Please try again in a moment.'}` 
          },
        ]);
      }
    } catch (error) {
      console.error('Error in chat submission:', error);
      let errorMessage = 'Sorry, there was an error processing your request.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'The request took too long to respond. Please try again with a shorter message.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Icon Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg flex items-center justify-center"
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 0 25px rgba(34, 197, 94, 0.5)"
        }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
      >
        {isOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <IoChatbubbleEllipses className="text-2xl" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-full sm:w-96 h-[500px] max-h-[80vh] rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-xl overflow-hidden flex flex-col"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <IoChatbubbleEllipses className="text-xl" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
                onClick={toggleChat}
                className="text-white/80 hover:text-white"
              >
                <FaTimes />
              </motion.button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50 backdrop-blur-sm">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-4">
                  <IoChatbubbleEllipses className="text-4xl mb-2 text-green-500" />
                  <p className="text-sm">Hi there! How can I help you today?</p>
                </div>
              ) : (
                chatHistory.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-gray-800 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-all duration-300"
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg p-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaPaperPlane />
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
