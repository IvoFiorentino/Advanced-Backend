import { MongoCartManager } from '../DATA/DAOs/cartsMongo.dao.js';
import { productService } from './product.service.js';
import CustomError from '../errors/customErrors.js';
import { ErrorMessages } from '../errors/errorNum.js';
import logger from '../winston.js'

class CartService {
  constructor() {
    this.cartManager = new MongoCartManager();
  }

  async createCart() {
    try {
      const newCart = await this.cartManager.createCart();
      return { message: 'Cart created', cart: newCart };
    } catch (error) {
      throw new Error('Error while trying to create the cart');
    }
  }

  async getCartById(cartId) {
    try {
      const cart = await this.cartManager.getCartById(cartId);
      return cart;
    } catch (error) {
      const customError = CustomError.createError(ErrorMessages.CART_NOT_FOUND);
      res.status(customError.status).json(customError);
    }
  }

  async addProductToCart(cartId, productId, quantity) {
    try {
      const cart = await this.cartManager.addProductToCart(cartId, productId, quantity);
      return this.calculateTotalAmount(cart);
    } catch (error) {
      const customError = CustomError.createError(ErrorMessages.CART_NOT_FOUND);
      return res.status(customError.status).json(customError);
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
      const cart = await this.cartManager.removeProductFromCart(cartId, productId);
      return { message: 'Product removed from the cart', cart };
    } catch (error) {
      const customError = CustomError.createError(ErrorMessages.REMOVE_FROM_CART_ERROR);
      return res.status(customError.status).json(customError);
    }
  }

  async updateCart(cartId, newProducts) {
    try {
      const cart = await this.cartManager.updateCart(cartId, newProducts);
      return { message: 'Cart updated', cart };
    } catch (error) {
      throw new Error('Error while updating the cart');
    }
  }

  async updateProductQuantity(cartId, productId, newQuantity) {
    try {
      const cart = await this.cartManager.updateProductQuantity(cartId, productId, newQuantity);
      return { message: 'Quantity updated', cart };
    } catch (error) {
      throw new Error('Error while updating the quantity of the product in the cart');
    }
  }

  async clearCart(cartId) {
    try {
      const cart = await this.cartManager.clearCart(cartId);
      return { message: 'All products in the cart have been removed', cart };
    } catch (error) {
      const customError = CustomError.createError(ErrorMessages.CLEAR_CART_ERROR);
      return res.status(customError.status).json(customError);
    }
  }

  async getPopulatedCartById(cartId) {
    try {
      const cart = await this.cartManager.getPopulatedCartById(cartId);
      return { success: true, message: 'Cart retrieved successfully', cart };
    } catch (error) {
      throw new Error('Error while retrieving the cart');
    }
  }

  async calculateTotalAmount(cart) {
    try {
      if (!cart) {
        throw new Error('Cart not found');
      }

      let totalAmount = 0;

      for (const productInfo of cart.products) {
        const product = await productService.getProductById(productInfo.product);
        if (product) {
          totalAmount += product.price * productInfo.quantity;
        }
      }

      cart.totalAmount = totalAmount;
      await this.cartManager.saveCart(cart);

      return cart;
    } catch (error) {
      throw new Error('Error while calculating the total: ' + error.message);
    }
  }
}

export const cartService = new CartService();