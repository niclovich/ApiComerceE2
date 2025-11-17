const nodemailer = require('nodemailer');

// Configuration via env vars
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || (SMTP_USER || 'no-reply@example.com');

let transporter = null;
let usingEthereal = false;

const hasSmtpConfig = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);

if (hasSmtpConfig) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE || SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
} else {
  // no SMTP configured — will fallback to Ethereal at send time, but provide a console-logger as temporary
  transporter = {
    sendMail: async (opts) => {
      console.log('No SMTP configured — email would be sent with payload:');
      console.log(JSON.stringify(opts, null, 2));
      return { accepted: [opts.to], messageId: 'console-log' };
    },
  };
}

function formatCurrency(v) {
  try { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v); } catch(e) { return String(v); }
}

function buildOrderHtml(order) {
  const itemsRows = (order.items || []).map(it => `
    <tr>
      <td style="padding:6px;border:1px solid #eee">${escapeHtml(it.title)}</td>
      <td style="padding:6px;border:1px solid #eee;text-align:center">${it.quantity}</td>
      <td style="padding:6px;border:1px solid #eee;text-align:right">${formatCurrency(it.unitPrice)}</td>
      <td style="padding:6px;border:1px solid #eee;text-align:right">${formatCurrency(it.subtotal)}</td>
    </tr>`).join('');

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.4;color:#222">
      <h2>Confirmación de compra — Orden ${escapeHtml(order.code || String(order._id || ''))}</h2>
      <p>Fecha: ${new Date(order.purchase_datetime).toLocaleString()}</p>
      <p>Comprador: ${escapeHtml(order.purchaser)}</p>
      <table style="border-collapse:collapse;width:100%;margin-top:10px">
        <thead>
          <tr>
            <th style="padding:6px;border:1px solid #eee;text-align:left">Producto</th>
            <th style="padding:6px;border:1px solid #eee">Cantidad</th>
            <th style="padding:6px;border:1px solid #eee;text-align:right">P.Unitario</th>
            <th style="padding:6px;border:1px solid #eee;text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:6px;border:1px solid #eee;text-align:right"><strong>Total</strong></td>
            <td style="padding:6px;border:1px solid #eee;text-align:right"><strong>${formatCurrency(order.amount || 0)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

function escapeHtml(str){
  if (!str) return '';
  return String(str).replace(/[&<>"]+/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]||s));
}

async function sendOrderConfirmation(order) {
  const to = order.purchaser || ''; // purchaser is email
  const subject = `Confirmación de compra — Orden ${order.code || (order._id || '')}`;
  const html = buildOrderHtml(order);

  const mailOpts = {
    from: FROM_EMAIL,
    to,
    subject,
    html,
    text: `Orden ${order.code || (order._id || '')} — Total: ${formatCurrency(order.amount || 0)}`,
  };

  // Try to send using configured transporter. If it fails and no real SMTP was configured,
  // try to create an Ethereal test account and resend so developer can preview the message.
  try {
    console.log('Mailer: attempting to send email to', to, 'using', hasSmtpConfig ? 'configured SMTP' : 'console-fallback');
    const info = await transporter.sendMail(mailOpts);
    try {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log('Ethereal preview URL:', preview);
    } catch (e) { /* ignore */ }
    console.log('Mailer: send result messageId=', info && info.messageId);
    return info;
  } catch (err) {
    console.error('Mailer: initial send failed:', err && err.message ? err.message : err);

    if (hasSmtpConfig) throw err;

    // Otherwise try Ethereal test account so developer can preview the mail
    try {
      console.log('Mailer: creating Ethereal test account for preview...');
      const testAcct = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAcct.user, pass: testAcct.pass },
      });
      usingEthereal = true;
      const info2 = await transporter.sendMail(mailOpts);
      const preview2 = nodemailer.getTestMessageUrl(info2);
      console.log('Mailer: Ethereal message preview URL:', preview2);
      return info2;
    } catch (e2) {
      console.error('Mailer: Ethereal send also failed:', e2 && e2.message ? e2.message : e2);
      throw e2;
    }
  }
}

module.exports = { sendOrderConfirmation };

// Envío de correo para restablecimiento de contraseña
async function sendPasswordReset(user, token) {
  const to = user.email;
  const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
  const resetUrl = `${appUrl}/reset/${token}`;
  const subject = 'Restablecer contraseña';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222">
      <h3>Restablecer contraseña</h3>
      <p>Hola ${escapeHtml(user.first_name || user.email)},</p>
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón a continuación para establecer una nueva contraseña. El enlace expirará en 1 hora.</p>
      <p style="text-align:center;margin:20px 0"><a href="${resetUrl}" style="display:inline-block;padding:10px 18px;background:#0d6efd;color:white;border-radius:6px;text-decoration:none">Restablecer contraseña</a></p>
      <p>Si no solicitaste esto, puedes ignorar este correo.</p>
      <p>Saludos,<br/>Equipo</p>
    </div>
  `;

  const mailOpts = { from: FROM_EMAIL, to, subject, html, text: `Restablece tu contraseña: ${resetUrl}` };

  try {
    console.log('Mailer: sending password reset to', to);
    const info = await (async () => {
      try { return await transporter.sendMail(mailOpts); } catch(e){ throw e; }
    })();
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Mailer: preview URL:', preview);
    return info;
  } catch (err) {
    console.error('Mailer: password reset send failed:', err && err.message ? err.message : err);
    // If no SMTP configured try Ethereal as fallback
    if (!hasSmtpConfig) {
      try {
        const testAcct = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, secure: false, auth: { user: testAcct.user, pass: testAcct.pass } });
        const info2 = await transporter.sendMail(mailOpts);
        console.log('Mailer: Ethereal preview URL:', nodemailer.getTestMessageUrl(info2));
        return info2;
      } catch(e2) {
        console.error('Mailer: Ethereal fallback failed:', e2 && e2.message ? e2.message : e2);
        throw e2;
      }
    }
    throw err;
  }
}

module.exports = { sendOrderConfirmation, sendPasswordReset };
