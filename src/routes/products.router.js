//Router to handle all the endpoints associated with the products.
import { Router } from "express";
import { ProductManager } from "../productManager.js";

const router = Router();
const allProducts = new ProductManager('./products.json');

//Endpoint GET /api/products (It will list all the products)
router.get('/', async (req, res) => {
  try {
    const products = await allProducts.getProducts();
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const response = limit ? products.slice(0, limit) : products;
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Error getting product list' });
  }
});

//Endpoint GET /api/products/:pid (It will list the product by unique ID)
router.get('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = await allProducts.getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error getting the requested product' });
  }
});

// Endpoint POST /api/products (Allows adding a new product)
router.post('/', (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;
  const product = {
    title,
    description,
    code,
    price,
    status: true, 
    stock: stock,
    category,
    thumbnails: thumbnails ? thumbnails.split(',') : [], 
  };

  const newProduct = allProducts.addProduct(product);
  if (newProduct) {
    res.status(201).json(newProduct);
  } else {
    res.status(400).json({ error: 'Could not add product' });
  }
});


// Endpoint PUT /api/products/:pid   (Actualizará un producto)
router.put('/:pid', async (req, res) => {
  const productId = parseInt(req.params.pid);
  const updatedFields = req.body; 
  await allProducts.updateProduct(productId, updatedFields);
  res.json({ message: 'Product successfully upgraded' });
});


// Endpoint DELETE /api/products/:pid (Eliminará un producto)
router.delete('/:pid', async (req, res) => {
  const productId = parseInt(req.params.pid);
  await allProducts.deleteProduct(productId);
  res.json({ message: 'Product successfully removed' });
});


export default router;