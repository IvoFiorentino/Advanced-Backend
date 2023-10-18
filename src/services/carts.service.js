import { MongoCartManager } from '../DATA/DAOs/cartsMongo.dao.js';
import { productService } from './product.service.js';

class CartService {
  constructor() {
    this.cartManager = new MongoCartManager();
  }

  async createCart() {
    try {
      const newCart = await this.cartManager.createCart();
      return { message: 'Cart created', cart: newCart };
    } catch (error) {
      throw new Error('Error when trying to create the cart');
    }
  }

  async getCartById(cartId) {
    try {
      const cart = await this.cartManager.getCartById(cartId);
      return cart;
    } catch (error) {
      throw new Error('Error when getting the cart');
    }
  }

  async addProductToCart(cartId, productId, quantity) {
    try {
      const cart = await this.cartManager.addProductToCart(cartId, productId, quantity);
      return this.calculateTotalAmount(cart);
    } catch (error) {
      throw new Error('Error when adding the product to the cart');
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
      const cart = await this.cartManager.removeProductFromCart(cartId, productId);
      return { message: 'Product removed from the cart', cart };
    } catch (error) {
      throw new Error('Error when removing the product from the cart');
    }
  }

  async updateCart(cartId, newProducts) {
    try {
      const cart = await this.cartManager.updateCart(cartId, newProducts);
      return { message: 'Cart updated', cart };
    } catch (error) {
      throw new Error('Error when updating the cart');
    }
  }

  async updateProductQuantity(cartId, productId, newQuantity) {
    try {
      const cart = await this.cartManager.updateProductQuantity(cartId, productId, newQuantity);
      return { message: 'Quantity updated', cart };
    } catch (error) {
      throw new Error('Error when updating the product quantity in the cart');
    }
  }

  async clearCart(cartId) {
    try {
      const cart = await this.cartManager.clearCart(cartId);
      return { message: 'All products have been removed from the cart', cart };
    } catch (error) {
      throw new Error('Error when clearing the cart');
    }
  }

  async getPopulatedCartById(cartId) {
    try {
      const cart = await this.cartManager.getPopulatedCartById(cartId);
      return { success: true, message: 'Cart retrieved successfully', cart };
    } catch (error) {
      throw new Error('Error getting the cart');
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
      throw new Error('Error when calculating the total: ' + error.message);
    }
  }
}

export const cartService = new CartService();