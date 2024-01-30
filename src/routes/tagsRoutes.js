const express = require('express');
const tagsController = require('../controllers/tagsController');

const router = express.Router();

router.get('/', tagsController.getAll);
router.get('/:id', tagsController.getOne);
router.post('/', tagsController.create);
router.put('/:id', tagsController.update);
router.delete('/:id', tagsController.delete);

module.exports = router;
