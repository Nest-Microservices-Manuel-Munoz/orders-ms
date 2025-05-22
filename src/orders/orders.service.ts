import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from 'generated/prisma';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto, OrderPaginationDto } from './dto';
import { PRODUCT_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

export interface Products {
  id: number;
  name: string;
  price: number;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject(PRODUCT_SERVICE)
    private readonly productsClient: ClientProxy,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      // Validate products ids
      const productsIds = createOrderDto.items.map((item) => item.productId);
      const products = await firstValueFrom<Products[]>(
        this.productsClient.send({ cmd: 'validate_products' }, productsIds),
      );
      // calculate total cost of products in order
      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const item = products.find(
          (product) => product.id === orderItem.productId,
        );
        if (item) {
          return acc + item.price * orderItem.quantity;
        }
        return acc;
      }, 0);
      // calculate total items in order
      const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity;
      }, 0);

      // create order and order items
      const order = await this.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          OrderItems: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => {
                const product = products.find(
                  (product) => product.id === orderItem.productId,
                );
                return {
                  productId: orderItem.productId,
                  quantity: orderItem.quantity,
                  price: product?.price ?? 0,
                };
              }),
            },
          },
        },
        include: {
          OrderItems: {
            select: {
              productId: true,
              quantity: true,
              price: true,
            },
          },
        },
      });

      return {
        ...order,
        OrderItems: order.OrderItems.map((orderItem) => ({
          ...orderItem,
          name: products.find((product) => product.id === orderItem.productId)
            ?.name,
        })),
      };
    } catch (error: unknown) {
      const errorStatus =
        error instanceof Error && 'status' in error
          ? (error as { status: number }).status
          : HttpStatus.BAD_REQUEST;
      const errorMessage =
        error instanceof Error && 'message' in error
          ? error.message
          : 'Error creating order, check logs';
      this.logger.error(errorMessage, error);

      throw new RpcException({
        status: errorStatus,
        message: errorMessage,
      });
    }
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { page = 1, limit = 10 } = orderPaginationDto;

    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status,
      },
    });

    const skip = (page - 1) * limit;
    const take = limit;
    return {
      data: await this.order.findMany({
        skip,
        take,
        where: {
          status: orderPaginationDto.status,
        },
      }),
      meta: {
        total: totalPages,
        page,
        lastPage: Math.ceil(totalPages / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: { id },
      include: {
        OrderItems: {
          select: {
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order) {
      throw new RpcException({
        message: `Order with id: ${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Validate products ids
    const productsIds = order.OrderItems.map((orderItem) => orderItem.productId);
    const products = await firstValueFrom<Products[]>(
      this.productsClient.send({ cmd: 'validate_products' }, productsIds),
    );

    return {
      ...order,
      OrderItems: order.OrderItems.map((orderItem) => ({
        ...orderItem,
        name: products.find(
          (product) => product.id === orderItem.productId,
        )?.name,
      })),
    };
  }

  async changeOrderStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;

    const order = await this.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new RpcException({
        message: `Order with id: ${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (order.status === status) {
      return order;
    }

    return this.order.update({
      where: { id },
      data: { status },
    });
  }
}
