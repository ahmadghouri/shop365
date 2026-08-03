const { Router } = require('express');
const ctrl = require('./monthly-grocery-card.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = Router();

router.get('/monthly-grocery-cards', authenticate, ctrl.listCards);
router.post('/monthly-grocery-cards', authenticate, ctrl.createCard);
router.get('/monthly-grocery-cards/:cardId', authenticate, ctrl.getCard);
router.delete('/monthly-grocery-cards/:cardId', authenticate, ctrl.deleteCard);
router.post('/monthly-grocery-cards/:cardId/items', authenticate, ctrl.addItem);
router.patch('/monthly-grocery-cards/:cardId/items/:itemId', authenticate, ctrl.updateItem);
router.delete('/monthly-grocery-cards/:cardId/items/:itemId', authenticate, ctrl.removeItem);

module.exports = router;