import express from 'express';
import productsRouter from '../src/routes/products.router.js'; 
import cartsRouter from '../src/routes/cart.router.js'; 

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ROUTES//

// Welcome view
app.get('/', (req, res) => {
  res.send('Hello World :)');
});

// Products Routes
app.use('/api/products', productsRouter);

//Carts Routes
app.use('/api/carts', cartsRouter);


app.listen(PORT, () => {
  console.log(`Server is up on ${PORT}`);
});

