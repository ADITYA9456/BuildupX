import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Extract message from request body
    const { message } = await request.json();
    
    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Check if Gemini API key exists
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    try {
      // Call Gemini API
      console.log('Calling Gemini 2.0 API...');
      const aiResponse = await callGeminiAPI(message);
      return NextResponse.json({ response: aiResponse });
    } catch (error) {
      console.error('Gemini API error:', error);
      return NextResponse.json(
        { error: `Failed to get response: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process your message' },
      { status: 500 }
    );
  }
}

// Function to call Gemini API with the latest 2.0 model
async function callGeminiAPI(message) {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error details:', errorText);
    throw new Error(`Failed to get response from Gemini (${response.status})`);
  }

  const data = await response.json();
  
  // Extract the generated text from the response
  // Make sure we properly extract the text from Gemini 2.0 response format
  // The response structure might be slightly different from previous versions
  try {
    // First try the standard format
    if (data.candidates && data.candidates[0]?.content?.parts) {
      const textPart = data.candidates[0].content.parts.find(part => part.text);
      if (textPart) {
        return textPart.text;
      }
    }
    
    // Fallback to alternative formats if needed
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
           data.candidates?.[0]?.text ||
           'Sorry, I couldn\'t generate a response.';
  } catch (parseError) {
    console.error('Error parsing Gemini response:', parseError, 'Raw response:', data);
    return 'Sorry, there was an error processing the AI response.';
  }
}
