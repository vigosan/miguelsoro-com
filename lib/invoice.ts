import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";
import { OrderWithDetails } from "@/infra/OrderRepository";
import { formatInvoiceNumber } from "@/domain/order";
import { INVOICE_LOGO_PNG_BASE64 } from "@/lib/invoiceLogo";

export { formatInvoiceNumber };

export interface InvoiceSeller {
  name: string;
  nif: string;
  address: string;
}

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 56;
const GRAY = rgb(0.52, 0.52, 0.52);
const LIGHT_GRAY = rgb(0.93, 0.93, 0.93);
const RULE_GRAY = rgb(0.8, 0.8, 0.8);
const BLACK = rgb(0.12, 0.12, 0.12);

// WinAnsi (the encoding of the standard PDF fonts) has no narrow spaces,
// which Intl uses between amount and currency symbol in some ICU versions.
function pdfSafe(text: string): string {
  return text.replace(/[  ]/g, " ");
}

function money(amountInCents: number): string {
  return pdfSafe(
    (amountInCents / 100).toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
    }),
  );
}

function orderReference(orderId: string): string {
  return `#${orderId.slice(-8).toUpperCase()}`;
}

export async function generateInvoicePdf(params: {
  order: OrderWithDetails;
  seller: InvoiceSeller;
  invoiceNumber: number;
  invoicedAt: Date;
}): Promise<Buffer> {
  const { order, seller, invoiceNumber, invoicedAt } = params;
  const formattedNumber = formatInvoiceNumber(invoiceNumber);

  const doc = await PDFDocument.create();
  doc.setTitle(`Factura ${formattedNumber}`);
  const page = doc.addPage([A4.width, A4.height]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await doc.embedPng(Buffer.from(INVOICE_LOGO_PNG_BASE64, "base64"));

  const drawText = (
    text: string,
    x: number,
    y: number,
    options: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {},
  ) => {
    page.drawText(pdfSafe(text), {
      x,
      y,
      size: options.size ?? 10,
      font: options.font ?? font,
      color: options.color ?? BLACK,
    });
  };

  const drawRightAligned = (
    text: string,
    rightEdge: number,
    y: number,
    options: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {},
  ) => {
    const usedFont = options.font ?? font;
    const size = options.size ?? 10;
    const width = usedFont.widthOfTextAtSize(pdfSafe(text), size);
    drawText(text, rightEdge - width, y, options);
  };

  const drawRule = (y: number, color = RULE_GRAY, thickness = 0.75) => {
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: A4.width - MARGIN, y },
      thickness,
      color,
    });
  };

  let y = A4.height - MARGIN;

  const logoWidth = 130;
  const logoHeight = (logo.height / logo.width) * logoWidth;
  page.drawImage(logo, {
    x: MARGIN,
    y: y - logoHeight,
    width: logoWidth,
    height: logoHeight,
  });

  drawRightAligned("FACTURA", A4.width - MARGIN, y - 14, {
    font: bold,
    size: 20,
  });
  y -= logoHeight + 28;

  const metaCenter = 300;
  drawText("Nº de factura", MARGIN, y, { font: bold, size: 9, color: GRAY });
  drawText("Fecha", metaCenter, y, { font: bold, size: 9, color: GRAY });
  drawRightAligned("Pedido", A4.width - MARGIN, y, {
    font: bold,
    size: 9,
    color: GRAY,
  });
  y -= 14;
  drawText(formattedNumber, MARGIN, y, { font: bold });
  drawText(
    invoicedAt.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    metaCenter,
    y,
  );
  drawRightAligned(orderReference(order.id), A4.width - MARGIN, y);
  y -= 24;
  drawRule(y);
  y -= 28;

  drawText("Emisor", MARGIN, y, { font: bold, size: 9, color: GRAY });
  drawText("Facturar a", A4.width / 2 + 20, y, {
    font: bold,
    size: 9,
    color: GRAY,
  });
  y -= 16;

  const sellerLines = [seller.name, `NIF: ${seller.nif}`, ...seller.address.split("\n")];
  const customerLines = [
    order.customerName,
    ...(order.shippingAddress ? order.shippingAddress.split("\n") : []),
    order.customerEmail,
    ...(order.customerPhone ? [order.customerPhone] : []),
  ];
  const blockHeight = Math.max(sellerLines.length, customerLines.length) * 14;
  sellerLines.forEach((line, i) => drawText(line, MARGIN, y - i * 14));
  customerLines.forEach((line, i) => drawText(line, A4.width / 2 + 20, y - i * 14));
  y -= blockHeight + 44;

  const columns = {
    concept: MARGIN + 10,
    quantity: 390,
    price: 465,
    total: A4.width - MARGIN - 10,
  };
  page.drawRectangle({
    x: MARGIN,
    y: y - 7,
    width: A4.width - 2 * MARGIN,
    height: 22,
    color: LIGHT_GRAY,
  });
  drawText("Concepto", columns.concept, y, { font: bold, size: 9 });
  drawRightAligned("Cantidad", columns.quantity, y, { font: bold, size: 9 });
  drawRightAligned("Precio", columns.price, y, { font: bold, size: 9 });
  drawRightAligned("Total", columns.total, y, { font: bold, size: 9 });
  y -= 28;

  for (const item of order.items) {
    const productType = item.variant.product.productType?.displayName;
    const concept = productType
      ? `${item.variant.product.title} (${productType})`
      : item.variant.product.title;
    drawText(concept, columns.concept, y);
    drawRightAligned(String(item.quantity), columns.quantity, y);
    drawRightAligned(money(item.price), columns.price, y);
    drawRightAligned(money(item.total), columns.total, y);
    y -= 8;
    drawRule(y, LIGHT_GRAY, 0.5);
    y -= 16;
  }

  y -= 12;

  const ivaRate =
    order.subtotal > 0 && order.tax > 0
      ? ` (${Math.round((order.tax / order.subtotal) * 100)} %)`
      : "";
  const totalRows: Array<[string, string]> = [
    ["Base imponible", money(order.subtotal)],
    [`IVA${ivaRate}`, money(order.tax)],
    ...(order.shipping > 0
      ? ([["Envío", money(order.shipping)]] as Array<[string, string]>)
      : []),
  ];
  for (const [label, amount] of totalRows) {
    drawRightAligned(label, columns.price, y, { color: GRAY });
    drawRightAligned(amount, columns.total, y);
    y -= 18;
  }
  y -= 4;
  page.drawLine({
    start: { x: columns.price - 110, y: y + 12 },
    end: { x: A4.width - MARGIN, y: y + 12 },
    thickness: 0.75,
    color: BLACK,
  });
  drawRightAligned("TOTAL", columns.price, y - 4, { font: bold, size: 12 });
  drawRightAligned(money(order.total), columns.total, y - 4, {
    font: bold,
    size: 12,
  });

  const footer = pdfSafe(
    `${seller.name} · NIF ${seller.nif} · ${seller.address.split("\n").join(", ")}`,
  );
  const footerWidth = font.widthOfTextAtSize(footer, 8);
  drawText(footer, (A4.width - footerWidth) / 2, MARGIN - 10, {
    size: 8,
    color: GRAY,
  });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
