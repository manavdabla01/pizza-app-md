const express = require('express');
const { getSideItems } = require('../controllers/sideItemController');

const router = express.Router();

router.get('/getItems', getSideItems);

module.exports = router;
