const router = require('express').Router();
const { getError } = require('../controllers/not-found');

router.get('/', getError);

module.exports = router;
