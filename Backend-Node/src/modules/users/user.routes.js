const { Router } = require('express');
const router = Router();
const ctrl = require('./user.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Laravel: GET /refreshUser (under auth)
router.get('/refreshUser', authenticate, ctrl.refreshUser);

// Laravel: PUT /update/{id}
router.put('/update/:id', ctrl.updateUser);

// Laravel: DELETE /users/cleanup
router.delete('/users/cleanup', ctrl.deleteUsers);

module.exports = router;
