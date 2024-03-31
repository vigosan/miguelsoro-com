import { slugify } from "@/utils/slug";
import { Picture } from "@/domain/picture";

export const pictures: Picture[] = [
  {
    id: "1",
    title: "Eddy Merckx - Dominio en los 70",
    description:
      "Eddy Merckx es conocido por su dominio en la década de los 70. Es considerado uno de los mejores ciclistas de todos los tiempos.",
    price: 450000,
    size: "100x140",
    slug: slugify("Eddy Merckx - Dominio en los 70"),
    imgUrl: "https://picsum.photos/300/150",
  },
  {
    id: "2",
    title: "Lance Armstrong - 7 victorias anuladas",
    description:
      "Lance Armstrong tuvo su sueño de apogeo y caída, con la anulación de sus 7 victorias en el Tour de Francia por prácticas de dopaje.",
    price: 350000,
    size: "100x140",
    slug: slugify("Lance Armstrong - 7 victorias anuladas"),
    imgUrl: "https://picsum.photos/300/150",
  },
  {
    id: "3",
    title: "Bernard Hinault - Último francés en ganar el Tour",
    description:
      "Bernard Hinault se destaca por ser el último ciclista francés en ganar el Tour de Francia, manteniendo el título en 1985.",
    price: 550000,
    size: "100x140",
    slug: slugify("Bernard Hinault - Último francés en ganar el Tour"),
    imgUrl: "https://picsum.photos/300/150",
  },
  {
    id: "4",
    title: "Miguel Induraín - En el podio del Tour",
    description:
      "Miguel Induraín, uno de los mejores ciclistas de la España, se destacó por estar frecuentemente en el podio del Tour.",
    price: 650000,
    size: "100x140",
    slug: slugify("Miguel Induraín - En el podio del Tour"),
    imgUrl: "https://picsum.photos/300/150",
  },
  {
    id: "5",
    title: "Gino Bartali - El rey de las montañas",
    description:
      "Gino Bartali, apodado 'El rey de las montañas', fue un famoso ciclista italiano reconocido por sus habilidades en los tramos montañosos de las grandes carreras.",
    price: 700000,
    size: "100x140",
    slug: slugify("Gino Bartali - El rey de las montañas"),
    imgUrl: "https://picsum.photos/300/150",
  },
  {
    id: "6",
    title: "Fausto Coppi - Doble campeón del Tour y el Giro",
    description:
      "Fausto Coppi, ciclista italiano, se destaca por su doble logro: ser campeón del Tour de Francia y del Giro de Italia.",
    price: 390000,
    size: "100x140",
    slug: slugify("Fausto Coppi - Doble campeón del Tour y el Giro"),
    imgUrl: "https://picsum.photos/300/150",
  },
  {
    id: "7",
    title: "Greg LeMond - Primer americano en ganar el Tour",
    description:
      "Greg LeMond hizo historia al convertirse en el primer ciclista norteamericano en ganar el Tour de Francia.",
    price: 600000,
    size: "100x140",
    slug: slugify("Greg LeMond - Primer americano en ganar el Tour"),
    imgUrl: "https://picsum.photos/300/150",
  },
  {
    id: "8",
    title: "Alberto Contador - Campeón de las tres grandes vueltas",
    description:
      "Alberto Contador es un ex ciclista profesional español, y uno de los seis corredores que ha ganado las tres Grandes Vueltas por etapas (Tour, Giro, Vuelta).",
    price: 480000,
    size: "100x140",
    slug: slugify("Alberto Contador - Campeón de las tres grandes vueltas"),
    imgUrl: "https://picsum.photos/300/150",
  },
  {
    id: "9",
    title: "Chris Froome - Cuatro veces ganador del Tour",
    description:
      "Chris Froome, ciclista británico del equipo Ineos, es conocido por ganar el Tour de Francia en cuatro ocasiones.",
    price: 520000,
    size: "100x140",
    slug: slugify("Chris Froome - Cuatro veces ganador del Tour"),
    imgUrl: "https://picsum.photos/300/150",
  },
];
