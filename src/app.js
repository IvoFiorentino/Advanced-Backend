const express = require ('express')
const productManager = require ('./productManager')

const app = express()
const PORT = 8080

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.listen(PORT,()=>{
    console.log('Servidor corriendo en el puerto 8080');
})

app.get('/products', (req, res)=>{
    const limit = req.query.limit
    const resLimit = prods.slice(0,limit)
});


app.get('/api/products', async (req,res)=>{
    try {
        const products = await productManager.getProducts()
        res.status(200).json({ message: 'products', products });
    } catch (error) {
        res.status(500).json({ error })
    }
});

app.get('api/products/:pid', async (req, res)=>{
    const {pid} = req.params
    try {
        const product = await productManager.getProductById()
    } catch (error) {
        res.status.apply(500).json({ error });
    } 
});