const mongoose = require('mongoose');

const BillerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    logoUrl:{
        type:String,
        required:true
    },
    callBackUrl:{
        type:String,
        required:true
    },
    domain:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    }
});

module.exports = Biller = mongoose.model('billers', BillerSchema);