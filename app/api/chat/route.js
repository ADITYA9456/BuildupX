import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get request body and handle different possible formats
    const body = await request.json();
    
    // Check for different possible message formats and normalize them
    let messages;
    
    if (body.messages && Array.isArray(body.messages)) {
      // Format: { messages: [...] }
      messages = body.messages;
    } else if (body.message) {
      // Format: { message: "Hello" }
      messages = [
        {
          role: 'user',
          content: body.message
        }
      ];
    } else if (typeof body === 'string') {
      // Format: "Hello"
      messages = [
        {
          role: 'user',
          content: body
        }
      ];
    } else {
      // No valid message format found
      return NextResponse.json(
        { error: 'Invalid message format. Please provide messages array or message string.' },
        { status: 400 }
      );
    }

    // Ensure messages is not empty
    if (!messages.length || !messages[0].content || messages[0].content.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    try {
      // Call OpenAI API
      console.log('Calling OpenAI API...');
      const aiResponse = await callOpenAIAPI(messages);
      
      return NextResponse.json({ 
        response: aiResponse,
        message: aiResponse, // For backward compatibility
      });
    } catch (error) {
      console.error('OpenAI API error:', error);
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

// Function to call OpenAI API with latest format
async function callOpenAIAPI(messages) {
  // If it's a single message, ensure it has the proper role
  if (messages.length === 1 && !messages[0].role) {
    messages[0].role = 'user';
  }

  // Ensure all messages have proper role and content structure
  const validatedMessages = messages.map(msg => {
    // Default to 'user' role if not specified
    const role = msg.role || 'user';
    // Extract content safely
    const content = typeof msg.content === 'string' ? msg.content : 
                   (typeof msg === 'string' ? msg : JSON.stringify(msg));
    
    return { role, content };
  });

  // Add system message if not present
  if (!validatedMessages.some(msg => msg.role === 'system')) {
    validatedMessages.unshift({
      role: 'system',
      content: 'You are a helpful assistant.'
    });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: validatedMessages,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    let errorMessage = `OpenAI API error (${response.status})`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch (e) {
      // If we can't parse JSON, use text instead
      const errorText = await response.text();
      errorMessage = errorText || errorMessage;
    }
    
    console.error('OpenAI API error details:', errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Extract the generated text from the response using the latest API format
  return data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
}
