import { Router } from 'express';
import { CartManager } from '../controllers/cartManager.js';

const router = Router();
const cartManagerAdapter = new CartManager('carts.json');

// Endpoint POST /api/carts (Create new cart)
router.post('/', (req, res) => {
  const newCart = cartManagerAdapter.createCart();
  res.status(201).json(newCart);
});

// Endpoint GET /api/carts/:cid (It list all products from cart, if doesn´t exist then create a empty array)
router.get('/:cid', async (req, res) => {
  const cartId = parseInt(req.params.cid);
  const cart = await cartManagerAdapter.getCartById(cartId);

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  res.json(cart.products);
});

// Endpoint POST /api/carts/:cid/product/:pid (Add new product to cart)
router.post('/:cid/product/:pid', async (req, res) => {
  const cartId = parseInt(req.params.cid);
  const productId = parseInt(req.params.pid);
  const { quantity } = req.body;

  if (!quantity || isNaN(quantity)) {
    return res.status(400).json({ error: 'No valid' });
  }

  const cart = cartManagerAdapter.addProductToCart(cartId, productId, quantity);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  res.json(cart);
});

export default router;
