import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();

//CONFIG MONGOOSE
mongoose.connect(process.env.MONGO_URL)
.then(()=> console.log('Connected to database'))
.catch((error) => {
    console.error('fail to connect to database:', error);
});
