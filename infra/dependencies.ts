import { prisma } from '../lib/prisma'
import { PrismaOrderRepository, PrismaProductVariantRepository } from './PrismaOrderRepository'
import { 
  FindOrderById,
  GetAllOrders,
  FindOrderByIdForAdmin,
  UpdateOrderStatus,
  GetOrderStats,
  CreateOrder,
  CapturePayPalOrder,
  HandleWebhookOrderApproved,
  HandleWebhookPaymentCaptured,
  HandleWebhookPaymentDenied
} from '../application/orderUseCases'

// Repository instances
export const orderRepository = new PrismaOrderRepository(prisma)
export const productVariantRepository = new PrismaProductVariantRepository(prisma)

// Use case instances
export const findOrderById = new FindOrderById(orderRepository)
export const getAllOrders = new GetAllOrders(orderRepository)
export const findOrderByIdForAdmin = new FindOrderByIdForAdmin(orderRepository)
export const updateOrderStatus = new UpdateOrderStatus(orderRepository)
export const getOrderStats = new GetOrderStats(orderRepository)
export const createOrder = new CreateOrder(orderRepository, productVariantRepository)
export const capturePayPalOrder = new CapturePayPalOrder(orderRepository, productVariantRepository)
export const handleWebhookOrderApproved = new HandleWebhookOrderApproved(orderRepository)
export const handleWebhookPaymentCaptured = new HandleWebhookPaymentCaptured(orderRepository, productVariantRepository)
export const handleWebhookPaymentDenied = new HandleWebhookPaymentDenied(orderRepository)