import { Router } from 'express';
import { MongoCartManager } from '../controllers/cartManager.js';

const router = Router();

const cartManagerInstance = new MongoCartManager();

// Endpoint POST /api/carts (Create a new cart) --(Tested OK TC 29-8)
router.post('/', (req, res) => {
  const newCart = cartManagerInstance.createCart();
  res.status(201).json(newCart);
});

// Endpoint GET using mongoose's POPULATE (/api/carts/:cid)
// Tested OK by TC 30-8
router.get('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await cartManagerInstance.getPopulatedCartById(cartId);
    res.json(cart.products);
  } catch (error) {
    res.status(404).json({ error: 'Cart not found' });
  }
});

// Endpoint POST /api/carts/:cid/product/:pid (Add a product to the cart)
// Tested OK TC 29-8
router.post('/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid;  // Removed parseInt to allow searching by Mongo ID
  const productId = req.params.pid; // Removed parseInt to allow searching by Mongo ID
  const { quantity } = req.body;

  if (!quantity || isNaN(quantity)) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  const cart = cartManagerInstance.addProductToCart(cartId, productId, quantity);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  res.json(cart);
});

// Endpoint DELETE /api/carts/:cid/product/:pid (Remove a product by ID)
// Tested OK TC 29-8
router.delete('/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  try {
    const cart = await cartManagerInstance.removeProductFromCart(cartId, productId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error removing the product from the cart' });
  }
});

// Endpoint DELETE /api/carts/:cid (Remove ALL products from a cart)
// Tested OK TC 29-8
router.delete('/:cid', async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await cartManagerInstance.clearCart(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error removing all products from the cart' });
  }
});

// Endpoint PUT /api/carts/:cid (Update the entire cart with a new array of products)
router.put('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  const newProducts = req.body.products;

  try {
    console.log('New products received:', newProducts);
    
    const cart = await cartManagerInstance.updateCart(cartId, newProducts);

    console.log('Cart updated:', cart);
    res.json(cart);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error updating the cart' });
  }
});

// Endpoint PUT /api/carts/:cid/product/:pid (Update only the quantity of a specific product in the cart)
// Tested OK TC 29-8
router.put('/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const newQuantity = req.body.quantity;

  try {
    const cart = await cartManagerInstance.updateProductQuantity(cartId, productId, newQuantity);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error updating the product quantity in the cart' });
  }
});

export default router;