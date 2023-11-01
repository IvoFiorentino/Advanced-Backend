import { Router } from "express";
import { MongoProductManager } from '../DATA/DAOs/productsMongo.dao.js';
import { isAdmin } from '../middlewares/auth.middlewares.js'
import CustomError from "../errors/customErrors.js";
import { ErrorMessages } from "../errors/errorNum.js";
import { Product } from '../DATA/mongoDB/models/products.model.js';
import logger from '../winston.js'

const router = Router();

const productManagerInstance = new MongoProductManager();

function getFieldType(fieldName) {
  const field = Product.schema.path(fieldName);
  if (field) {
    return field.instance;
  }
  return "undefined";
}

router.post('/', isAdmin, (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;

  const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category', 'thumbnails'];
  const missingFields = requiredFields.filter(field => !(field in req.body));

  if (missingFields.length > 0) {
    const errorMessages = missingFields.map(field => {
      const fieldType = getFieldType(field);
      return `${field} (of type ${fieldType}) is required`;
    });
    logger.warning('Missing required fields -TestLogger');
    return res.status(400).json({ error: ErrorMessages.MISSING_REQUIRED_FIELDS, details: errorMessages });
  }

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
    logger.info('Product created successfully -TestLogger');
    res.status(201).json(newProduct);
  } else {
    const customError = CustomError.createError(ErrorMessages.ADD_PRODUCT_ERROR);
    logger.error('Error while creating the product -TestLogger');
    return res.status(customError.status).json(customError);
  }
});

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
    const customError = CustomError.createError(ErrorMessages.GET_PRODUCTS_ERROR)
    logger.error('Error while getting products -TestLogger');
    return res.status(customError.status).json(customError);
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
    const customError = CustomError.createError(ErrorMessages.PRODUCT_NOT_FOUND)
    logger.error('Product not found -TestLogger');
    return res.status(customError.status).json(customError);
  }
});

router.put('/:pid', isAdmin, async (req, res) => {
  const productId = req.params.pid;
  const updatedFields = req.body;
  await productManagerInstance.updateProduct(productId, updatedFields);
  logger.info('Product updated -TestLogger');
  res.json({ message: 'Product updated successfully' });
});

router.delete('/:pid', isAdmin, async (req, res) => {
  const productId = req.params.pid;
  await productManagerInstance.deleteProduct(productId);
  logger.info('Product deleted -TestLogger');
  res.json({ message: 'Product deleted successfully' });
});

export default router;