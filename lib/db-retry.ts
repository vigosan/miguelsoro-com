import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Check if it's a connection error that we should retry
      const shouldRetry = 
        error instanceof PrismaClientKnownRequestError &&
        (error.code === 'P1001' || // Can't reach database server
         error.code === 'P1008' || // Operations timed out
         error.code === 'P1017')   // Server has closed the connection

      if (!shouldRetry || attempt === maxRetries) {
        throw error
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(delay)}ms...`, error.message)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}