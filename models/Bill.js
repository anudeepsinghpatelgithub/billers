const mongoose = require('mongoose');
const BillSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true
    },
    mobile:{
        type:String,
        required: true
    },
    amount:{
        type:Number,
        required:true
    },
    billType: {
        type: String,
        required: true
    },
    billName: {
        type: String,
        required: true
    },
    biller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'billers'
    },
    billStartDate:{
        type:Date,
        required:true,
    },
    billEndDate: {
        type: Date,
        required: true,
    },
    billDueDate: {
        type: Date,
        required: true,
    },
    paid:{
        type:Boolean,
        default:false
    },
    paidDate:{
        type:Date,
        default:null
    },
    paidChannel:{
        type:String,
        default: null
    },
    date:{
        type:Date,
        default:Date.now
    }

});

module.exports = Bill = mongoose.model('bills',BillSchema);