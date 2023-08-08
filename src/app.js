import express from 'express';
import { ProductManager } from '../src/controllers/productManager.js';
import productsRouter from '../src/routes/products.router.js'; 
import cartsRouter from '../src/routes/carts.router.js'; 
import { __dirname } from './utils.js'
import handlebars from 'express-handlebars'
import viewsRouter from './routes/views.router.js' 
import { Server } from 'socket.io' 

//EXPRESS settings
const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

//EXPRESS-HANDLEBARS settings
app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

//ROUTES//

// viewRouter
app.use('/api/views', viewsRouter)
app.use('api/views/delete/:id', viewsRouter)

const productManagerAdapter = new ProductManager('./products.json');

// Welcome view
app.get('/', (req, res) => {
  res.send('Hello World :)');
});

// Products Routes
app.use('/api/products', productsRouter);

//Carts Routes
app.use('/api/carts', cartsRouter);


const httpServer = app.listen(PORT, () => {
  console.log(`Server is up on ${PORT}`);
});

//Socket issues
const socketServer = new Server(httpServer);

socketServer.on('connection', (socket) => {
  console.log('Connected to client', socket.id);
  socket.on('disconnect', () => {
    console.log('Disconnected client')
  })

 socket.on('addProduct', (newProduct) => {
  const addedProduct = productManagerAdapter.addProduct(newProduct);
  socketServer.emit('addProduct', addedProduct);
  });

 socket.on('deleteProduct', (productId) => {
  productManagerAdapter.deleteProduct(Number(productId));
  socketServer.emit('productDeleted', productId);
  socketServer.emit('updateProductList');
  });
})