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
  UnauthorizedException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { I18nService } from 'nestjs-i18n';
import { SessionType } from '@prisma/client';
@UseGuards(AuthGuard)
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  async list(@Req() req) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException('Only customers can access their cart');
    }
    return await this.cartService.list(req.session.customerId);
  }

  @Post('items')
  async addItem(@Req() req, @Body() dto: CreateCartItemDto) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException('Only customers can modify their cart');
    }
    const cartItem = await this.cartService.addCartItem(
      req.session.customerId,
      dto,
    );
    const message = await this.i18n.translate('test.CART_ITEM_ADDED');
    return {
      message: message,
      cartItem,
    };
  }

  @Patch('items/:id')
  async updateItem(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException('Only customers can modify their cart');
    }
    const cartItem = await this.cartService.updateCartItem(
      req.session.customerId,
      +id,
      dto,
    );
    const message = await this.i18n.translate('test.CART_ITEM_UPDATED');
    return { message: message, cartItem };
  }

  @Delete('items/:id')
  async deleteItem(@Req() req, @Param('id') id: string) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException('Only customers can modify their cart');
    }
    await this.cartService.deleteCartItem(req.session.customerId, +id);
    const message = await this.i18n.translate('test.CART_ITEM_REMOVED');
    return { message: message };
  }

  @Get(':cartId/items')
  async listItems(@Req() req, @Param('cartId') cartId: string) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException(
        'Only customers can view their cart items',
      );
    }
    const items = await this.cartService.listCartItems(
      req.session.customerId,
      +cartId,
    );
    return { items };
  }
}
