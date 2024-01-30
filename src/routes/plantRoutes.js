const express = require('express');
const plantController = require('../controllers/plantController');

const router = express.Router();

router.get('/', plantController.getAll);
router.get('/:id', plantController.getOne);
router.post('/', plantController.create);
router.put('/:id', plantController.update);
router.delete('/:id', plantController.delete);

module.exports = router;
