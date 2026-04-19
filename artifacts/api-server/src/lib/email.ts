import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY || "re_dVwLnMk7_JVwnTSMcsCmyt39YvWbUQBu7",
);

const FROM_EMAIL = "HumanProof <onboarding@resend.dev>";

export interface WaitlistWelcomeEmail {
  email: string;
  planTier: string;
}

export async function sendWaitlistWelcome({
  email,
  planTier,
}: WaitlistWelcomeEmail) {
  const tierDisplay =
    planTier === "pro" ? "Pro" : planTier === "team" ? "Team" : "Enterprise";

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `You're on the list! Welcome to HumanProof ${tierDisplay}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background: #12121a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="display: inline-block; padding: 8px 16px; background: rgba(0, 212, 224, 0.1); border: 1px solid rgba(0, 212, 224, 0.3); border-radius: 20px; margin-bottom: 20px;">
                <span style="color: #00d4e0; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">You're In</span>
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.03em;">Welcome to HumanProof</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                Your spot has been reserved for the <strong style="color: #ffffff;">${tierDisplay}</strong> plan. We'll notify you as soon as access opens.
              </p>
              
              <div style="background: #1a1a24; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: left;">
                <p style="margin: 0 0 12px; font-size: 14px; color: #71717a;">WHAT'S COMING</p>
                <ul style="margin: 0; padding: 0 0 0 20px; font-size: 14px; line-height: 1.8; color: #d4d4d8;">
                  <li>Unlimited AI-powered career audits</li>
                  <li>High-fidelity PDF reports</li>
                  <li>12+ resilience blueprints</li>
                  <li>Quarterly risk drift alerts</li>
                </ul>
              </div>
              
              <p style="margin: 0; font-size: 13px; color: #52525b;">
                Questions? Reply to this email — we're here to help.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center; border-top: 1px solid #27272a;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #52525b;">
                HumanProof — AI Career Resilience Platform
              </p>
              <p style="margin: 0; font-size: 11px; color: #3f3f46;">
                <a href="https://humanproof.ai" style="color: #00d4e0; text-decoration: none;">humanproof.ai</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  if (error) {
    console.error("[email] Resend error:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function sendOnboardingEmail({
  email,
  name,
}: {
  email: string;
  name?: string;
}) {
  const displayName = name || "there";

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Your HumanProof Journey Starts Now",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background: #12121a; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.03em;">Hi ${displayName}!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                Welcome to HumanProof! Your first AI-powered career audit is ready.
              </p>
              <a href="https://humanproof.ai/calculator" style="display: inline-block; padding: 14px 28px; background: #00d4e0; color: #0a0a0f; font-weight: 600; border-radius: 8px; text-decoration: none; font-size: 14px;">
                Start Your Audit →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  if (error) {
    console.error("[email] Resend error:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function sendScoreDriftAlert({
  email,
  company,
  oldScore,
  newScore,
  riskLevel,
}: {
  email: string;
  company: string;
  oldScore: number;
  newScore: number;
  riskLevel: string;
}) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `⚠️ Risk Alert: ${company} - Score Changed`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #0a0a0f; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background: #12121a; border-radius: 16px;">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="display: inline-block; padding: 6px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 20px;">
                <span style="color: #ef4444; font-size: 11px; font-weight: 600;">RISK ALERT</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 900;">${company}</h1>
              <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
                <div style="text-align: center;">
                  <div style="font-size: 28px; font-weight: 800; color: #71717a;">${oldScore}</div>
                  <div style="font-size: 12px; color: #52525b;">Previous</div>
                </div>
                <div style="font-size: 20px; color: #52525b;">→</div>
                <div style="text-align: center;">
                  <div style="font-size: 28px; font-weight: 800; color: ${newScore < oldScore ? "#ef4444" : "#22c55e"};">${newScore}</div>
                  <div style="font-size: 12px; color: #52525b;">Current</div>
                </div>
              </div>
              <p style="margin: 0; font-size: 14px; color: #a1a1aa;">
                Risk level: <strong style="color: ${riskLevel === "high" ? "#ef4444" : riskLevel === "medium" ? "#f59e0b" : "#22c55e"}">${riskLevel.toUpperCase()}</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  if (error) {
    console.error("[email] Resend error:", error);
    return { success: false, error };
  }

  return { success: true, data };
}
