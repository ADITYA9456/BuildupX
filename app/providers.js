'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

export function Providers({ children }) {
  return (
    <>
      <AuthProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#22c55e',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
        {children}
      </AuthProvider>
    </>
  );
}
