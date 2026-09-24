const router = require ('express').Router();
const userController = require('../controller/User.controller');

router.get('/users', userController.getAllUsers);
router.post('/users', userController.createUser);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.getUserById);
router.delete('/users/:id', userController.deleteUserById);

module.exports = router;