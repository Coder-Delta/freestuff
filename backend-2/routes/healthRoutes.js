const express = require('express');
const healthController = require('../controller/healthController');
const router = express.Router();

router.get('/', healthController.getHealth);
router.get('/version', healthController.getVersion);

module.exports = router;
