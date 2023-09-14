import Cart from '../db/models/carts.model.js';

class MongoCartManager {
  constructor() {
    this.loadCarts();
  }

  // Load the carts
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
      throw new Error('Error saving the cart: ' + error.message);
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
      console.log('Error saving the cart', error.message);
      throw error;
    }
  }

  // Get carts by searching for their Mongo IDs
  async getCartById(id) {
    try {
      const cart = await Cart.findById(id);
      if (cart) {
        return cart;
      } else {
        throw new Error('Cart not found');
      }
    } catch (error) {
      throw new Error('Error getting the cart: ' + error.message);
    }
  }

  // Add products to the cart, using the ID of each product (cart ID + product ID)
  async addProductToCart(cartId, productId, quantity) {
    const cart = await this.getCartById(cartId);
    const existingProduct = cart.products.find((p) => p.product.equals(productId));

    // If no quantity is provided, products will be added one by one
    if (existingProduct) {
      existingProduct.quantity += quantity || 1;
    } else {
      cart.products.push({ product: productId, quantity: quantity || 1 });
    }

    try {
      await this.saveCart(cart);
      console.log(`Product added to cart ${cartId}`);
    } catch (error) {
      throw new Error('Error saving the cart: ' + error.message);
    }

    return cart;
  }

  // Remove a product by ID
  async removeProductFromCart(cartId, productId) {
    const cart = await this.getCartById(cartId);
    cart.products = cart.products.filter((p) => !p.product.equals(productId));

    try {
      await this.saveCart(cart);
      console.log(`Product removed from cart ${cartId}`);
    } catch (error) {
      throw new Error('Error saving the cart: ' + error.message);
    }

    return cart;
  }

  // Update cart
  async updateCart(cartId, newProducts) {
    try {
      console.log(`Updating cart ${cartId}`);
      const cart = await this.getCartById(cartId);

      if (!cart) {
        throw new Error("Cart not found");
      }

      if (!Array.isArray(newProducts)) {
        throw new Error("Invalid products data");
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
      console.log(`Cart ${cartId} was updated with new products`);
      return cart;

    } catch (error) {
      console.error("Error updating the cart:", error);
      throw new Error("Error updating the cart: " + error.message);
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
      console.log("Product added to the cart");
      return cart;
    } catch (error) {
      throw new Error("Error saving the cart" + error.message);
    }
  }

  // Clear all products from a cart
  async clearCart(cartId) {
    const cart = await this.getCartById(cartId);
    cart.products = [];

    try {
      await this.saveCart(cart);
      console.log(`Cart emptied ${cartId}`);
    } catch (error) {
      throw new Error('Error saving the cart: ' + error.message);
    }

    return cart;
  }

  // Use populate when searching for a cart by ID to list its products
  async getPopulatedCartById(_id) {
    try {
      const cart = await Cart.findById(_id).populate('products.product');
      if (cart) {
        return cart;
      } else {
        throw new Error('Cart not found');
      }
    } catch (error) {
      throw new Error('Error getting the cart: ' + error.message);
    }
  }
}

export { MongoCartManager };