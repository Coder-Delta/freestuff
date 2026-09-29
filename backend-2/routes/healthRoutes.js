const express = require('express');

const router = express.Router();

const healthController = require('../controller/healthController');

router.get('/health', healthController.getHealth);
router.get('/version', healthController.getVersion);

module.exports = router;