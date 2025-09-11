import { useState, useEffect } from 'react'
import { Picture } from '@/domain/picture'

export type AdminPicture = Picture & {
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED'
  createdAt: string
  updatedAt: string
}

export function useAdminPictures() {
  const [pictures, setPictures] = useState<AdminPicture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPictures = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/pictures')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pictures')
      }
      
      setPictures(data.pictures)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createPicture = async (pictureData: Partial<AdminPicture>) => {
    try {
      const response = await fetch('/api/admin/pictures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pictureData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create picture')
      }
      
      await fetchPictures() // Refresh the list
      return data.picture
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const updatePicture = async (id: string, pictureData: Partial<AdminPicture>) => {
    try {
      const response = await fetch(`/api/admin/pictures/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pictureData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update picture')
      }
      
      await fetchPictures() // Refresh the list
      return data.picture
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const deletePicture = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/pictures/${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete picture')
      }
      
      await fetchPictures() // Refresh the list
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  useEffect(() => {
    fetchPictures()
  }, [])

  return {
    pictures,
    loading,
    error,
    fetchPictures,
    createPicture,
    updatePicture,
    deletePicture,
  }
}