const mongoose = require('mongoose');
const { mongoURI } = require('./config');

mongoose.set('strictQuery', true);

const connectToMongo = async () => {
  await mongoose.connect(mongoURI);
  console.log('Mongoose is connected');
};

module.exports = connectToMongo;
