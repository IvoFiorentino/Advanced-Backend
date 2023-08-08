import { Router } from "express";
import { ProductManager } from "../controllers/productManager.js";

const router = Router();
const productManagerInstance = new ProductManager('./products.json');


router.get('/', async (req, res) => {
    try {
        const products = await productManagerInstance.getProducts();
        res.render('home', { products });
    } catch (error) {
        res.status(500).json({ error: 'Error cannot get product list' });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManagerInstance.getProducts();
        res.render('timeProducts', { products }); 
    } catch (error) {
        res.status(500).json({ error: 'Error cannot get product list' });
    }
});

  router.delete('/api/views/delete/:id', async (req, res) => {
    const productId = parseInt(req.params.id);

    try {
        const deletedProduct = await productManagerInstance.deleteProduct(productId);
    if (deletedProduct) {
      socketServer.emit('deleteProduct', productId);
      res.status(200).json({ message: `Product with ID ${productId} deleted.` });
    } else {
      res.status(404).json({ error: `Product with id ${productId} not found.` });
    }
    } catch (error) {
    res.status(500).json({ error: 'Error item cannot be deleted.' });
  }
});
  

export default router;