import { IsEnum, IsUUID } from 'class-validator';
import { OrderStatus } from 'generated/prisma';
import { OrderStatusList } from 'src/enum/order.enum';

export class ChangeOrderStatusDto {
  @IsUUID()
  id: string;

  @IsEnum(OrderStatusList, {
    message: `status must be one of the following values: ${Object.values(
      OrderStatusList,
    ).join(', ')}`,
  })
  status: OrderStatus;
}
