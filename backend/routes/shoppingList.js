import express from 'express';
const router = express.Router();
import * as shoppingListController from '../controllers/shoppingListController.js';
import authMiddleware from '../middleware/auth.js';

// All routes are protected
router.use(authMiddleware);

router.get('/', shoppingListController.getShoppingList);

// Specific POST routes before generic ones
router.post('/generate', shoppingListController.generateFromMealPlan);
router.post('/add-to-pantry', shoppingListController.addCheckedToPantry);
router.post('/', shoppingListController.addItem);

// Specific PUT routes before parameterized /:id
router.put('/:id/toggle', shoppingListController.toggleChecked);
router.put('/:id', shoppingListController.updateItem);

// Specific DELETE routes MUST come before /:id to avoid Express matching "clear" as an id
router.delete('/clear/checked', shoppingListController.clearChecked);
router.delete('/clear/all', shoppingListController.clearAll);
router.delete('/:id', shoppingListController.deleteItem);

export default router;