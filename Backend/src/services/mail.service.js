import { Resend } from "resend";
import { config } from "../config/config.js";

const resend = new Resend(config.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // change after domain verify
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", data);
    return data;
  } catch (error) {
    console.error("❌ Email error:", error);
    throw error;
  }
};
