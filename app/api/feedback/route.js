import { connectToDB } from '@/app/lib/mongodb';
import Feedback from '@/app/models/feedback';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse request body
    const { name, email, subject, message, rating } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message || !rating) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDB();

    // Create and save feedback
    const newFeedback = new Feedback({
      name,
      email,
      subject,
      message,
      rating: parseInt(rating),
    });

    await newFeedback.save();

    // Return success response
    return NextResponse.json(
      { message: 'Feedback submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in feedback submission:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
}
