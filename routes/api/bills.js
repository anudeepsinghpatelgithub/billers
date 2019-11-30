const experss = require('express');
const router = experss.Router();
const { check, validationResult } = require('express-validator');

// load model

const Biller = require('../../models/Biller')
const Bill = require('../../models/Bill')

// get all bills for any user
router.get('/',async(req,res)=>{
    try {
        let bills = await Bill.find();
        if (!bills) {
            return res.status(400).json({ errors: [{ msg: 'No bills found' }] });
        }
        res.send(bills)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ errors: [{ msg: 'Something went wrong' }] });
    }
    
});
// get all bills by email/phone
router.get('/:emailOrPhone',async (req,res)=>{
    try {
        let bills = await Bill.find({
            $or: [
                { email: req.params.emailOrPhone },
                { mobile: req.params.emailOrPhone }
            ]
        });
        //let bills = await Bill.find({ email: req.params.emailOrPhone}).populate("biller");
        if (!bills) {
            return res.status(400).json({ errors: [{ msg: 'No bills found' }] });
        }
        res.send(bills)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ errors: [{ msg: 'Something went wrong' }] });
    }
});

// create new bill for given biller
router.post('/publish',[
    check('email','Email is required').trim().isEmail(),
    check('mobile', 'Mbile is required with country code e.g. 9999999999').trim().isLength({min:10,max:10}),
    check('amount', 'Amount is required').trim().notEmpty(),
    check('billerName', 'BillerName is required').trim().notEmpty(),
    check('billStartDate', 'Bill start date is requiried/invalid').trim().isISO8601(),
    check('billEndDate', 'Bill end date is requiried/invalid/should be after start date').trim().isISO8601()
    
],async (req,res)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let { email, mobile, amount, billerName, billStartDate, billEndDate} = req.body;
        email = email.trim().toLowerCase();
        billStartDate = new Date(billStartDate);
        billEndDate = new Date(billEndDate);
        billerName = billerName.trim().toLowerCase();
        try {
            let biller = await Biller.findOne({ name: billerName });
            if (!biller) {
                return res.status(400).json({ errors: [{ msg: 'UnSupported biller' }] });
            }
            // lets create new bill for biller and user
            let bill = new Bill({
                email,
                mobile,
                amount,
                billStartDate,
                billEndDate,
                biller:biller._id

            });
            await bill.save();
            return res.send(bill)
        } catch (error) {
            console.log(error);
            return res.status(500).json({ errors: [{ msg: 'Something went wrong' }] });
        } 
})
// mark bill as paid using bill id
router.put('/paid/:id', [check('paidChannel','paidChannel required').notEmpty()],async(req,res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let update = {
            paidDate: new Date(),
            paidChannel: req.body.paidChannel.trim().toLowerCase(),
            paid: true,

        }

       let bill = await Bill.findById({ _id: req.params.id});
        
        if (!bill){
            return res.status(400).json({ errors: [{ msg: 'Bill doesnot exist' }] });
        }
        // check if bill already paid
        if(bill.paid){
            return res.status(400).json({ errors: [{ msg: 'Bill already paid' }] });
        }
        let markPaid = await Bill.findByIdAndUpdate(
            { _id: req.params.id },
            { $set: update },
            { new: true }
        );
        res.send(markPaid)
    } catch (error) {
        console.log(error)
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ errors: [{ msg: 'Bill doesnot exist' }] });
        }
        return res.status(500).json({ errors: [{ msg: 'Something went wrong' }] });
    }

});

module.exports = router;