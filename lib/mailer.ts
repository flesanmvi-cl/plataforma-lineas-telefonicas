import nodemailer, { type Transporter } from "nodemailer";

/**
 * Envío de correos por SMTP (probado con Gmail + App Password). Las
 * credenciales viven en .env (SMTP_*, ver .env.example). Sin SMTP_HOST/USER/
 * PASSWORD configurados, sendEmail() no falla: solo loguea a consola y
 * devuelve false, para poder desarrollar sin credenciales reales.
 */

let cached: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cached) return cached;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return null;

  cached = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: false, // STARTTLS en el puerto 587
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return cached;
}

interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailArgs): Promise<boolean> {
  const transporter = getTransporter();
  const fromName = process.env.SMTP_FROM_NAME ?? "Nombre Plataforma · Grupo Flesan";
  const fromUser = process.env.SMTP_USER ?? "noreply@flesan.cl";
  const from = `"${fromName}" <${fromUser}>`;

  if (!transporter) {
    console.log("[mailer · sin SMTP configurado] →", to, "·", subject);
    return false;
  }

  try {
    await transporter.sendMail({
      from,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    });
    return true;
  } catch (err) {
    console.error("[mailer · error]", err);
    return false;
  }
}
