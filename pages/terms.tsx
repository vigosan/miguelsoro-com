import Layout from "@/components/Layout";
import Link from "next/link";

export default function TermsPage() {
  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <p>
          Todas las obras de Miguel Soro son piezas únicas, y él detenta en
          exclusiva los derechos de autor. Cada pintura es el resultado de un
          verdadero esfuerzo de creatividad y pasión, y refleja la singular
          visión del propio Miguel.
        </p>
        <p>
          Nos enorgullece asegurar envíos cuidadosos y seguros para cada obra de
          arte comprada. Sabemos lo importante que es recibir estas piezas en
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
          <Link href="/contact" className="underline text-gray-900">
            contactar
          </Link>{" "}
          con nosotros.
        </p>
      </div>
    </Layout>
  );
}
