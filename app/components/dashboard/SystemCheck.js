'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function SystemCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const runSystemCheck = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/system/check');
      const data = await response.json();
      setResults(data);
      
      // Analyze results
      const dbConnected = data.database.connection;
      const foodCount = data.database.models.foods.count;
      
      if (!dbConnected) {
        toast.error('Database connection failed');
      } else if (foodCount === 0) {
        toast.info('Food database is empty. Seeding food data...');
        await seedFoodData();
      } else {
        toast.success('System check completed successfully');
      }
      
      setIsOpen(true);
    } catch (error) {
      console.error('System check error:', error);
      toast.error('Failed to run system check');
    } finally {
      setIsChecking(false);
    }
  };
  
  const seedFoodData = async () => {
    try {
      const response = await fetch('/api/food/seed');
      const data = await response.json();
      
      if (data.seeded) {
        toast.success(`Added ${data.count} food items to database`);
      } else {
        toast.info(data.message);
      }
    } catch (error) {
      console.error('Food seeding error:', error);
      toast.error('Failed to seed food data');
    }
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={runSystemCheck}
        disabled={isChecking}
        className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
      >
        {isChecking ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Running check...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Run System Check</span>
          </>
        )}
      </button>
      
      {isOpen && results && (
        <div className="mt-2 bg-gray-50 rounded-lg p-3 text-xs overflow-auto max-h-40">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">System Check Results</h4>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-600">Database:</p>
              <p className={results.database.connection ? "text-green-600" : "text-red-600"}>
                {results.database.connection ? "Connected" : "Not Connected"}
              </p>
            </div>
            
            <div>
              <p className="text-gray-600">Food Items:</p>
              <p className={results.database.models.foods.count > 0 ? "text-green-600" : "text-yellow-600"}>
                {results.database.models.foods.count} items
              </p>
            </div>
            
            <div>
              <p className="text-gray-600">Users:</p>
              <p>{results.database.models.users.count} accounts</p>
            </div>
            
            <div>
              <p className="text-gray-600">Environment:</p>
              <p>{results.environment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
