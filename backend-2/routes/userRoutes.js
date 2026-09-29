const express = require('express');

const userController = require('../controller/userController');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get('/', userController.getAllUsers);

router.post(
    '/',
    validateRequest(['name', 'email']),
    userController.createUser
);

router.get('/:id', userController.getUserById);

router.put('/:id', userController.updateUser);

router.delete('/:id', userController.deleteUser);

module.exports = router;