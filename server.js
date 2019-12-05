const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors')


const app = express();
// connect to db
connectDB();
// init middleware
app.use(express.json({extended:false}))


const PORT = process.env.PORT || 5000;

app.use(cors())

app.get('/',(req,res)=>{
    res.send({msg:'api running'});
});
app.use('/api/bills',require('./routes/api/bills'));
app.use('/api/billers', require('./routes/api/billers'));
app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`)
});