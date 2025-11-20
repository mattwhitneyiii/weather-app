# Email Notification Setup

This app sends email notifications to matt.whitney@gmail.com whenever someone uses the application.

## Setup Instructions

### Option 1: Gmail (Recommended for Quick Setup)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate an App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Weather App" as the name
   - Copy the generated 16-character password

3. **Add to .env.local**
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_APP_PASSWORD=your-16-character-app-password
   ```

### Option 2: SendGrid (Recommended for Production)

1. **Sign up for SendGrid** (free tier available)
   - Go to: https://sendgrid.com
   - Create an account and verify your email

2. **Create an API Key**
   - Go to Settings → API Keys
   - Create a new API key with "Mail Send" permissions
   - Copy the API key

3. **Update the API route** (`app/api/send-usage-email/route.ts`)
   - Replace nodemailer with SendGrid SDK
   - Or use SendGrid's SMTP settings with nodemailer

4. **Add to .env.local**
   ```
   SENDGRID_API_KEY=your-sendgrid-api-key
   EMAIL_USER=your-email@example.com
   ```

### Option 3: Resend (Modern Alternative)

1. **Sign up for Resend** (free tier available)
   - Go to: https://resend.com
   - Create an account

2. **Get API Key**
   - Go to API Keys section
   - Create a new API key

3. **Install Resend**
   ```bash
   npm install resend
   ```

4. **Update the API route** to use Resend instead of nodemailer

## Environment Variables

Add these to your `.env.local` file:

```
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

## Testing

After setting up, test by:
1. Loading the weather app
2. Checking matt.whitney@gmail.com for the notification email

## Troubleshooting

- **"Invalid login"**: Check that you're using an App Password, not your regular Gmail password
- **"Connection timeout"**: Check your firewall/network settings
- **No emails received**: Check spam folder, verify email addresses are correct

## Production Deployment

When deploying to Vercel/Netlify/etc:
1. Add the environment variables in your hosting platform's settings
2. Make sure `EMAIL_USER` and `EMAIL_APP_PASSWORD` are set
3. The API route will automatically use these in production

