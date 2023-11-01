import express from 'express';
import { MongoProductManager } from './DATA/DAOs/productsMongo.dao.js';
import productsRouter from '../src/routes/products.router.js';
import cartsRouter from '../src/routes/carts.router.js';
import { __dirname } from './bcrypt-helper.js';
import handlebars from 'express-handlebars';
import viewsRouter from './routes/views.router.js';
import { Server } from 'socket.io';
import './DATA/mongoDB/dbConfig.js';
import { Message } from './DATA/mongoDB/models/messages.model.js';
import sessionRouter from '../src/routes/sessions.router.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './services/passport/passportStrategies.js';
import { isUser } from './middlewares/auth.middlewares.js';
import session from 'express-session';
import FileStore from 'session-file-store';
import MongoStore from 'connect-mongo';
import config from './config.js';
import mailsRouter from '../src/routes/mails.router.js';
import {generateFakeProducts} from './mocks/productsMock.js'
import logger from '../src/winston.js';

const fileStorage = FileStore(session);
const app = express();

app.use(cookieParser());
app.use(session({
  store:MongoStore.create({
    mongoUrl: config.mongoUrl,
    mongoOptions: {useNewUrlParser: true, useUnifiedTopology: true},
    ttl:50000,
  }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use('/api/views', viewsRouter);
app.use('/api/views/delete/:id', viewsRouter);

const productManagerInstance = new MongoProductManager();

app.get('/', (req, res) => {
  res.send('Welcome to my application!');
});

app.use('/api/products', productsRouter);
app.use ('/api/views/products', productsRouter);

app.get('/api/mockingproducts', (req, res) => {
  const fakeProducts = [];
  for (let i = 0; i < 100; i++) {
      const productMock = generateFakeProducts(); 
      fakeProducts.push(productMock);
  }
  res.json(fakeProducts);
});

app.use('/api/carts', cartsRouter);

app.get('/chat', isUser, (req, res) => {
  res.render('chat', { messages: [] });
});

app.use("/api/session", sessionRouter);
app.use("/api/session/current", sessionRouter);

app.use('/api/mail', mailsRouter);
app.get('/api/mail', (req, res) => {
  res.render('mail');
});

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

//CLASS 34 CHALLENGE
app.get('/loggerTest', (req, res) => {
  logger.debug('Testing debug-level message');
  logger.http('Testing http-level message');
  logger.info('Testing info-level message');
  logger.warning('Testing warning-level message');
  logger.error('Testing error-level message');
  logger.fatal('Testing fatal-level message');
  res.send('Logs generated from the /loggerTest endpoint');
});

app.get('/generateError', (req, res) => {
  throw new Error('This is an intentional test error');
});

const PORT = config.port;
const httpServer = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

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
    socketServer.emit('chatMessage', { user, message });
    console.log(`Message saved in the database: ${user}: ${message}`);
  });
});