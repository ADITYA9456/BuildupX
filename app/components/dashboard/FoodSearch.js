'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function FoodSearch({ onFoodSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // For storing previous search results
  const [previousSearches, setPreviousSearches] = useState({});
  
  // Enhanced search with caching of recent results
  const getSearchResults = useCallback(async (query) => {
    // Check if we have recent cached results for this query
    if (previousSearches[query]) {
      console.log('Using cached results for', query);
      return previousSearches[query];
    }
    
    try {
      const response = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success && data.foods && data.foods.length > 0) {
        // Cache these results for future use
        setPreviousSearches(prev => ({
          ...prev,
          [query]: data.foods
        }));
        return data.foods;
      }
      return [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, [previousSearches]);

  // Debounced search
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await getSearchResults(searchTerm);
        
        if (searchResults && searchResults.length > 0) {
          setResults(searchResults);
          setShowResults(true);
        } else {
          // If no results, offer to add custom food
          setResults([]);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Error searching foods:", error);
        setResults([]);
        setShowResults(true);
      } finally {
        setIsLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, getSearchResults]);

  const handleSelect = (food) => {
    setSearchTerm('');
    setShowResults(false);
    onFoodSelect(food);
  };

  const handleAddCustomFood = async () => {
    if (searchTerm.trim().length < 2) return;
    
    setIsLoading(true);
    
    try {
      console.log('🍎 Adding food with AI:', searchTerm);
      
      const response = await fetch('/api/addFood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodString: searchTerm.trim()
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Convert the API response to our food format
        const aiFood = {
          _id: data.data._id,
          name: data.data.food,
          calories: parseFloat(data.data.calories.replace(/[^\d.]/g, '')) || 0,
          protein: parseFloat(data.data.protein.replace(/[^\d.]/g, '')) || 0,
          carbs: parseFloat(data.data.carbs.replace(/[^\d.]/g, '')) || 0,
          fat: parseFloat(data.data.fat.replace(/[^\d.]/g, '')) || 0,
          fiber: parseFloat(data.data.fiber.replace(/[^\d.]/g, '')) || 0,
          source: 'gemini-ai'
        };
        
        console.log('✅ AI food data:', aiFood);
        
        // Add to cached results so it appears in future searches
        setPreviousSearches(prev => ({
          ...prev,
          [searchTerm.toLowerCase()]: [aiFood, ...(prev[searchTerm.toLowerCase()] || [])]
        }));
        
        handleSelect(aiFood);
      } else {
        console.warn('⚠️ AI nutrition data not available:', data.error || 'Unknown error');
        
        // Check if this is a fallback situation (AI temporarily unavailable)
        if (data.fallback) {
          console.log('🔄 Using fallback: Creating manual food entry');
        }
        
        // Fallback to manual custom food
        const customFood = {
          _id: `custom-${Date.now()}`,
          name: searchTerm,
          calories: 100,
          protein: 5,
          carbs: 10,
          fat: 2,
          fiber: 1,
          isCustom: true
        };
        
        setPreviousSearches(prev => ({
          ...prev,
          [searchTerm.toLowerCase()]: [customFood, ...(prev[searchTerm.toLowerCase()] || [])]
        }));
        
        handleSelect(customFood);
      }
    } catch (error) {
      console.warn('⚠️ Network error calling AI API:', error.message);
      // Fallback to manual custom food
      const customFood = {
        _id: `custom-${Date.now()}`,
        name: searchTerm,
        calories: 100,
        protein: 5,
        carbs: 10,
        fat: 2,
        fiber: 1,
        isCustom: true
      };
      
      setPreviousSearches(prev => ({
        ...prev,
        [searchTerm.toLowerCase()]: [customFood, ...(prev[searchTerm.toLowerCase()] || [])]
      }));
      
      handleSelect(customFood);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a food..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      
      <AnimatePresence>
        {showResults && (searchTerm.length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-20 mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden"
          >
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-green-500 border-r-transparent"></div>
                <p className="text-gray-400 mt-2">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {results.map((food) => (
                  <div
                    key={food._id || food.name}
                    onClick={() => handleSelect(food)}
                    className="px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700 last:border-0"
                  >
                    <div className="font-medium text-white">{food.name}</div>
                    <div className="text-sm text-gray-400 flex justify-between">
                      <span>{food.calories} kcal per serving</span>
                      <span>P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <p className="text-gray-400 mb-2">No foods found for &quot;{searchTerm}&quot;</p>
                <button
                  onClick={handleAddCustomFood}
                  disabled={isLoading}
                  className={`w-full ${isLoading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Getting nutrition data...
                    </>
                  ) : (
                    <>
                      🤖 + Add &quot;{searchTerm}&quot; with AI nutrition
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
