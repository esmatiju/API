const express = require('express');
const gardenController = require('../controllers/gardenController');

const router = express.Router();

router.get('/', gardenController.getAll);
router.get('/:id', gardenController.getOne);
router.post('/', gardenController.create);
router.put('/:id', gardenController.update);
router.delete('/:id', gardenController.delete);

module.exports = router;
