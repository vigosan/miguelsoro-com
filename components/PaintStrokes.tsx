import { useEffect, useState, useMemo } from 'react';

interface PaintElement {
  id: string;
  type: 'circle' | 'rect' | 'line';
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

  // Generar elementos artísticos simples pero efectivos
  const paintElements = useMemo(() => {
    const elements: PaintElement[] = [];
    const colors = ['#1a202c', '#2d3748', '#4a5568', '#718096'];

    // Círculos grandes (ruedas sutiles)
    for (let i = 0; i < 3; i++) {
      elements.push({
        id: `wheel-${i}`,
        type: 'circle',
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: 0,
        scale: 30 + Math.random() * 50, // Grandes
        opacity: 0.015 + Math.random() * 0.02, // Muy sutiles
        delay: i * 1000,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Rectángulos (elementos geométricos)
    for (let i = 0; i < 4; i++) {
      elements.push({
        id: `rect-${i}`,
        type: 'rect',
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: -45 + Math.random() * 90,
        scale: 15 + Math.random() * 25,
        opacity: 0.01 + Math.random() * 0.02,
        delay: (i + 3) * 800,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Líneas (trazos de pincel)
    for (let i = 0; i < 6; i++) {
      elements.push({
        id: `line-${i}`,
        type: 'line',
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: -30 + Math.random() * 60,
        scale: 20 + Math.random() * 40,
        opacity: 0.02 + Math.random() * 0.03,
        delay: (i + 7) * 600,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    return elements;
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
          {/* Filtro suave para textura */}
          <filter id="paint-texture" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              baseFrequency="0.3"
              numOctaves="1"
              stitchTiles="stitch"
            />
            <feDisplacementMap in="SourceGraphic" scale="0.2" />
          </filter>
        </defs>

        {paintElements.map((element, index) => {
          const shouldBeVisible = scrollProgress > (index / paintElements.length);
          const elementOpacity = shouldBeVisible
            ? element.opacity * Math.min((scrollProgress - (index / paintElements.length)) * 3, 1)
            : 0;

          if (element.type === 'circle') {
            return (
              <circle
                key={element.id}
                cx={element.x}
                cy={element.y}
                r={element.scale / 2}
                fill={element.color}
                opacity={elementOpacity}
                filter="url(#paint-texture)"
                className="transition-opacity duration-2000 ease-out"
                style={{
                  transitionDelay: `${element.delay}ms`,
                }}
              />
            );
          }

          if (element.type === 'rect') {
            return (
              <rect
                key={element.id}
                x={element.x - element.scale / 2}
                y={element.y - element.scale / 4}
                width={element.scale}
                height={element.scale / 2}
                fill={element.color}
                opacity={elementOpacity}
                transform={`rotate(${element.rotation} ${element.x} ${element.y})`}
                filter="url(#paint-texture)"
                className="transition-opacity duration-2000 ease-out"
                style={{
                  transitionDelay: `${element.delay}ms`,
                }}
              />
            );
          }

          if (element.type === 'line') {
            const x2 = element.x + Math.cos(element.rotation * Math.PI / 180) * element.scale;
            const y2 = element.y + Math.sin(element.rotation * Math.PI / 180) * element.scale;

            return (
              <line
                key={element.id}
                x1={element.x}
                y1={element.y}
                x2={x2}
                y2={y2}
                stroke={element.color}
                strokeWidth="0.5"
                opacity={elementOpacity}
                strokeLinecap="round"
                filter="url(#paint-texture)"
                className="transition-opacity duration-2000 ease-out"
                style={{
                  transitionDelay: `${element.delay}ms`,
                }}
              />
            );
          }

          return null;
        })}
      </svg>
    </div>
  );
}