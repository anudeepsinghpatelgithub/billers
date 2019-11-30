const experss = require('express');
const router = experss.Router();

const {check, validationResult} = require('express-validator');
// get the DB model
const Biller = require('../../models/Biller');
// GET ALL BILLERS
router.get('/', async(req, res) => {
    let billers = await Biller.find();
    if (!billers){
        return res.status(200).json([]);
    }
    res.send(billers)
});
// GET  BILLER by name
router.get('/name/:name', async (req, res) => {
    try {
        let biller = await Biller.findOne({ name: req.params.name.trim().toLowerCase() });
        if (!biller) {
            return res.status(400).json({ errors: [{ msg: 'Biller doesnot exist' }] });
        }
        res.send(biller)
    } catch (error) {
        console.log(error);        
        return res.status(500).json({ errors: [{ msg: 'Something went wrong' }] });
    } 
});
// GET  BILLER by id
router.get('/id/:id', async (req, res) => {
    try {
        let biller = await Biller.findOne({ _id: req.params.id });
        if (!biller) {
            return res.status(400).json({ errors: [{ msg: 'Biller doesnot exist' }] });
        }
        res.send(biller)
    } catch (error) {
        console.log(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ errors: [{ msg: 'Biller doesnot exist' }] });
        }
        return res.status(500).json({ errors: [{ msg: 'Something went wrong' }] });
    }
});
// CREATE  new BILLER 
router.post('/', [
    check('name', 'Name is required').trim().notEmpty(),
    check('logoUrl', 'Logo url required').trim().notEmpty(),
    check('callBackUrl', 'callBackUrl required').trim().notEmpty(),
    check('domain', 'domain required').trim().notEmpty()], async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()});
    }
    // if biller exist then return bad request
        let { name, logoUrl, callBackUrl, domain} = req.body;
        name = name.trim().toLowerCase();
        try {
            let biller = await Biller.findOne({name});
            if(biller){
                return res.status(400).json({errors:[{msg:'Biller already exist'}]});
            }
            // save the biller
            biller = new Biller({
                name,
                logoUrl,
                callBackUrl,
                domain
            })
            biller.save();
            res.send(biller)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ errors: [{ msg: 'Something went wrong' }] });
        }
});

module.exports = router;