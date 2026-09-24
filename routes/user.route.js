const router = require ('express').Router();
const userController = require('../controller/User.controller');

router.get('/api/users', userController.getAllUsers);
router.post('/api/users', userController.createUser);
router.get('/api/users/:id', userController.getUserById);
router.put('/api/users/:id', userController.getUserById);
router.delete('/api/users/:id', userController.deleteUserById);

module.exports = router;