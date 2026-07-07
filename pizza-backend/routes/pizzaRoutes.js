const express = require('express');
const { getPizzas, getPizzaById } = require('../controllers/pizzaController');

const router = express.Router();

router.get('/', getPizzas);
router.get('/:pizzaId', getPizzaById);

module.exports = router;
