const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI');

connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true
    });
    console.log('db connected....');
  } catch (error) {
    console.log(`Connection to db faild: ${error}`);
    process.exit(1);
  }
};

module.exports = connectDB;
