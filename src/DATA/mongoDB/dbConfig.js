import mongoose from 'mongoose';
import config from '../../config.js';

const URI = config.mongoUrl;
mongoose.connect(URI)
  .then(() => console.log('Connected to the database'))
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });