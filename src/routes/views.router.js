import { Router } from "express";
import { MongoProductManager } from '../controllers/productManager.js';

const productManagerInstance = new MongoProductManager(); 

const router = Router();

// Renders the corresponding API/VIEWS/ view for "Home" and passes the complete list of products.
router.get('/', async (req, res) => {
    try {
        const products = await productManagerInstance.getProducts();
        res.render('home', { products });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching list of products' });
    }
});

// Renders the new PRODUCTS route.
router.get('/products', async (req, res) => {
  try {
      const products = await productManagerInstance.getProducts();
      res.render('products', { products });
  } catch (error) {
      res.status(500).json({ error: 'Error fetching list of products' });
  }
});

// Renders the view API/VIEWS/REALTIMEPRODUCTS and displays the list of products in real-time, adding or removing items based on actions submitted by forms.
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManagerInstance.getProducts();
        res.render('realTimeProducts', { products }); 
    } catch (error) {
        res.status(500).json({ error: 'Error fetching list of products' });
    }
});

// Automatically re-renders the list, excluding the product deleted by ID.
router.delete('/delete/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const deletedProduct = await productManagerInstance.deleteProduct(productId);
        if (deletedProduct) {
            socketServer.emit('deleteProduct', productId);
            res.status(200).json({ message: `Product ID ${productId} deleted.` });
        } else {
            res.status(404).json({ error: `Product with ID ${productId} not found.` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product.' });
    }
});

// New route to view a specific cart with its products using populate.
router.get('/carts/:cid', async (req, res) => {
    const cartId = req.params.cid;
    try {
        const cart = await cartManagerInstance.getPopulatedCartById(cartId);
        res.render('carts', { products: cart.products });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching cart' });
    }
});

export default router;