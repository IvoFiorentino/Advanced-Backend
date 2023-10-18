import { MongoProductManager } from '../DATA/DAOs/productsMongo.dao.js';

class ProductService {
  constructor() {
    this.productManager = new MongoProductManager();
  }

  async addProduct(product) {
    try {
      const newProduct = await this.productManager.addProduct(product);
      return newProduct;
    } catch (error) {
      throw new Error('Error when trying to add the product');
    }
  }

  async getProducts(queryOptions = {}, sortOptions = {}, limit = 10, page = 1) {
    try {
      const products = await this.productManager.getProducts(queryOptions, sortOptions, limit, page);
      return products;
    } catch (error) {
      throw new Error('Error when getting products');
    }
  }

  async getProductById(id) {
    try {
      const product = await this.productManager.getProductById(id);
      return product;
    } catch (error) {
      throw new Error('Error when getting the product by ID');
    }
  }

  async updateProduct(id, updatedFields) {
    try {
      const updatedProduct = await this.productManager.updateProduct(id, updatedFields);
      return updatedProduct;
    } catch (error) {
      throw new Error('Error when updating the product');
    }
  }

  async deleteProduct(id) {
    try {
      const deletedProduct = await this.productManager.deleteProduct(id);
      return deletedProduct;
    } catch (error) {
      throw new Error('Error when deleting the product');
    }
  }
}

export const productService = new ProductService();