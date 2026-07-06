import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  pictureTitle: string;
  picturePrice: number;
  orderId: string;
  paypalOrderId?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const {
    customerName,
    customerEmail,
    pictureTitle,
    picturePrice,
    orderId,
    paypalOrderId,
  } = data;

  const emailContent = `
    <h2>¡Gracias por tu compra!</h2>
    <p>Hola ${customerName},</p>
    <p>Tu pedido ha sido confirmado y procesado exitosamente.</p>

    <h3>Detalles del pedido:</h3>
    <ul>
      <li><strong>Número de pedido:</strong> ${orderId}</li>
      ${paypalOrderId ? `<li><strong>ID de PayPal:</strong> ${paypalOrderId}</li>` : ""}
      <li><strong>Obra:</strong> ${pictureTitle}</li>
      <li><strong>Precio:</strong> €${(picturePrice / 100).toFixed(2)}</li>
    </ul>

    <p>Te contactaremos pronto para coordinar la entrega de tu obra.</p>

    <p>¡Gracias por apoyar el arte de Miguel Soro!</p>

    <p>Saludos,<br>
    El equipo de Miguel Soro</p>
  `;

  await resend.emails.send({
    from: `Miguel Soro Art <${fromAddress}>`,
    to: customerEmail,
    subject: `Confirmación de pedido #${orderId}`,
    html: emailContent,
  });
}

const statusEmailContent = {
  PROCESSING: {
    subject: (orderId: string) => `Tu pedido #${orderId} está en marcha`,
    body: ({ customerName, pictureTitle, orderId }: OrderEmailData) => `
      <h2>¡Tu pedido está en marcha!</h2>
      <p>Hola ${customerName},</p>
      <p>Ya estamos preparando tu pedido para que llegue a tus manos lo antes posible.</p>

      <h3>Detalles del pedido:</h3>
      <ul>
        <li><strong>Número de pedido:</strong> ${orderId}</li>
        <li><strong>Obra:</strong> ${pictureTitle}</li>
      </ul>

      <p>Te avisaremos de nuevo cuando tu pedido haya sido enviado.</p>

      <p>Saludos,<br>
      El equipo de Miguel Soro</p>
    `,
  },
  SHIPPED: {
    subject: (orderId: string) => `Tu pedido #${orderId} ha sido enviado`,
    body: ({ customerName, pictureTitle, orderId }: OrderEmailData) => `
      <h2>¡Tu pedido está en camino!</h2>
      <p>Hola ${customerName},</p>
      <p>Tu pedido ha sido enviado y llegará pronto a la dirección indicada.</p>

      <h3>Detalles del pedido:</h3>
      <ul>
        <li><strong>Número de pedido:</strong> ${orderId}</li>
        <li><strong>Obra:</strong> ${pictureTitle}</li>
      </ul>

      <p>¡Gracias por apoyar el arte de Miguel Soro!</p>

      <p>Saludos,<br>
      El equipo de Miguel Soro</p>
    `,
  },
};

export type OrderStatusWithEmail = keyof typeof statusEmailContent;

export async function sendOrderStatusEmail(
  data: OrderEmailData,
  status: OrderStatusWithEmail,
) {
  const content = statusEmailContent[status];

  await resend.emails.send({
    from: `Miguel Soro Art <${fromAddress}>`,
    to: data.customerEmail,
    subject: content.subject(data.orderId),
    html: content.body(data),
  });
}

export async function sendAdminNotificationEmail(
  data: OrderEmailData,
  toEmail?: string,
) {
  const {
    customerName,
    customerEmail,
    pictureTitle,
    picturePrice,
    orderId,
    paypalOrderId,
  } = data;

  const emailContent = `
    <h2>Nuevo pedido recibido</h2>

    <h3>Detalles del pedido:</h3>
    <ul>
      <li><strong>Número de pedido:</strong> ${orderId}</li>
      ${paypalOrderId ? `<li><strong>ID de PayPal:</strong> ${paypalOrderId}</li>` : ""}
      <li><strong>Cliente:</strong> ${customerName}</li>
      <li><strong>Email:</strong> ${customerEmail}</li>
      <li><strong>Obra:</strong> ${pictureTitle}</li>
      <li><strong>Precio:</strong> €${(picturePrice / 100).toFixed(2)}</li>
    </ul>

    <p>Accede al panel de administración para gestionar este pedido.</p>
  `;

  const adminEmail = toEmail || process.env.ADMIN_EMAIL || fromAddress;

  await resend.emails.send({
    from: `Miguel Soro Web <${fromAddress}>`,
    to: adminEmail,
    subject: `Nuevo pedido #${orderId} - ${pictureTitle}`,
    html: emailContent,
  });
}
