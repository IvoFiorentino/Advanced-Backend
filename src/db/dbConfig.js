import mongoose from 'mongoose'

//CONFIG MONGOOSE
///// const URI = DATABASE REMAINS //////
mongoose.connect(URI)
.then(()=> console.log('connected to database'))
.catch((error) => {
    console.error('fail to connect to database:', error);
});
