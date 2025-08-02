'use client';

import { useState } from 'react';

export default function DietPlanGenerator({ profileData, dailyTargets, onClose }) {
  const [loading, setLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [duration, setDuration] = useState('day');
  const [preferences, setPreferences] = useState('no_preferences');
  const [error, setError] = useState(null);

  // Extract relevant profile data
  const {
    height = 170,
    weight = 70,
    age = 30,
    gender = 'male',
    goal = 'maintain',
    activityLevel = 'moderate'
  } = profileData?.profile || {};

  const handleGenerateDietPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call API to generate diet plan
      const response = await fetch('/api/diet/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          height,
          weight,
          age,
          gender,
          goal,
          activityLevel,
          duration,
          preferences,
          dailyTargets
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate diet plan');
      }

      const data = await response.json();
      setDietPlan(data.dietPlan);
    } catch (error) {
      console.error('Error generating diet plan:', error);
      setError(error.message || 'Failed to generate diet plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      setLoading(true);
      
      // Create a hidden iframe to hold the PDF content
      const iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      document.body.appendChild(iframe);
      
      // Generate the HTML content for the PDF
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>BildupX - Your Personalized Diet Plan</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #22c55e;
              text-align: center;
              border-bottom: 2px solid #22c55e;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            h2 {
              color: #22c55e;
              margin-top: 20px;
            }
            h3 {
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .meal {
              margin-bottom: 20px;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            .meal-header {
              font-weight: bold;
              text-transform: capitalize;
              margin-bottom: 10px;
              color: #22c55e;
            }
            .item-list {
              padding-left: 20px;
            }
            .nutrition-info {
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #eee;
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              color: #666;
            }
            .summary-box {
              background-color: #f5f5f5;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            .summary-item label {
              font-weight: normal;
              color: #666;
            }
            .summary-item .value {
              font-weight: bold;
            }
            .day-plan {
              margin-bottom: 30px;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
            }
            .day-header {
              font-weight: bold;
              color: #22c55e;
              margin-bottom: 15px;
            }
            footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
            .logo {
              text-align: center;
              margin-bottom: 20px;
            }
            .profile {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin-bottom: 20px;
            }
            .profile-item {
              padding: 5px;
            }
            .profile-item label {
              color: #666;
              font-weight: normal;
            }
            .profile-item .value {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="logo">
            <h1>BildupX - Your Personalized Diet Plan</h1>
          </div>
          
          <div class="profile">
            <div class="profile-item">
              <label>Height:</label>
              <div class="value">${height} cm</div>
            </div>
            <div class="profile-item">
              <label>Weight:</label>
              <div class="value">${weight} kg</div>
            </div>
            <div class="profile-item">
              <label>Age:</label>
              <div class="value">${age} years</div>
            </div>
            <div class="profile-item">
              <label>Gender:</label>
              <div class="value">${gender}</div>
            </div>
            <div class="profile-item">
              <label>Goal:</label>
              <div class="value">${goal}</div>
            </div>
            <div class="profile-item">
              <label>Activity Level:</label>
              <div class="value">${activityLevel}</div>
            </div>
          </div>
      `;

      // Add plan content based on duration
      if (duration === 'day') {
        htmlContent += `
          <h2>Daily Diet Plan</h2>
          <p>Personalized for your ${goal} goal with ${preferences.replace('_', ' ')} preferences.</p>
        `;

        // Add each meal
        dietPlan.meals.forEach(meal => {
          htmlContent += `
            <div class="meal">
              <div class="meal-header">${meal.type}</div>
              <ul class="item-list">
                ${meal.items.map(item => `<li>${item.name} - ${item.portion}</li>`).join('')}
              </ul>
              <div class="nutrition-info">
                <span>Calories: ${meal.nutrition.calories} kcal</span>
                <span>Protein: ${meal.nutrition.protein}g</span>
                <span>Carbs: ${meal.nutrition.carbs}g</span>
                <span>Fat: ${meal.nutrition.fat}g</span>
              </div>
            </div>
          `;
        });

        // Add daily nutrition summary
        htmlContent += `
          <div class="summary-box">
            <h3>Daily Nutrition Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <label>Calories</label>
                <div class="value">${dietPlan.dailySummary.calories} kcal</div>
              </div>
              <div class="summary-item">
                <label>Protein</label>
                <div class="value">${dietPlan.dailySummary.protein}g</div>
              </div>
              <div class="summary-item">
                <label>Carbs</label>
                <div class="value">${dietPlan.dailySummary.carbs}g</div>
              </div>
              <div class="summary-item">
                <label>Fat</label>
                <div class="value">${dietPlan.dailySummary.fat}g</div>
              </div>
            </div>
          </div>
        `;
      } else {
        htmlContent += `
          <h2>Weekly Diet Plan</h2>
          <p>Personalized for your ${goal} goal with ${preferences.replace('_', ' ')} preferences.</p>
        `;

        // Add each day's plan
        dietPlan.weekPlan.forEach(day => {
          htmlContent += `
            <div class="day-plan">
              <div class="day-header">${day.day}</div>
              <div class="day-meals">
          `;

          // Add each meal for the day
          day.meals.forEach(meal => {
            htmlContent += `
              <div class="meal">
                <div class="meal-header">${meal.type}</div>
                <ul class="item-list">
                  ${meal.items.map(item => `<li>${item.name} - ${item.portion}</li>`).join('')}
                </ul>
              </div>
            `;
          });

          htmlContent += `
              </div>
            </div>
          `;
        });
      }

      // Add footer
      htmlContent += `
          <div>
            <p>
              This plan is designed based on your profile and targets. Adjust portions as needed based on hunger and activity level.
            </p>
          </div>
          
          <footer>
            <p>Generated on ${new Date().toLocaleDateString()} by BildupX Nutrition</p>
          </footer>
        </body>
        </html>
      `;

      // Write the HTML to the iframe
      const iframeDocument = iframe.contentWindow.document;
      iframeDocument.open();
      iframeDocument.write(htmlContent);
      iframeDocument.close();

      // Give it a moment to render, then print as PDF
      setTimeout(() => {
        iframe.contentWindow.print();
        
        // Remove the iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
          setLoading(false);
          onClose(true); // Close modal with success flag
        }, 500);
      }, 1000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(error.message || 'Failed to download PDF. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Personalized Diet Plan Generator</h2>
        <button
          onClick={() => onClose(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!dietPlan ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-2">Height</label>
              <div className="text-white">{height} cm</div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Weight</label>
              <div className="text-white">{weight} kg</div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Age</label>
              <div className="text-white">{age} years</div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Gender</label>
              <div className="text-white capitalize">{gender}</div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Goal</label>
              <div className="text-white capitalize">{goal}</div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Activity Level</label>
              <div className="text-white capitalize">{activityLevel}</div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-gray-400 mb-2">Diet Plan Duration</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setDuration('day')}
                className={`px-4 py-2 rounded-md ${
                  duration === 'day' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Single Day
              </button>
              <button
                onClick={() => setDuration('week')}
                className={`px-4 py-2 rounded-md ${
                  duration === 'week' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Full Week
              </button>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-gray-400 mb-2">Dietary Preferences</label>
            <select
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md px-4 py-2 outline-none"
            >
              <option value="no_preferences">No Special Preferences</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
              <option value="low_carb">Low Carb</option>
              <option value="high_protein">High Protein</option>
            </select>
          </div>

          {error && (
            <div className="mt-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleGenerateDietPlan}
              disabled={loading}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-md text-white font-medium flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Diet Plan'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-green-400">
              {duration === 'day' ? 'Daily Diet Plan' : 'Weekly Diet Plan'}
            </h3>
            <p className="text-gray-400 text-sm">
              Personalized for your {goal} goal
            </p>
          </div>

          {duration === 'day' ? (
            <div className="space-y-6">
              {dietPlan.meals.map((meal, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-green-400 mb-2">{meal.type}</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {meal.items.map((item, idx) => (
                      <li key={idx} className="text-gray-300">{item.name} - {item.portion}</li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-sm text-gray-400">
                    <span>Calories: {meal.nutrition.calories} kcal</span>
                    <span>P: {meal.nutrition.protein}g</span>
                    <span>C: {meal.nutrition.carbs}g</span>
                    <span>F: {meal.nutrition.fat}g</span>
                  </div>
                </div>
              ))}

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Daily Nutrition Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400">Calories</div>
                    <div className="text-white font-medium">
                      {dietPlan.dailySummary.calories} kcal
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Protein</div>
                    <div className="text-white font-medium">
                      {dietPlan.dailySummary.protein}g
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Carbs</div>
                    <div className="text-white font-medium">
                      {dietPlan.dailySummary.carbs}g
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Fat</div>
                    <div className="text-white font-medium">
                      {dietPlan.dailySummary.fat}g
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {dietPlan.weekPlan.map((day, dayIndex) => (
                <div key={dayIndex} className="border border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-green-400 mb-2">{day.day}</h4>
                  <div className="space-y-3">
                    {day.meals.map((meal, mealIndex) => (
                      <div key={mealIndex} className="ml-4">
                        <h5 className="text-white font-medium">{meal.type}</h5>
                        <ul className="list-disc list-inside text-gray-300 text-sm">
                          {meal.items.map((item, itemIndex) => (
                            <li key={itemIndex}>{item.name} - {item.portion}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 text-gray-400 text-sm">
            <p>
              This plan is designed based on your profile and targets. Adjust portions as needed based on hunger and activity level.
            </p>
          </div>

          {error && (
            <div className="mt-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setDietPlan(null)}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium"
            >
              Go Back
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-md text-white font-medium flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download as PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
