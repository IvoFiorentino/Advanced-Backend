import { Router } from "express";
import { MongoProductManager } from '../controllers/productManager.js';

const productManagerInstance = new MongoProductManager(); 

const router = Router();

//API/VIEWS/ 
router.get('/', async (req, res) => {
    try {
        const products = await productManagerInstance.getProducts();
        res.render('home', { products });
    } catch (error) {
        res.status(500).json({ error: 'Error while obtaining the list of products' });
    }
});

//(API/VIEWS/PRODUCTS).
router.get('/products', async (req, res) => {
  try {
      const products = await productManagerInstance.getProducts();
      res.render('products', { products, user: req.session.user });
  } catch (error) {
      res.status(500).json({ error: 'Error while obtaining the list of products' });
  }
});


router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManagerInstance.getProducts() ;
        res.render('realTimeProducts', { products }); 
    } catch (error) {
        res.status(500).json({ error: 'Error while obtaining the list of products' });
    }
});


router.delete('/delete/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const deletedProduct = await productManagerInstance.deleteProduct(productId);
        if (deletedProduct) {
          socketServer.emit('deleteProduct', productId);
          res.status(200).json({ message: `Product ID ${productId} deleted.` });
        } else {
          res.status(404).json({ error: `No product found with ID ${productId}.` });
        }
    } catch (error) {
    res.status(500).json({ error: 'Error while deleting the product.' });
  }
});


router.get('/carts/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await cartManagerInstance.getPopulatedCartById(cartId);
    res.render('carts', { products: cart.products });
  } catch (error) {
    res.status(500).json({ error: 'Error while obtaining the cart' });
  }
});
  
// USERS 
const publicAccess = (req, res, next) => {
  if (req.session.user) return res.redirect('/profile');
  next();
}

const privateAccess = (req, res, next) => {
  if (!req.session.user) return res.redirect('/login');
  next();
}

router.get('/register', publicAccess, (req, res) => {
  res.render('register')
})

router.get('/login', publicAccess, (req, res) => {
  res.render('login')
})

router.get('/profile', privateAccess, (req, res) => {
  res.render('profile',{
      user: req.session.user
  })
})

export default router;