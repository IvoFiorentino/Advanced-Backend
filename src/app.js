import express from 'express';
import { MongoProductManager } from '../src/controllers/productManager.js';
import productsRouter from '../src/routes/products.router.js'; // Import the products router
import cartsRouter from '../src/routes/carts.router.js'; // Import the carts router
import { __dirname } from './utils.js'; // Import Utils
import handlebars from 'express-handlebars'; // Import Handlebars
import viewsRouter from './routes/views.router.js'; // Import viewsRouter
import { Server } from 'socket.io'; // Import socket
import '../src/db/dbConfig.js';
import { Message } from '../src/db/models/messages.models.js';

// EXPRESS Configurations
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// HANDLEBARS Configurations
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

// Routes for viewsRouter
app.use('/api/views', viewsRouter);
app.use('/api/views/delete/:id', viewsRouter);

// IMPORTANT! Uncomment the following line if you want to work with persistence through FS.
const productManagerInstance = new MongoProductManager();

// Welcome message when accessing the root of the app
app.get('/', (req, res) => {
  res.send('Welcome to my application!');
});

// Invocation of productsRouter
app.use('/api/products', productsRouter);
app.use('/api/views/products', productsRouter);

// Invocation of cartsRouter
app.use('/api/carts', cartsRouter);

// Chat route
app.get('/chat', (req, res) => {
  res.render('chat', { messages: [] });
});

// Declare a variable for the port and listen on that port
const PORT = 8080;

const httpServer = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Socket and events
const socketServer = new Server(httpServer);

socketServer.on('connection', (socket) => {
  console.log('Client connected', socket.id);
  socket.on('disconnect', () => {
    console.log(`Client disconnected`);
  });

  socket.on('addProduct', (newProduct) => {
    // const addedProduct = productManagerInstance.addProduct(newProduct);
    // socketServer.emit('addProduct', addedProduct);
  });

  socket.on('deleteProduct', (productId) => {
    // productManagerInstance.deleteProduct(Number(productId));
    // socketServer.emit('productDeleted', productId);
    // socketServer.emit('updateProductList');
  });

  socket.on('chatMessage', async (messageData) => {
    const { user, message } = messageData;
    const newMessage = new Message({ user, message });
    await newMessage.save();

    // Emit the message to all connected clients
    socketServer.emit('chatMessage', { user, message });

    console.log(`Message saved to database: ${user}: ${message}`);
  });
});