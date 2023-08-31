import mongoose from 'mongoose'

//CONFIG MONGOOSE
// const URI = 'mongodb://127.0.0.1:27017/'
mongoose.connect(URI)
.then(()=> console.log('connected to database'))
.catch((error) => {
    console.error('fail to connect to database:', error);
});
