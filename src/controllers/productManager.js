import fs from 'fs';
const filePath = 'products.json';

// It verifies that the files exist
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '[]', 'utf-8');
  console.log(`${filePath} file created`);
}

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.products = [];
    this.lastProductId = 0;
    this.loadProducts();
  }

  // If the products exist load them
  async loadProducts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      this.products = JSON.parse(data);
      this.updateLastProductId();
    } catch (error) {
      console.log('Error loading products', error.message);
      throw new Error('Error loading products');
    }
  }

  // Save all products 
  async saveProducts(data) {
    try {
      const newData = JSON.stringify(data, null, 2);
      await fs.promises.writeFile(this.path, newData, 'utf-8');
      console.log('the products were saved', this.path);
    } catch (error) {
      console.log('Error saving products', error.message);
      throw new Error('Error saving products');
    }
  }

  // Update the id
  updateLastProductId() {
    if (this.products.length > 0) {
      const lastProduct = this.products[this.products.length - 1];
      this.lastProductId = lastProduct.id;
    }
  }

  // Verifies that all items camps are completed.
  addProduct(product) {
    if (
      !product.title ||
      !product.description ||
      !product.price ||
      !product.code ||
      !product.stock ||
      !product.category
    ) {
      console.log('All fields are required');
      throw new Error('incomplete fields');
    }

    // Validation of non repeated item
    if (this.products.some((p) => p.code === product.code)) {
      console.log(`There is already a product with this code ${product.code}.`);
      throw new Error('This product already exists');
    }

    // Increase id 
    const newProduct = {
      ...product,
      id: this.lastProductId + 1,
      status: true, 
      category: product.category,
    };

    this.lastProductId++;
    this.products.push(newProduct);

    this.saveProducts(this.products)
      .then(() => {
        console.log(`Product added: ${newProduct.title}`);
      })
      .catch((error) => {
        console.log('Error saving product ', error.message);
        throw new Error('Error saving product');
      });

    return newProduct;
  }

  // Get list of Item Method
  async getProducts() {
    await this.loadProducts();
    return this.products;
  }

  // Find Item by id Method
  async getProductById(id) {
    await this.loadProducts();
    const product = this.products.find((p) => p.id === id);
    if (product) {
      return product;
    } else {
      console.log('Product not found');
      return null;
    }
  }

  // Update Item Method
  async updateProduct(id, updatedFields) {
    const productToUpdate = this.products.find((p) => p.id === id);
    if (!productToUpdate) {
      console.log(`Product id ${id} not founded`);
      return;
    }

    Object.assign(productToUpdate, updatedFields);

    await this.saveProducts(this.products)
      .then(() => {
        console.log(`Update product: ${JSON.stringify(productToUpdate)}`);
      })
      .catch((error) => {
        console.log('Error saving product', error.message);
      });
  }

  // Delete Item Method
  async deleteProduct(id) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      const deletedProduct = this.products.splice(index, 1)[0];
      await this.saveProducts(this.products)
        .then(() => {
          console.log(`Deleted product: ${deletedProduct.title}`);
        })
        .catch((error) => {
          console.log('Error saving products', error.message);
        });
    } else {
      console.log('Product not founded');
      return null;
    }
  }
}

export { ProductManager };