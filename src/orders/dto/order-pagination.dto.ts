import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common';
import { OrderStatus } from 'generated/prisma';
import { OrderStatusList } from 'src/enum/order.enum';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `status must be one of the following values: ${Object.values(
      OrderStatusList,
    ).join(', ')}`,
  })
  status: OrderStatus;
}
