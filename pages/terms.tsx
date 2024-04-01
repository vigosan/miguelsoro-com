import Link from "next/link";
import { Layout } from "@/components/Layout";

export default function TermsPage() {
  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <p>
          Cada obra de Miguel Soro es una interpretación original basada en
          escenas vibrantes del mundo del ciclismo. Aunque se inspira en hechos
          y momentos reales de las carreras, cada pintura se transforma a través
          de su visión y talento artístico, convirtiéndola en una pieza única.
        </p>
        <p>
          Nos enorgullece asegurar envíos cuidadosos y seguros para cada obra de
          arte comprada. Entendemos lo importante que es recibir estas piezas en
          perfecto estado, por lo que cada envío se maneja con el máximo cuidado
          y el embalaje adecuado para proteger la obra.
        </p>
        <p>
          Si no estás satisfecho con tu compra, de acuerdo con la normativa de
          protección de los consumidores en España, tendrás un plazo de 14 días
          naturales a partir de la recepción del producto para devolverlo y
          obtener un reembolso íntegro. Ten en cuenta que los costos de envío de
          la devolución serán responsabilidad del comprador y el producto debe
          retornar en las mismas condiciones en las que fue enviado.
        </p>
        <p>
          Si tienes alguna pregunta sobre nuestras políticas de envío y
          devoluciones, o si necesitas ayuda con tu compra, no dudes en{" "}
          <Link href="/contact" className="text-gray-900 underline">
            contactar
          </Link>{" "}
          con nosotros.
        </p>
      </div>
    </Layout>
  );
}
