import { useEffect, useState, useMemo } from "react";

interface ElegantBlob {
  id: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  delay: number;
  grayLevel: number;
  rotation: number;
  path: string;
  type: "connector" | "accent" | "background";
}

const GRAY_LEVELS = [
  "rgba(0, 0, 0, 0.02)",
  "rgba(0, 0, 0, 0.03)",
  "rgba(0, 0, 0, 0.04)",
  "rgba(0, 0, 0, 0.05)",
  "rgba(0, 0, 0, 0.06)",
  "rgba(255, 255, 255, 0.02)",
  "rgba(255, 255, 255, 0.03)",
];

export function PaintStrokes() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Generar formas blob suaves y redondeadas
  const generateSmoothBlob = (seed: number): string => {
    // Usar seed para que los blobs sean consistentes/estáticos
    const random = (n: number) => {
      const x = Math.sin(seed * n) * 10000;
      return x - Math.floor(x);
    };

    const numPoints = 8; // Menos puntos para formas más suaves
    const points: Array<{
      x: number;
      y: number;
      cp1x: number;
      cp1y: number;
      cp2x: number;
      cp2y: number;
    }> = [];

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const radiusVar = 0.7 + random(i) * 0.3; // Menos variación
      const radius = 45 * radiusVar;

      // Variaciones más suaves
      const wiggle = (random(i + 10) - 0.5) * 8;
      const x = 50 + Math.cos(angle) * (radius + wiggle);
      const y = 50 + Math.sin(angle) * (radius + wiggle);

      // Puntos de control para curvas Bézier suaves
      const prevAngle =
        (((i - 1 + numPoints) % numPoints) / numPoints) * 2 * Math.PI;
      const nextAngle = (((i + 1) % numPoints) / numPoints) * 2 * Math.PI;

      const controlDistance = radius * 0.4;
      const cp1x =
        x +
        Math.cos(prevAngle + Math.PI / 2) * controlDistance * random(i + 20);
      const cp1y =
        y +
        Math.sin(prevAngle + Math.PI / 2) * controlDistance * random(i + 30);
      const cp2x =
        x +
        Math.cos(nextAngle - Math.PI / 2) * controlDistance * random(i + 40);
      const cp2y =
        y +
        Math.sin(nextAngle - Math.PI / 2) * controlDistance * random(i + 50);

      points.push({ x, y, cp1x, cp1y, cp2x, cp2y });
    }

    // Crear path con curvas Bézier cúbicas para máxima suavidad
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < numPoints; i++) {
      const current = points[i];
      const next = points[(i + 1) % numPoints];

      path += ` C ${current.cp2x} ${current.cp2y} ${next.cp1x} ${next.cp1y} ${next.x} ${next.y}`;
    }

    path += " Z";
    return path;
  };

  // Generar blobs elegantes estáticos
  const elegantBlobs = useMemo(() => {
    const blobs: ElegantBlob[] = [];

    // Posiciones fijas para blobs de fondo
    const backgroundPositions = [
      { x: 15, y: 25, scale: 2.5, rotation: 15 },
      { x: 75, y: 55, scale: 3.2, rotation: 45 },
      { x: 35, y: 80, scale: 2.8, rotation: 120 },
    ];

    backgroundPositions.forEach((pos, i) => {
      blobs.push({
        id: `background-${i}`,
        x: pos.x,
        y: pos.y,
        scale: pos.scale,
        opacity: 1,
        delay: i * 1500,
        grayLevel: i % 3, // Usar los primeros 3 grises
        rotation: pos.rotation,
        path: generateSmoothBlob(100 + i), // Seed fijo
        type: "background",
      });
    });

    // Posiciones fijas para conectores
    const connectorPositions = [
      { x: 85, y: 15, scale: 1.2, rotation: 30 },
      { x: 10, y: 45, scale: 1.5, rotation: 75 },
      { x: 90, y: 75, scale: 1.3, rotation: 160 },
      { x: 5, y: 85, scale: 1.1, rotation: 200 },
    ];

    connectorPositions.forEach((pos, i) => {
      blobs.push({
        id: `connector-${i}`,
        x: pos.x,
        y: pos.y,
        scale: pos.scale,
        opacity: 1,
        delay: 800 + i * 1200,
        grayLevel: (i + 3) % GRAY_LEVELS.length,
        rotation: pos.rotation,
        path: generateSmoothBlob(200 + i), // Seed fijo
        type: "connector",
      });
    });

    // Posiciones fijas para acentos
    const accentPositions = [
      { x: 25, y: 10, scale: 0.6, rotation: 0 },
      { x: 65, y: 30, scale: 0.8, rotation: 90 },
      { x: 20, y: 60, scale: 0.5, rotation: 180 },
      { x: 80, y: 40, scale: 0.7, rotation: 270 },
      { x: 50, y: 95, scale: 0.6, rotation: 45 },
    ];

    accentPositions.forEach((pos, i) => {
      blobs.push({
        id: `accent-${i}`,
        x: pos.x,
        y: pos.y,
        scale: pos.scale,
        opacity: 1,
        delay: 400 + i * 600,
        grayLevel: (i + 5) % GRAY_LEVELS.length,
        rotation: pos.rotation,
        path: generateSmoothBlob(300 + i), // Seed fijo
        type: "accent",
      });
    });

    return blobs;
  }, []);

  // Manejar scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setScrollY(scrolled);

      // Activar inmediatamente
      setIsVisible(true);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calcular progreso de scroll para animaciones
  const maxScroll = 1200;
  const scrollProgress = Math.min(scrollY / maxScroll, 1);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ mixBlendMode: "normal" }}
      >
        <defs>
          {/* Filtro para suavizar bordes */}
          <filter id="blur-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
        </defs>

        {elegantBlobs.map((blob, index) => {
          // Calcular visibilidad basada en tipo y scroll
          let visibilityFactor = 1;
          if (blob.type === "background") {
            visibilityFactor = Math.min(scrollProgress * 1.5, 1);
          } else if (blob.type === "connector") {
            const sectionProgress = (scrollProgress - 0.3) * 2;
            visibilityFactor = Math.max(0, Math.min(sectionProgress, 1));
          } else {
            const accentProgress = (scrollProgress - 0.6) * 2.5;
            visibilityFactor = Math.max(0, Math.min(accentProgress, 1));
          }

          const finalOpacity = blob.opacity * visibilityFactor;

          return (
            <g key={blob.id}>
              <path
                d={blob.path}
                fill={GRAY_LEVELS[blob.grayLevel]}
                opacity={finalOpacity}
                filter="url(#blur-filter)"
                transform={`translate(${blob.x}, ${blob.y}) scale(${blob.scale}) rotate(${blob.rotation})`}
                className="transition-opacity duration-3000 ease-out"
                style={{
                  transitionDelay: `${blob.delay}ms`,
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
