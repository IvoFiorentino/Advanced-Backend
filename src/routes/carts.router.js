import { Router } from 'express';
import { MongoCartManager } from '../DATA/DAOs/cartsMongo.dao.js';
import { isUser } from '../middlewares/auth.middlewares.js';
import { cartService } from '../services/carts.service.js';
import { productService } from '../services/product.service.js';
import { ticketService } from '../services/ticket.service.js';
import { generateUniqueCode } from '../utils/codeGenerator.js';
import UsersDto from '../DATA/DTOs/users.dto.js';
import { ErrorMessages } from '../errors/errorNum.js';
import CustomError from '../errors/customErrors.js';
import logger from '../winston.js';

const router = Router();
const cartManagerInstance = new MongoCartManager();

router.post('/', (req, res) => {
  const newCart = cartManagerInstance.createCart();
  logger.info('Cart created successfully -TestLogger');
  res.status(201).json(newCart);
});

router.get('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await cartManagerInstance.getPopulatedCartById(cartId);
    res.json(cart.products);
  } catch (error) {
    const customError = CustomError.createError(ErrorMessages.CART_NOT_FOUND);
    logger.error('Cart not found -TestLogger');
    return res.status(customError.status).json(customError);
  }
});

router.post('/:cid/product/:pid', isUser, async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const { quantity } = req.body;

  if (!quantity || isNaN(quantity)) {
    const customError = CustomError.createError(ErrorMessages.QUANTITY_NOT_VALID);
    logger.error('Invalid quantity -TestLogger');
    return res.status(customError.status).json(customError);
  }

  const cart = cartManagerInstance.addProductToCart(cartId, productId, quantity);
  if (!cart) {
    const customError = CustomError.createError(ErrorMessages.CART_NOT_FOUND);
    logger.error('Cart not found -TestLogger');
    return res.status(customError.status).json(customError);
  }
  res.json(cart);
});

router.delete('/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  try {
    const cart = await cartManagerInstance.removeProductFromCart(cartId, productId);
    if (!cart) {
      const customError = CustomError.createError(ErrorMessages.CART_NOT_FOUND);
      logger.error('Cart not found -TestLogger');
      return res.status(customError.status).json(customError);
    }
    res.json(cart);
  } catch (error) {
    const customError = CustomError.createError(ErrorMessages.REMOVE_FROM_CART_ERROR);
    logger.error('Error removing product -TestLogger');
    return res.status(customError.status).json(customError);
  }
});

router.delete('/:cid', async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await cartManagerInstance.clearCart(cartId);
    if (!cart) {
      const customError = CustomError.createError(ErrorMessages.CART_NOT_FOUND);
      logger.error('Cart not found -TestLogger');
      return res.status(customError.status).json(customError);
    }
    res.json(cart);
  } catch (error) {
    const customError = CustomError.createError(ErrorMessages.CLEAR_CART_ERROR);
    logger.error('Error clearing cart -TestLogger');
    return res.status(customError.status).json(customError);
  }
});

router.put('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  const newProducts = req.body.products;

  try {
    console.log('New products received:', newProducts);

    const cart = await cartManagerInstance.updateCart(cartId, newProducts);

    console.log('Cart updated:', cart);
    res.json(cart);
  } catch (error) {
    logger.error('Error updating the cart -TestLogger');
    res.status(500).json({ error: 'Error updating the cart' });
  }
});

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
    res.status(500).json({ error: 'Error updating the quantity of products in the cart' });
  }
});

// Endpoint POST /api/carts/:cid/purchase (Make a purchase)
router.post('/:cid/purchase', async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await cartService.getCartById(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    const productsNotPurchased = [];

    // Check stock for each product in the cart
    for (const productInfo of cart.products) {
      const product = await productService.getProductById(productInfo.product);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (product.stock < productInfo.quantity) {
        productsNotPurchased.push(productInfo.product);
        continue;
      } else {
        product.stock -= productInfo.quantity;
        await product.save();
      }
    }

    cart.productsNotPurchased = productsNotPurchased;

    await cartService.calculateTotalAmount(cart);

    // Validate user
    // const userDto = req.session.user;
    // if (!userDto || !userDto.email) {
    //   return res.status(401).json({ error: 'Unauthorized user or missing email' });
    // }

    const ticketData = {
      code: await generateUniqueCode(),
      purchase_datetime: new Date(),
      amount: cart.totalAmount,
      purchaser: "IVO",
      // purchaser: userDto.email, // 
    };
    const ticket = await ticketService.createTicket(ticketData);

    await cart.save();

    res.status(201).json({ message: 'Purchase successful', ticket, notPurchasedProducts: productsNotPurchased });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});