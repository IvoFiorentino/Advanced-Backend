import express from 'express';
import { MongoProductManager } from '../src/DAL/productManager.js';
import productsRouter from '../src/routes/products.router.js'; 
import cartsRouter from '../src/routes/carts.router.js';
import { __dirname } from './utils.js'; 
import handlebars from 'express-handlebars'; 
import viewsRouter from './routes/views.router.js'; 
import { Server } from 'socket.io'; 
import '../src/db/dbConfig.js';
import { Message } from '../src/db/models/messages.models.js';
import sessionRouter from '../src/routes/sessions.router.js'; 
import cookieParser from 'cookie-parser'; 
import passport from 'passport'; 
import './passport/passportStrategies.js';

import config from './config.js';

import session from 'express-session';
import FileStore from 'session-file-store'; 
import MongoStore from 'connect-mongo'; 

// SESSION CONFIGURATIONS 
const fileStorage = FileStore(session);

//APP CREATE
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// CONFIGURE COOKIE PARSER + SESSIONS
app.use(cookieParser());
app.use(session({
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://ivofiorentino0:vAUaOtrcWBzUJ5EG@ecommerceivof.jl3fssh.mongodb.net/EcommerceivoF?retryWrites=true&w=majority',
    mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    ttl: 2000,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// PASSPORT CONFIGURATIONS
app.use(passport.initialize());
app.use(passport.session());

// HANDLEBARS CONFIGURATIONS
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

// Routes viewRouter
app.use('/api/views', viewsRouter);
app.use('/api/views/delete/:id', viewsRouter);

const productManagerInstance = new MongoProductManager();

app.get('/', (req, res) => {
  res.send('Welcome to my application!');
});

app.use('/api/products', productsRouter);
app.use('/api/views/products', productsRouter);

app.use('/api/carts', cartsRouter);

// app.get('/chat', (req, res) => {
//   res.render('chat', { messages: [] });
// });

app.use('/api/session', sessionRouter);

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/profile', (req, res) => {
  res.render('profile', {
    user: req.session.user,
  });
});


const httpServer = app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});

// Socket and events
const socketServer = new Server(httpServer);

socketServer.on('connection', (socket) => {
  console.log('Client connected', socket.id);
  socket.on('disconnect', () => {
    console.log(`Client disconnected`);
  });

  socket.on('addProduct', (newProduct) => {
    const addedProduct = productManagerInstance.addProduct(newProduct);
    socketServer.emit('addProduct', addedProduct);
  });

  socket.on('deleteProduct', (productId) => {
    productManagerInstance.deleteProduct(Number(productId));
    socketServer.emit('productDeleted', productId);
    socketServer.emit('updateProductList');
  });

  socket.on('chatMessage', async (messageData) => {
    const { user, message } = messageData;
    const newMessage = new Message({ user, message });
    await newMessage.save();

    // Emit the message to all connected clients
    socketServer.emit('chatMessage', { user, message });

    console.log(`Message saved in the database: ${user}: ${message}`);
  });
});