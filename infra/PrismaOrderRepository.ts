import { PrismaClient } from '@prisma/client'
import { 
  OrderRepository, 
  OrderWithDetails, 
  OrderSummary, 
  OrderStats, 
  CreateOrderData,
  ProductVariantRepository,
  ProductVariant
} from './OrderRepository'

export class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<OrderWithDetails | null> {
    const result = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isPrimary: true },
                      take: 1
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
    return result as unknown as unknown as OrderWithDetails | null
  }

  async findAll(): Promise<OrderSummary[]> {
    const orders = await this.prisma.order.findMany({
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    productType: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to expected format
    return orders.map(order => ({
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalAmount: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        productTitle: item.variant.product.title,
        productType: item.variant.product.productType.displayName,
        quantity: item.quantity,
        unitPrice: item.price
      }))
    }))
  }

  async findByIdForAdmin(id: string): Promise<OrderWithDetails | null> {
    const result = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    productType: true
                  }
                }
              }
            }
          }
        }
      }
    })
    return result as unknown as unknown as OrderWithDetails | null
  }

  async updateStatus(id: string, status: string): Promise<OrderWithDetails> {
    const result = await this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    productType: true
                  }
                }
              }
            }
          }
        }
      }
    })
    return result as unknown as OrderWithDetails
  }

  async getStats(): Promise<OrderStats> {
    // Get total orders count
    const totalOrders = await this.prisma.order.count()

    // Get completed orders count
    const completedOrders = await this.prisma.order.count({
      where: {
        status: 'DELIVERED'
      }
    })

    // Get pending orders count
    const pendingOrders = await this.prisma.order.count({
      where: {
        status: {
          in: ['PENDING', 'PAID', 'SHIPPED']
        }
      }
    })

    // Get total revenue from delivered orders
    const revenueResult = await this.prisma.order.aggregate({
      where: {
        status: 'DELIVERED'
      },
      _sum: {
        total: true
      }
    })

    const totalRevenue = revenueResult._sum.total || 0

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      totalRevenue
    }
  }

  async create(data: CreateOrderData): Promise<OrderWithDetails> {
    const result = await this.prisma.order.create({
      data: {
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        paypalOrderId: data.paypalOrderId,
        status: data.status as any,
        subtotal: data.subtotal,
        tax: data.tax,
        shipping: data.shipping,
        total: data.total,
        items: {
          create: data.items
        }
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true
                  }
                }
              }
            }
          }
        }
      }
    })
    return result as unknown as OrderWithDetails
  }

  async updateByPayPalId(paypalOrderId: string, status: string): Promise<OrderWithDetails> {
    const result = await this.prisma.order.update({
      where: { paypalOrderId },
      data: { 
        status: status as any,
        updatedAt: new Date()
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isPrimary: true },
                      take: 1
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
    return result as unknown as OrderWithDetails
  }

  async updateManyByPayPalId(paypalOrderId: string, status: string): Promise<void> {
    await this.prisma.order.updateMany({
      where: { paypalOrderId },
      data: { 
        status: status as any,
        updatedAt: new Date()
      }
    })
  }
}

export class PrismaProductVariantRepository implements ProductVariantRepository {
  constructor(private prisma: PrismaClient) {}

  async findAvailableByIds(ids: string[]): Promise<ProductVariant[]> {
    const result = await this.prisma.productVariant.findMany({
      where: {
        id: { in: ids },
        status: 'AVAILABLE'
      },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      }
    })
    return result as unknown as ProductVariant[]
  }

  async decrementStock(id: string, quantity: number): Promise<void> {
    await this.prisma.productVariant.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity
        }
      }
    })
  }

  async markOutOfStockIfNeeded(id: string): Promise<void> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id }
    })

    if (variant && variant.stock <= 0) {
      await this.prisma.productVariant.update({
        where: { id },
        data: { status: 'OUT_OF_STOCK' as any }
      })
    }
  }
}