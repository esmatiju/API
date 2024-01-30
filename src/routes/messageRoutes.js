const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.get('/', messageController.getAll);
router.get('/:id', messageController.getOne);
router.post('/', messageController.create);
router.put('/:id', messageController.update);
router.delete('/:id', messageController.delete);

module.exports = router;
