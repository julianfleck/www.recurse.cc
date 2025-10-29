import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { SignupEmail } from '@/emails/SignupEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, projectDescription } = await request.json();

    // Validate required fields
    if (!(name && email && projectDescription)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email to yourself (notification)
    const { data, error } = await resend.emails.send({
      from: 'Recurse Signup <noreply@updates.recurse.cc>',
      to: ['mail@julianfleck.net'],
      subject: `New Beta Signup: ${name}`,
      react: SignupEmail({ name, email, projectDescription }),
    });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    await resend.emails.send({
      from: 'Recurse <noreply@updates.recurse.cc>',
      to: [email],
      subject: 'Thanks for joining the Recurse beta!',
      react: SignupEmail({
        name,
        email,
        projectDescription,
        isConfirmation: true,
      }),
    });

    return NextResponse.json(
      { message: 'Signup successful', data },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
