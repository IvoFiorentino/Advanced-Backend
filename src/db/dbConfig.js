import mongoose from 'mongoose'

//CONFIG MONGOOSE
const URI = 'mongodb+srv://ivofiorentino0:uX0hI0GHRkmCsBFK@cluster0.cnfy4dr.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(URI)
.then(()=> console.log('connected to database'))
.catch((error) => {
    console.error('fail to connect to database:', error);
});
