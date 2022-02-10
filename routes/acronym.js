const express = require('express')
const AcronymController = require('../controllers/acronym')
const router = express.Router();

router.get('/', AcronymController.findAll);
router.get('/:acronymID', AcronymController.findOne);
router.post('/', AcronymController.create);
router.patch('/:acronymID', AcronymController.update);
router.delete('/:acronymID', AcronymController.destroy);


module.exports = router