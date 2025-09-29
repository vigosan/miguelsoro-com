import { useEffect, useState, useMemo } from 'react';

interface PaintSplatter {
  id: string;
  type: 'blob' | 'drip' | 'splatter';
  path: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  delay: number;
  color: string;
}

export function PaintStrokes() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Generar mancha simple y natural
  const generateSimpleSplatter = (size: number) => {
    // Solo un círculo irregular con pequeñas variaciones
    const points = [];
    const numPoints = 6 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      // Variación más sutil para que se vea natural
      const radiusVariation = 0.7 + Math.random() * 0.6;
      const radius = size * radiusVariation;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      points.push(`${x},${y}`);
    }

    // Crear path suave
    let path = `M ${points[0]}`;
    for (let i = 1; i < points.length; i++) {
      const nextIndex = (i + 1) % points.length;
      const controlX = (parseFloat(points[i].split(',')[0]) + parseFloat(points[nextIndex].split(',')[0])) / 2;
      const controlY = (parseFloat(points[i].split(',')[1]) + parseFloat(points[nextIndex].split(',')[1])) / 2;
      path += ` Q ${points[i]} ${controlX},${controlY}`;
    }
    path += ` Q ${points[0]} ${points[0]} Z`;

    return path;
  };

  // Generar mancha tipo "gota derramada"
  const generateBlobSplatter = (size: number) => {
    // Forma más orgánica como una gota que se ha extendido
    const baseRadius = size;
    let path = '';

    // Crear forma base irregular
    const segments = [];
    const numSegments = 8;

    for (let i = 0; i < numSegments; i++) {
      const angle = (i / numSegments) * 2 * Math.PI;
      const radiusVar = 0.6 + Math.random() * 0.8; // Más variación
      const radius = baseRadius * radiusVar;

      // Añadir pequeñas "protuberancias" ocasionales
      const hasProtrusion = Math.random() < 0.3;
      const protrusionFactor = hasProtrusion ? 1.3 + Math.random() * 0.7 : 1;

      const x = Math.cos(angle) * radius * protrusionFactor;
      const y = Math.sin(angle) * radius * protrusionFactor;
      segments.push(`${x},${y}`);
    }

    path = `M ${segments[0]}`;
    for (let i = 1; i < segments.length; i++) {
      path += ` L ${segments[i]}`;
    }
    path += ` Z`;

    return path;
  };

  // Generar manchas simples y naturales
  const paintSplatters = useMemo(() => {
    const splatters: PaintSplatter[] = [];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

    // Manchas pequeñas y simples
    for (let i = 0; i < 5; i++) {
      const size = 4 + Math.random() * 6;
      splatters.push({
        id: `simple-${i}`,
        type: 'splatter',
        path: generateSimpleSplatter(size),
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 1,
        opacity: 0.03 + Math.random() * 0.04,
        delay: i * 800,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Manchas tipo "gota derramada"
    for (let i = 0; i < 3; i++) {
      const size = 6 + Math.random() * 8;
      splatters.push({
        id: `blob-${i}`,
        type: 'blob',
        path: generateBlobSplatter(size),
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 1,
        opacity: 0.02 + Math.random() * 0.03,
        delay: (i + 5) * 1000,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    return splatters;
  }, []);

  // Manejar scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setScrollY(scrolled);

      // Activar después de hacer scroll
      if (scrolled > 50) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) {
    return null;
  }

  // Calcular qué trazos deben estar visibles basado en scroll
  const maxScroll = 800;
  const scrollProgress = Math.min(scrollY / maxScroll, 1);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ mixBlendMode: 'multiply' }}
      >
        <defs>
          {/* Filtro para textura de pintura más realista */}
          <filter id="paint-texture" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              baseFrequency="0.8"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feDisplacementMap in="SourceGraphic" scale="0.4" />
            <feGaussianBlur stdDeviation="0.1" />
          </filter>

          {/* Filtro especial para salpicaduras */}
          <filter id="splatter-texture" x="-100%" y="-100%" width="300%" height="300%">
            <feTurbulence
              baseFrequency="1.2"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feDisplacementMap in="SourceGraphic" scale="0.6" />
          </filter>
        </defs>

        {paintSplatters.map((splatter, index) => {
          const shouldBeVisible = scrollProgress > (index / paintSplatters.length);
          const elementOpacity = shouldBeVisible
            ? splatter.opacity * Math.min((scrollProgress - (index / paintSplatters.length)) * 2, 1)
            : 0;

          return (
            <g key={splatter.id}>
              <path
                d={splatter.path}
                fill={splatter.color}
                opacity={elementOpacity}
                transform={`translate(${splatter.x}, ${splatter.y}) rotate(${splatter.rotation}) scale(${splatter.scale})`}
                filter={splatter.type === 'splatter' ? "url(#splatter-texture)" : "url(#paint-texture)"}
                className="transition-opacity duration-3000 ease-out"
                style={{
                  transitionDelay: `${splatter.delay}ms`,
                }}
              />

              {/* Sombra sutil para dar profundidad */}
              {splatter.type === 'blob' && (
                <path
                  d={splatter.path}
                  fill={splatter.color}
                  opacity={elementOpacity * 0.3}
                  transform={`translate(${splatter.x + 0.2}, ${splatter.y + 0.2}) rotate(${splatter.rotation}) scale(${splatter.scale * 1.1})`}
                  filter="url(#paint-texture)"
                  className="transition-opacity duration-3000 ease-out"
                  style={{
                    transitionDelay: `${splatter.delay + 200}ms`,
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}