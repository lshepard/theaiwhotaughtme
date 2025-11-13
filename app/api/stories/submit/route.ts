import { NextRequest, NextResponse } from 'next/server';
import { insertStory } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, school, grades, role, phone, aiUsage } = body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !school?.trim() || !aiUsage?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, school, and AI usage are required.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Validate phone format only if provided
    if (phone?.trim()) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        return NextResponse.json(
          { error: 'Please enter a valid phone number (10-15 digits).' },
          { status: 400 }
        );
      }
    }

    // Save to database (aiUsage maps to story field)
    const result = await insertStory({
      story: aiUsage.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || undefined,
      school: school.trim(),
      grades: grades?.trim() || undefined,
      role: role?.trim() || undefined,
    });

    if (!result.success) {
      console.error('Database error:', result.error);
      return NextResponse.json(
        { error: 'Failed to save your submission. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: 'Your story has been submitted successfully!',
    });
  } catch (error) {
    console.error('Error submitting story:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

