const express = require('express');
const botanistController = require('../controllers/botanistController');

const router = express.Router();

router.get('/', botanistController.getAll);
router.get('/:id', botanistController.getOne);
router.post('/', botanistController.create);
router.put('/:id', botanistController.update);
router.delete('/:id', botanistController.delete);

module.exports = router;
