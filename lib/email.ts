import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  pictureTitle: string;
  picturePrice: number;
  orderId: string;
  paypalOrderId?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const { customerName, customerEmail, pictureTitle, picturePrice, orderId, paypalOrderId } = data;

  const emailContent = `
    <h2>¡Gracias por tu compra!</h2>
    <p>Hola ${customerName},</p>
    <p>Tu pedido ha sido confirmado y procesado exitosamente.</p>
    
    <h3>Detalles del pedido:</h3>
    <ul>
      <li><strong>Número de pedido:</strong> ${orderId}</li>
      ${paypalOrderId ? `<li><strong>ID de PayPal:</strong> ${paypalOrderId}</li>` : ''}
      <li><strong>Obra:</strong> ${pictureTitle}</li>
      <li><strong>Precio:</strong> €${(picturePrice / 100).toFixed(2)}</li>
    </ul>
    
    <p>Te contactaremos pronto para coordinar la entrega de tu obra.</p>
    
    <p>¡Gracias por apoyar el arte de Miguel Soro!</p>
    
    <p>Saludos,<br>
    El equipo de Miguel Soro</p>
  `;

  await transporter.sendMail({
    from: `"Miguel Soro Art" <${process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: `Confirmación de pedido #${orderId}`,
    html: emailContent,
  });
}

export async function sendAdminNotificationEmail(data: OrderEmailData) {
  const { customerName, customerEmail, pictureTitle, picturePrice, orderId, paypalOrderId } = data;

  const emailContent = `
    <h2>Nuevo pedido recibido</h2>
    
    <h3>Detalles del pedido:</h3>
    <ul>
      <li><strong>Número de pedido:</strong> ${orderId}</li>
      ${paypalOrderId ? `<li><strong>ID de PayPal:</strong> ${paypalOrderId}</li>` : ''}
      <li><strong>Cliente:</strong> ${customerName}</li>
      <li><strong>Email:</strong> ${customerEmail}</li>
      <li><strong>Obra:</strong> ${pictureTitle}</li>
      <li><strong>Precio:</strong> €${(picturePrice / 100).toFixed(2)}</li>
    </ul>
    
    <p>Accede al panel de administración para gestionar este pedido.</p>
  `;

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  
  await transporter.sendMail({
    from: `"Miguel Soro Web" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `Nuevo pedido #${orderId} - ${pictureTitle}`,
    html: emailContent,
  });
}