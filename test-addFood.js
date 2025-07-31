// Test script for addFood API
// Run this with: node test-addFood.js (after adding node environment)

const testFoodItems = [
  "2 aloo paratha",
  "apple",
  "1 cup basmati rice", 
  "chicken tikka masala",
  "banana",
  "1 slice pizza"
];

async function testAddFoodAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing addFood API...\n');
  
  for (const foodString of testFoodItems) {
    try {
      console.log(`Testing: "${foodString}"`);
      
      const response = await fetch(`${baseUrl}/api/addFood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodString: foodString
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Success:', {
          food: data.data.food,
          calories: data.data.calories,
          protein: data.data.protein,
          carbs: data.data.carbs,
          fat: data.data.fat,
          fiber: data.data.fiber
        });
      } else {
        console.log('❌ Failed:', data.error);
      }
      
      console.log('---');
      
      // Wait 1 second between requests to be respectful to Gemini API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error testing "${foodString}":`, error.message);
    }
  }
}

// Export for manual testing
module.exports = { testAddFoodAPI };

// Uncomment to run directly:
// testAddFoodAPI();
