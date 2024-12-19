import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@UseGuards(AuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async list(@Req() req) {
    return await this.cartService.list(req.user.id);
  }

  @Post('items')
  async addItem(@Req() req, @Body() dto: CreateCartItemDto) {
    const cartItem = await this.cartService.addCartItem(req.user.id, dto);
    return {
      message: 'Product added',
      cartItem,
    };
  }

  @Patch('items/:id')
  async updateItem(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const cartItem = await this.cartService.updateCartItem(
      req.user.id,
      +id,
      dto,
    );
    return { message: 'Cart item updated successfully', cartItem };
  }

  @Delete('items/:id')
  async deleteItem(@Req() req, @Param('id') id: string) {
    await this.cartService.deleteCartItem(req.user.id, +id);
    return { message: 'Cart item removed successfully' };
  }

  @Get(':cartId/items')
  async listItems(@Req() req, @Param('cartId') cartId: string) {
    const items = await this.cartService.listCartItems(req.user.id, +cartId);
    return {
      items,
    };
  }
}
