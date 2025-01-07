import { OrderItemEntity } from './order-item.entity';

export class OrderEntity {
  id: number;
  customerId: number;
  addressId: number;
  status: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  orderItems?: OrderItemEntity[];
}
