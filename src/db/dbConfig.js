import mongoose from 'mongoose'

//CONFIG MONGOOSE
const URI = 'mongodb+srv://ivofiorentino0:vAUaOtrcWBzUJ5EG@ecommerceivof.jl3fssh.mongodb.net/EcommerceivoF?retryWrites=true&w=majority'
mongoose.connect(URI)
.then(()=> console.log('Connected to database'))
.catch((error) => {
    console.error('fail to connect to database:', error);
});
