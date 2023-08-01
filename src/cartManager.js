import fs from 'fs';

const filePath = 'carts.json';

// It verifies that the files exist
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '[]', 'utf-8');
  console.log(`${filePath} has been created`);
}

class CartManager {
  constructor(filePath) {
    this.path = filePath;
    this.carts = [];
    this.lastCartId = 0;
    this.loadCarts();
  }

// Create Cart Method
    createCart() {
        const newCart = {
          id: this.lastCartId + 1,
          products: [],
        };
    
        this.lastCartId++;
        this.carts.push(newCart);
    
        this.saveCarts(this.carts)
          .then(() => {
            console.log(`Carrito creado, su ID es: ${newCart.id}`);
          })
          .catch((error) => {
            console.log('Error al guardar los carritos', error.message);
          });
    
        return newCart;
    }

  // If the cart exist load them
  async loadCarts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      this.carts = JSON.parse(data);
      this.updateLastCartId();
    } catch (error) {
      throw new Error('Error al cargar carritos: ' + error.message);
    }
  }

  // Save all carts
  async saveCarts(data) {
    try {
      const newData = JSON.stringify(data, null, 2);
      await fs.promises.writeFile(this.path, newData, 'utf-8');
      console.log('Se guardaron los carritos', this.path);
    } catch (error) {
      throw new Error('Error al guardar los carritos: ' + error.message);
    }
  }

  // Update the id
  updateLastCartId() {
    if (this.carts.length > 0) {
      const lastCart = this.carts[this.carts.length - 1];
      this.lastCartId = lastCart.id;
    }
  }

  // Find Cart by id Method
  getCartById(id) {
    const cart = this.carts.find((c) => c.id === id);
    if (cart) {
      return cart;
    } else {
      throw new Error('Carrito no encontrado');
    }
  }

  // Add product to cart 
  addProductToCart(cartId, productId, quantity = 1) {
    const cart = this.getCartById(cartId);
    const existingProduct = cart.products.find((p) => p.product === productId);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    this.saveCarts(this.carts)
      .then(() => {
        console.log(`Product ${cartId} was added to cart`);
      })
      .catch((error) => {
        throw new Error('Error to add to cart: ' + error.message);
      });

    return cart;
  }
}

export { CartManager };