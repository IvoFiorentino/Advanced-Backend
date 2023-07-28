const express = require('express');
const ProductManager = require('./productManager');

const app = express();
const PORT = 8080;

const allProducts = new ProductManager('products.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log('Servidor corriendo en el puerto 8080');
});

app.get('/', (req, res) => {
  res.send('hola funciono');
});

app.get('/products', (req, res) => {
  const limit = req.query.limit;
  const products = allProducts.getProducts().slice(0, limit);
  res.json(products);
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await allProducts.getProducts();
    res.status(200).send({ message: 'products', products });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.get('/api/products/:pid', async (req, res) => {
  const { pid } = req.params;
  try {
    const product = await allProducts.getProductById(parseInt(pid));
    res.status(200).json({ message: 'product', product });
  } catch (error) {
    res.status(500).json({ error });
  }
});






