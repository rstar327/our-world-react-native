import sgMail from '@sendgrid/mail';

// Set SendGrid API key if available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendVerificationEmail = async (email: string, code: string) => {
  // If no SendGrid API key, just log for demo purposes
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`Demo mode: Verification code for ${email} is: ${code}`);
    return;
  }

  const msg = {
    to: email,
    from: process.env.FROM_EMAIL || 'noreply@ourworld.com',
    subject: 'OurWorld - Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">Welcome to OurWorld!</h2>
        <p>Your verification code is:</p>
        <div style="background: #f8f9ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #8b5cf6; font-size: 32px; margin: 0; letter-spacing: 8px;">${code}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('SendGrid error:', error);
    throw new Error('Failed to send email');
  }
};