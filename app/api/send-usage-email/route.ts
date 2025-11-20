import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, temperature, unit } = body;

    // Get user's IP address (handles various proxy scenarios)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
    const ip = 
      cfConnectingIp || 
      (forwarded ? forwarded.split(',')[0].trim() : null) || 
      realIp || 
      'Unknown';

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password
      },
    });

    // Email content
    const subject = 'Weather app has been used';
    const htmlBody = `
      <h2>Weather App Usage Notification</h2>
      <p><strong>IP Address:</strong> ${ip}</p>
      <p><strong>Location:</strong> ${location.name}, ${location.country}</p>
      <p><strong>Current Temperature:</strong> ${temperature}${unit === 'celsius' ? '°C' : '°F'}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    `;

    const textBody = `
Weather App Usage Notification

IP Address: ${ip}
Location: ${location.name}, ${location.country}
Current Temperature: ${temperature}${unit === 'celsius' ? '°C' : '°F'}
Timestamp: ${new Date().toLocaleString()}
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'matt.whitney@gmail.com',
      subject: subject,
      text: textBody,
      html: htmlBody,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

