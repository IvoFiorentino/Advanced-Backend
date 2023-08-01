import express from 'express';
import { ProductManager } from '../src/productManager.js';
import productsRouter from '../src/routes/products.router.js'; 
import cartsRouter from '../src/routes/cart.router.js'; 

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allProducts = new ProductManager('./products.json');

//Mensaje de bienvenida al acceder a la raíz de la app
app.get('/', (req, res) => {
  res.send('Hello World :)');
});


app.use('/api/products', productsRouter);


app.use('/api/carts', cartsRouter);


app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

