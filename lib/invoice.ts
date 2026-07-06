import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";
import { OrderWithDetails } from "@/infra/OrderRepository";
import { formatInvoiceNumber } from "@/domain/order";

export { formatInvoiceNumber };

export interface InvoiceSeller {
  name: string;
  nif: string;
  address: string;
}

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 50;
const GRAY = rgb(0.45, 0.45, 0.45);
const BLACK = rgb(0.1, 0.1, 0.1);

// WinAnsi (the encoding of the standard PDF fonts) has no narrow spaces,
// which Intl uses between amount and currency symbol in some ICU versions.
function pdfSafe(text: string): string {
  return text.replace(/[  ]/g, " ");
}

function money(amountInCents: number): string {
  return pdfSafe(
    (amountInCents / 100).toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
    }),
  );
}

export async function generateInvoicePdf(params: {
  order: OrderWithDetails;
  seller: InvoiceSeller;
  invoiceNumber: number;
  invoicedAt: Date;
}): Promise<Buffer> {
  const { order, seller, invoiceNumber, invoicedAt } = params;

  const doc = await PDFDocument.create();
  const page = doc.addPage([A4.width, A4.height]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

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

  let y = A4.height - MARGIN - 20;

  drawText("FACTURA", MARGIN, y, { font: bold, size: 22 });
  drawRightAligned(formatInvoiceNumber(invoiceNumber), A4.width - MARGIN, y, {
    font: bold,
    size: 14,
  });
  y -= 18;
  drawRightAligned(
    `Fecha: ${invoicedAt.toLocaleDateString("es-ES")}`,
    A4.width - MARGIN,
    y,
  );

  y -= 50;
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
  y -= blockHeight + 40;

  const columns = {
    concept: MARGIN,
    quantity: 380,
    price: 460,
    total: A4.width - MARGIN,
  };
  drawText("Concepto", columns.concept, y, { font: bold, size: 9, color: GRAY });
  drawRightAligned("Cantidad", columns.quantity, y, { font: bold, size: 9, color: GRAY });
  drawRightAligned("Precio", columns.price, y, { font: bold, size: 9, color: GRAY });
  drawRightAligned("Total", columns.total, y, { font: bold, size: 9, color: GRAY });
  y -= 6;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: A4.width - MARGIN, y },
    thickness: 0.5,
    color: GRAY,
  });
  y -= 16;

  for (const item of order.items) {
    const productType = item.variant.product.productType?.displayName;
    const concept = productType
      ? `${item.variant.product.title} (${productType})`
      : item.variant.product.title;
    drawText(concept, columns.concept, y);
    drawRightAligned(String(item.quantity), columns.quantity, y);
    drawRightAligned(money(item.price), columns.price, y);
    drawRightAligned(money(item.total), columns.total, y);
    y -= 18;
  }

  y -= 10;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: A4.width - MARGIN, y },
    thickness: 0.5,
    color: GRAY,
  });
  y -= 20;

  const ivaRate =
    order.subtotal > 0 && order.tax > 0
      ? ` (${Math.round((order.tax / order.subtotal) * 100)} %)`
      : "";
  const totals: Array<[string, string, PDFFont]> = [
    ["Base imponible", money(order.subtotal), font],
    [`IVA${ivaRate}`, money(order.tax), font],
    ...(order.shipping > 0
      ? ([["Envío", money(order.shipping), font]] as Array<[string, string, PDFFont]>)
      : []),
    ["TOTAL", money(order.total), bold],
  ];
  for (const [label, amount, rowFont] of totals) {
    drawRightAligned(label, columns.price, y, { font: rowFont });
    drawRightAligned(amount, columns.total, y, { font: rowFont });
    y -= 18;
  }

  drawText(`Pedido: ${order.id}`, MARGIN, MARGIN, { size: 8, color: GRAY });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
