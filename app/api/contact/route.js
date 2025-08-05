import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Contact from '@/app/models/contact';

export async function POST(req) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await req.json();
    const { name, email, website, comment } = body;

    // Validate required fields
    if (!name || !email || !comment) {
      return NextResponse.json(
        { success: false, message: 'Name, email and message are required' },
        { status: 400 }
      );
    }

    // Create a new contact document
    const newContact = await Contact.create({
      name,
      email,
      website,
      comment
    });

    // Return success response
    return NextResponse.json(
      { success: true, message: 'Message sent successfully!', data: newContact },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message', error: error.message },
      { status: 500 }
    );
  }
}
