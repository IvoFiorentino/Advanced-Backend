import { Router } from "express";
import { MongoProductManager } from '../controllers/productManager.js';

const router = Router();

const productManagerInstance = new MongoProductManager();

// GET modified to meet search methods based on api/products requirements
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, query, sort } = req.query;

    let queryOptions = {};
    if (query) {
      queryOptions = {
        $or: [
          { title: { $regex: query, $options: 'i' } }, // Search by title (case-insensitive)
          { category: { $regex: query, $options: 'i' } }, // Search by category (case-insensitive)
        ],
      };
    }

    const sortOptions = {};
    if (sort === 'asc') {
      sortOptions.price = 1; // Ascending order by price
    } else if (sort === 'desc') {
      sortOptions.price = -1; // Descending order by price
    }

    const productsPaginated = await productManagerInstance.getProducts(queryOptions, sortOptions, limit, page);

    const response = {
      status: 'success',
      payload: productsPaginated.docs, 
      totalPages: productsPaginated.totalPages,
      prevPage: productsPaginated.hasPrevPage ? productsPaginated.prevPage : null,
      nextPage: productsPaginated.hasNextPage ? productsPaginated.nextPage : null,
      page: productsPaginated.page,
      hasPrevPage: productsPaginated.hasPrevPage,
      hasNextPage: productsPaginated.hasNextPage,
      prevLink: productsPaginated.hasPrevPage ? `/api/products?limit=${limit}&page=${productsPaginated.prevPage}&query=${query}&sort=${sort}` : null,
      nextLink: productsPaginated.hasNextPage ? `/api/products?limit=${limit}&page=${productsPaginated.nextPage}&query=${query}&sort=${sort}` : null,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving product list' });
  }
});

// Endpoint GET /api/products/:pid (Retrieve a product by unique ID)
router.get('/:pid', async (req, res) => {
  try {
    const productId = req.params.pid; // Removed parseInt for Mongoose ID
    const product = await productManagerInstance.getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving requested product' });
  }
});

// Endpoint POST /api/products (Add a new product)
router.post('/', (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;
  const product = {
    title,
    description,
    code,
    price,
    status: true, // Following the requirement, set status to TRUE by default
    stock: stock,
    category,
    thumbnails: thumbnails ? thumbnails.split(',') : [], 
  };

  const newProduct = productManagerInstance.addProduct(product);
  if (newProduct) {
    res.status(201).json(newProduct);
  } else {
    res.status(400).json({ error: 'Product could not be added' });
  }
});

// Endpoint PUT /api/products/:pid (Update a product)
router.put('/:pid', async (req, res) => {
  const productId = req.params.pid; // Removed parseInt to work with Mongoose IDs
  const updatedFields = req.body; 
  await productManagerInstance.updateProduct(productId, updatedFields);
  res.json({ message: 'Product updated successfully' });
});

// Endpoint DELETE /api/products/:pid (Delete a product Deliverable 3)
router.delete('/:pid', async (req, res) => {
  const productId = req.params.pid; // Removed parseInt to work with Mongoose ID
  await productManagerInstance.deleteProduct(productId);
  res.json({ message: 'Product deleted successfully' });
});

export default router;