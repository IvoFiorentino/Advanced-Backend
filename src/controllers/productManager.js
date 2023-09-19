import { Product } from '../db/models/products.model.js';

class MongoProductManager {
  // Add products
  async addProduct(product) {
    try {
      const newProduct = new Product(product);
      await newProduct.save();
      return newProduct;
    } catch (error) {
      console.log('Error adding product', error.message);
      throw new Error('Error adding product');
    }
  }

  async getProductsCount(queryOptions = {}) {
    return await Product.countDocuments(queryOptions);
  }

  // Modify getProducts to list all products with a limit of 10 per page
  async getProducts(queryOptions = {}, sortOptions = {}, limit = 10, page = 1) {
    const options = {
      sort: sortOptions,
      page: page,
      limit: limit,
      lean: true,
    };

    const result = await Product.paginate(queryOptions, options);
    return result;
  }

  // Get products by ID
  async getProductById(id) {
    try {
      const product = await Product.findById(id);
      return product;
    } catch (error) {
      console.log('Error getting product by ID', error.message);
      throw new Error('Error getting product by ID');
    }
  }

  // Update product
  async updateProduct(id, updatedFields) {
    try {
      const product = await Product.findByIdAndUpdate(id, updatedFields, { new: true });
      return product;
    } catch (error) {
      console.log('Error updating product', error.message);
      throw new Error('Error updating product');
    }
  }

  // Delete product by ID
  async deleteProduct(id) {
    try {
      const deletedProduct = await Product.findByIdAndDelete(id);
      return deletedProduct;
    } catch (error) {
      console.log('Error deleting product', error.message);
      throw new Error('Error deleting product');
    }
  }
}

export { MongoProductManager };