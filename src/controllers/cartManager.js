import Cart from '../db/models/carts.model.js';

class MongoCartManager {
  constructor() {
    this.loadCarts();
  }

  // Load carts
  async loadCarts() {
    try {
      this.carts = await Cart.find();
    } catch (error) {
      throw new Error('Error loading carts: ' + error.message);
    }
  }

  // Save the cart after creation or modification
  async saveCart(cart) {
    try {
      await cart.save();
      console.log('Cart saved');
      return cart;
    } catch (error) {
      throw new Error('Error saving cart: ' + error.message);
    }
  }

  // Create carts using automatically generated unique Mongo IDs
  async createCart() {
    const newCart = new Cart({
      products: [],
    });
    try {
      const savedCart = await this.saveCart(newCart);
      console.log(`Cart created, its ID is: ${savedCart._id}`);
      return savedCart;
    } catch (error) {
      console.log('Error saving cart', error.message);
      throw error;
    }
  }

  // Get carts by searching for their Mongo ID
  async getCartById(id) {
    try {
      const cart = await Cart.findById(id);
      if (cart) {
        return cart;
      } else {
        throw new Error('Cart not found');
      }
    } catch (error) {
      throw new Error('Error getting cart: ' + error.message);
    }
  }

  // Add products to the cart, based on their individual IDs (cart ID + product ID)
  async addProductToCart(cartId, productId, quantity) {
    const cart = await this.getCartById(cartId);
    const existingProduct = cart.products.find((p) => p.product.equals(productId));

    // If no quantity is provided, add products one by one.
    if (existingProduct) {
      existingProduct.quantity += quantity || 1;
    } else {
      cart.products.push({ product: productId, quantity: quantity || 1 });
    }

    try {
      await this.saveCart(cart);
      console.log(`Product added to cart ${cartId}`);
    } catch (error) {
      throw new Error('Error saving cart: ' + error.message);
    }

    return cart;
  }

  // Remove product by ID
  async removeProductFromCart(cartId, productId) {
    const cart = await this.getCartById(cartId);
    cart.products = cart.products.filter((p) => !p.product.equals(productId));

    try {
      await this.saveCart(cart);
      console.log(`Product removed from cart ${cartId}`);
    } catch (error) {
      throw new Error('Error saving cart: ' + error.message);
    }

    return cart;
  }

  // Update cart
  async updateCart(cartId, newProducts) {
    try {
      console.log(`Updating cart ${cartId}`);
      const cart = await this.getCartById(cartId);

      if (!cart) {
        throw new Error('Cart not found');
      }

      if (!Array.isArray(newProducts)) {
        throw new Error('Invalid products data');
      }

      newProducts.forEach((newProduct) => {
        const existingProduct = cart.products.find(
          (product) => product.product.toString() === newProduct.product
        );

        if (existingProduct) {
          existingProduct.quantity += newProduct.quantity;
        } else {
          cart.products.push(newProduct);
        }
      });

      await this.saveCart(cart);
      console.log(`Cart ${cartId} has been updated with new products`);
      return cart;
    } catch (error) {
      console.error('Error updating cart:', error);
      throw new Error('Error updating cart: ' + error.message);
    }
  }

  // Update the quantity of a specific product
  async updateProductQuantity(cartId, productId, newQuantity) {
    try {
      const cart = await this.getCartById(cartId);
      const product = cart.products.find((p) => p.product.equals(productId));
      if (product) {
        product.quantity += newQuantity;
      } else {
        cart.products.push({ product: productId, quantity: newQuantity });
      }
      await this.saveCart(cart);
      console.log('Product added to the cart');
      return cart;
    } catch (error) {
      throw new Error('Error saving cart: ' + error.message);
    }
  }

  // Clear all products from a cart
  async clearCart(cartId) {
    const cart = await this.getCartById(cartId);
    cart.products = [];

    try {
      await this.saveCart(cart);
      console.log(`Cart ${cartId} emptied`);
    } catch (error) {
      throw new Error('Error saving cart: ' + error.message);
    }

    return cart;
  }

  // Use populate to search for a cart by ID and list its products
  async getPopulatedCartById(_id) {
    try {
      const cart = await Cart.findById(_id).populate('products.product');
      if (cart) {
        return cart;
      } else {
        throw new Error('Cart not found');
      }
    } catch (error) {
      throw new Error('Error getting cart: ' + error.message);
    }
  }
}

export { MongoCartManager };