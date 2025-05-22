import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  // Codigo cuando solo habia ordenes sin detalle
  // @IsNumber()
  // @IsPositive()
  // totalAmount: number;
  // @IsNumber()
  // @IsPositive()
  // totalItems: number;
  // @IsEnum(OrderStatusList, {
  //   message: `status must be one of the following: ${OrderStatusList.join(', ')}`,
  // })
  // @IsOptional()
  // status: OrderStatus;
  // @IsBoolean()
  // @IsOptional()
  // paid: boolean = false;
  // Codigo cuando se agregaron los detalles de la orden
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true }) // Validate each item in the array
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
