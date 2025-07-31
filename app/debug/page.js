'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [action, setAction] = useState('check');
  const [authStatus, setAuthStatus] = useState(null);
  
  // Check auth status on page load
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      
      try {
        const data = await res.json();
        setAuthStatus(data);
      } catch (jsonError) {
        // If JSON parsing fails, get the text content instead
        const text = await res.text();
        setAuthStatus({ 
          error: 'Failed to parse JSON response', 
          status: res.status,
          responseText: text.substring(0, 500) // Limit text length
        });
      }
    } catch (error) {
      setAuthStatus({ error: error.message });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setResult({ status: 'Sending request...' });
      const res = await fetch('/api/auth/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, action })
      });
      
      try {
        const data = await res.json();
        setResult({ status: res.status, ...data });
      } catch (jsonError) {
        // If JSON parsing fails, get the text content instead
        const text = await res.text();
        setResult({ 
          error: 'Failed to parse JSON response', 
          status: res.status,
          responseText: text.substring(0, 500) // Limit text length
        });
      }
      
      checkAuthStatus(); // Refresh auth status after any action
    } catch (error) {
      setResult({ error: error.message });
    }
  };
  
  const testLogin = async () => {
    try {
      setResult({ status: 'Attempting login...' });
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      try {
        const data = await res.json();
        setResult({ loginAttempt: true, status: res.status, ...data });
      } catch (jsonError) {
        // If JSON parsing fails, get the text content instead
        const text = await res.text();
        setResult({ 
          loginAttempt: true, 
          error: 'Failed to parse JSON response', 
          status: res.status,
          responseText: text.substring(0, 500) // Limit text length
        });
      }
      
      checkAuthStatus(); // Refresh auth status after login attempt
    } catch (error) {
      setResult({ error: error.message });
    }
  };
  
  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await res.json();
      setResult({ logoutAttempt: true, ...data });
      checkAuthStatus(); // Refresh auth status after logout
    } catch (error) {
      setResult({ error: error.message });
    }
  };
  
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Tool</h1>
      
      {/* Auth Status Panel */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
        <h2 className="font-semibold mb-2 text-blue-800">Auth Status:</h2>
        {authStatus ? (
          <div>
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${authStatus.isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{authStatus.isLoggedIn ? 'Logged In' : 'Not Logged In'}</span>
            </div>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40 text-sm bg-white p-2 rounded">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
            
            {authStatus.isLoggedIn && (
              <button 
                onClick={logout}
                className="mt-2 bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        ) : (
          <p>Loading auth status...</p>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="text" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="check">Check User</option>
            <option value="test_login">Test Login Methods</option>
            <option value="reset">Reset/Create User</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <button 
            type="submit" 
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Submit
          </button>
          
          <button 
            type="button"
            onClick={testLogin}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Test Real Login
          </button>
          
          <button 
            type="button"
            onClick={checkAuthStatus}
            className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
          >
            Check Auth
          </button>
        </div>
      </form>
      
      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Result:</h2>
          <pre className="whitespace-pre-wrap overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
