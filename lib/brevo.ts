// Shared Brevo (transactional email) helper.
// Used by both account auth OTPs (actions/auth.ts) and guest checkout
// email verification (actions/checkout-email.ts) so the integration and
// email template only live in one place.

export type SendOtpEmailResult = { success: true } | { success: false; error: string }

/**
 * Sends a 6-digit verification code to `email` via Brevo's transactional
 * email API. Falls back to a console log when BREVO_API_KEY is not set
 * (local/dev mode) so the flow still works without a real provider.
 */
export async function sendOtpEmail(
  email: string,
  otp: string,
  options?: { subject?: string; heading?: string; description?: string }
): Promise<SendOtpEmailResult> {
  const brevoApiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@panjatanayurveda.com'
  const senderName = process.env.BREVO_SENDER_NAME || 'Panjatan Ayurveda'

  const subject = options?.subject || 'Your Verification Code - Panjatan Ayurveda'
  const heading = options?.heading || 'Verification Code'
  const description =
    options?.description || 'Please enter the 6-digit OTP code below to continue.'

  if (!brevoApiKey) {
    console.log(`[DEV MODE OTP] Email: ${email}, OTP: ${otp}`)
    return { success: true }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email }],
        subject,
        htmlContent: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; border: 1px solid #E6DAC4; border-radius: 24px; background-color: #FBF7F0; text-align: center; box-shadow: 0 4px 20px rgba(33,29,25,0.025);">
            <!-- Logo Header -->
            <div style="margin-bottom: 24px;">
              <h1 style="color: #1E3B2E; font-size: 26px; font-weight: bold; letter-spacing: 2px; margin: 0; font-family: Georgia, serif;">PANJATAN AYURVEDA</h1>
            </div>

            <hr style="border: 0; border-top: 1px solid #E6DAC4; margin: 24px 0;" />

            <!-- Message Heading -->
            <h2 style="color: #211D19; font-size: 20px; font-weight: bold; margin-bottom: 8px;">${heading}</h2>
            <p style="color: #211D19; opacity: 0.8; font-size: 14px; line-height: 1.6; margin-top: 0; max-width: 380px; margin-left: auto; margin-right: auto;">
              ${description}
            </p>

            <!-- OTP Block -->
            <div style="margin: 32px 0;">
              <div style="display: inline-block; font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #1E3B2E; padding: 16px 32px; border: 1.5px solid #B9893F; border-radius: 16px; background-color: #F3EADC; text-shadow: 0 1px 0 #fff; box-shadow: inset 0 1px 3px rgba(0,0,0,0.02);">
                ${otp}
              </div>
            </div>

            <!-- Expiry notice -->
            <p style="color: #211D19; opacity: 0.6; font-size: 12px; line-height: 1.5; margin: 24px 0;">
              This verification code is valid for <strong style="color: #211D19;">10 minutes</strong>.<br />
              If you did not request this verification, please ignore this email.
            </p>

            <hr style="border: 0; border-top: 1px solid #E6DAC4; margin: 24px 0;" />

            <!-- Footer -->
            <p style="color: #B9893F; opacity: 0.7; font-size: 11px; margin: 0;">
              &copy; ${new Date().getFullYear()} Panjatan Ayurveda. All rights reserved.
            </p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Brevo API Error:', errText)
      return { success: false, error: 'Failed to send verification email.' }
    }

    return { success: true }
  } catch (e: any) {
    console.error('Email Send Error:', e)
    return { success: false, error: 'Failed to send verification email: ' + e.message }
  }
}
