const experss = require('express');
const router = experss.Router();
const { check, validationResult } = require('express-validator');
var ObjectId = require('mongoose').Types.ObjectId;
const config = require('config');
const User = require('../../models/User');

// get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});

    if (!users) {
      return res.status(400).json({ errors: [{ msg: 'No users found' }] });
    }
    return res.send(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: 'Something went wrong' }] });
  }
});

// get user by email
router.get('/:email', async (req, res) => {
  try {
    let email = req.params.email;
    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'No user found' }] });
    }
    return res.send(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: 'Something went wrong' }] });
  }
});

// create new user
router.post(
  '/create',
  [
    check('email', 'Email is required')
      .trim()
      .isEmail(),
    check('name', 'Name is required')
      .trim()
      .notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let {
        email,
        name,
        walletCurrency,
        walletBalance,
        walletCurrencySymbol
      } = req.body;
      walletCurrency = walletCurrency.trim().toUpperCase();
      const currency = config.get('currencies')[walletCurrency];
      if (!currency) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid wallet Currency' }] });
      }
      email = email.trim().toLowerCase();
      name = name.trim();
      walletCurrencySymbol = currency.symbol;

      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'user already exist' }] });
      }
      user = new User({
        email,
        name,
        walletCurrency,
        walletBalance,
        walletCurrencySymbol
      });
      await user.save();
      return res.send(user);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ errors: [{ msg: 'Something went wrong' }] });
    }
  }
);

// add balance by user email
router.put(
  '/balance/add/:email',
  [check('amount', 'amount required').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let { amount } = req.body;
      let email = req.params.email;
      email = email.trim().toLowerCase();
      const user = await User.findOneAndUpdate(
        { email },
        { $inc: { walletBalance: amount } },
        { new: true }
      );
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User account not found' }] });
      }

      return res.send(user);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ errors: [{ msg: 'Something went wrong' }] });
    }
  }
);

// add balance by user email
router.put(
  '/balance/reduce/:email',
  [check('amount', 'amount required').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let { amount } = req.body;
      amount = amount;
      let email = req.params.email;
      email = email.trim().toLowerCase();

      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'No user found' }] });
      }
      // check balance can be reduced or not
      const currentBalance = user.walletBalance;
      if (currentBalance < amount) {
        return res.status(400).json({
          errors: [{ msg: 'Balance is too low to reduce', type: 'LOW_BALANCE' }]
        });
      }
      user = await User.findOneAndUpdate(
        { email },
        { $inc: { walletBalance: -amount } },
        { new: true }
      );
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User account not found' }] });
      }

      return res.send(user);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ errors: [{ msg: 'Something went wrong' }] });
    }
  }
);

module.exports = router;
