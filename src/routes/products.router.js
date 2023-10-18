import { Router } from "express";
import { MongoProductManager } from '../DATA/DAOs/productsMongo.dao.js';
import { isAdmin } from '../middlewares/auth.middlewares.js';

const router = Router();

const productManagerInstance = new MongoProductManager();

router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, query, sort } = req.query;

    let queryOptions = {};
    if (query) {
      queryOptions = {
        $or: [
          { title: { $regex: query, $options: 'i' } }, 
          { category: { $regex: query, $options: 'i' } }, 
        ],
      };
    }

    const sortOptions = {};
    if (sort === 'asc') {
      sortOptions.price = 1; 
    } else if (sort === 'desc') {
      sortOptions.price = -1; 
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
    res.status(500).json({ error: 'Error getting the list of products' });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await productManagerInstance.getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error getting the requested product' });
  }
});

router.post('/', isAdmin, (req, res) => {
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

  const newProduct = productManagerInstance.addProduct(product);
  if (newProduct) {
    res.status(201).json(newProduct);
  } else {
    res.status(400).json({ error: 'Could not add the product' });
  }
});

router.put('/:pid', isAdmin, async (req, res) => {
  const productId = req.params.pid;
  const updatedFields = req.body;
  await productManagerInstance.updateProduct(productId, updatedFields);
  res.json({ message: 'Product updated successfully' });
});

router.delete('/:pid', isAdmin, async (req, res) => {
  const productId = req.params.pid;
  await productManagerInstance.deleteProduct(productId);
  res.json({ message: 'Product deleted successfully' });
});

export default router;