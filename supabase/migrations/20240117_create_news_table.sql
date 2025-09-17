-- Create news table
CREATE TABLE IF NOT EXISTS news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('premio', 'exposicion', 'entrevista', 'evento', 'video')),
    date DATE NOT NULL,
    location VARCHAR(255),
    external_url TEXT,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for slug lookups
CREATE INDEX idx_news_slug ON news(slug);

-- Create index for published news queries
CREATE INDEX idx_news_published ON news(published, date DESC);

-- Create index for date sorting
CREATE INDEX idx_news_date ON news(date DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_updated_at BEFORE UPDATE
    ON news FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial news data
INSERT INTO news (title, slug, description, type, date, location, external_url, published) VALUES
    ('Premio XXIII Certamen de Pintura de El Quite', 
     'premio-xxiii-certamen-pintura-el-quite',
     'La obra "Soy Leyenda" de Miguel Soro ha sido galardonada con el primer premio del XXIII Certamen de Pintura de El Quite. Un reconocimiento más a su trayectoria artística que combina la pasión por el ciclismo con una técnica pictórica única.',
     'premio',
     '2025-09-16',
     NULL,
     'https://nuevecuatrouno.com/2025/09/16/la-obra-soy-leyenda-se-hace-con-el-xxiii-certamen-de-pintura-de-el-quite/',
     true),
    
    ('L''Art del Ciclocross en Benidorm',
     'lart-del-ciclocross-benidorm',
     'Del 8 al 17 de enero de 2025, Miguel Soro expone en el Espai d''Art del Ayuntamiento de Benidorm con motivo de la Copa del Mundo de Ciclocross UCI-Benidorm Costa Blanca 2025. Una muestra que combina el arte y el deporte en una de las competiciones más importantes del calendario internacional.',
     'exposicion',
     '2025-01-08',
     'Benidorm, España',
     NULL,
     true),
    
    ('Exposición en Bagnères de Luchon - Tour de Francia',
     'exposicion-bagneres-luchon-tour-francia',
     'Durante las etapas pirenaicas del Tour de Francia 2024, Miguel Soro presentó una exposición en Bagnères de Luchon con obras que recorren "desde el ciclismo clásico más épico de los años 30, 40 ó 50, al actual", capturando la esencia histórica del ciclismo.',
     'exposicion',
     '2024-07-15',
     'Bagnères de Luchon, Francia',
     NULL,
     true),
    
    ('Exposición en Destilerías Nardini - Giro de Italia',
     'exposicion-destilerias-nardini-giro-italia',
     'Con motivo del Giro de Italia 2024, Miguel Soro inauguró una exposición en la prestigiosa sala de las Destilerías Nardini en Italia, combinando su pasión por el arte y el ciclismo en el contexto de una de las tres Grandes Vueltas.',
     'exposicion',
     '2024-05-10',
     'Italia',
     NULL,
     true),
    
    ('El Arte del Ciclismo en Canals',
     'el-arte-del-ciclismo-canals',
     'Miguel Soro inauguró su exposición "El Arte del Ciclismo" en la Casa de la Cultura Ca Don José en Canals, con motivo de la Volta Ciclista a la Comunitat Valenciana. Un lugar especial donde hace 10 años lanzó una de sus primeras exposiciones dedicadas al ciclismo.',
     'exposicion',
     '2024-01-20',
     'Canals, Valencia',
     NULL,
     true),
    
    ('Exposición en RTVE - Telediario 1',
     'exposicion-rtve-telediario-1',
     'Reportaje sobre la exposición de Miguel Soro que pone el acento español en el homenaje a los vencedores españoles del Tour de Francia.',
     'video',
     '2024-07-01',
     NULL,
     'https://www.rtve.es/play/videos/telediario-1/exposicion-miguel-soro-pone-acento-espanol-homenaje-pau-vencedores-espanoles-del-tour/5377156/',
     true);