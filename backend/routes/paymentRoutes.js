/**
 * Payment Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { processPayment, getPaymentHistory } = require('../controllers/paymentController');

router.use(protect);

router.post('/process', processPayment);
router.get('/history', getPaymentHistory);

module.exports = router;
