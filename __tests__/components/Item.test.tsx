import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/renderWithProviders'
import { Item } from '@/components/Item'
import { Picture } from '@/domain/picture'

const mockPicture: Picture = {
  id: '1',
  title: 'Test Picture',
  description: 'A test picture description',
  price: 100000, // 1000 EUR in cents
  size: '120x90',
  slug: 'test-picture',
  imageUrl: '/pictures/1.webp',
  status: 'AVAILABLE',
  productTypeId: 'cuadros',
  productTypeName: 'Cuadros Originales',
  stock: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

describe('Item Component', () => {
  it('renders picture title and size', () => {
    render(<Item item={mockPicture} />)
    
    expect(screen.getByText('Test Picture')).toBeInTheDocument()
    expect(screen.getByText('120x90cm')).toBeInTheDocument()
  })

  it('shows available status when picture is available', () => {
    render(<Item item={mockPicture} />)
    
    expect(screen.getByText('Disponible')).toBeInTheDocument()
  })

  it('shows sold status when picture is sold', () => {
    const soldPicture = { ...mockPicture, status: 'SOLD' as const }
    render(<Item item={soldPicture} />)
    
    expect(screen.getByText('Vendido')).toBeInTheDocument()
  })

  it('renders image with correct alt text', () => {
    render(<Item item={mockPicture} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('alt', 
      'Test Picture - Arte ciclístico de Miguel Soro, obra original 120x90cm en acrílico y collage disponible para compra'
    )
  })

  it('has proper structured data attributes', () => {
    render(<Item item={mockPicture} />)
    
    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('itemScope')
    expect(article).toHaveAttribute('itemType', 'https://schema.org/VisualArtwork')
  })
})