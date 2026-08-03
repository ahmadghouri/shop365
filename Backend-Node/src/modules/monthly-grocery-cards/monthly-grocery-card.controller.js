const mongoose = require('mongoose');
const MonthlyGroceryCard = require('./monthly-grocery-card.model');
const Product = require('../products/product.model');
const Business = require('../businesses/business.model');
const { successResponse, errorResponse } = require('../../utils/api-response');

const cardPopulate = {
  path: 'items.product_id',
  options: { virtuals: true },
  populate: {
    path: 'business_id',
    select: 'name type category_id parent_id',
    populate: { path: 'category_id', select: 'name' },
  },
};

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function validQuantity(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity >= 1;
}

async function populatedCard(cardId, userId) {
  return MonthlyGroceryCard.findOne({ _id: cardId, user_id: userId }).populate(cardPopulate);
}

async function isGroceryProduct(product) {
  const business = product.business_id;
  if (!business) return false;

  // Check type field, populated category name, or raw category_id.name
  const names = [
    business.type,
    typeof business.category_id === 'object' ? business.category_id?.name : undefined,
  ];

  // Also check parent business if it's a child provider
  if (business.parent_id) {
    const parent = await Business.findById(business.parent_id).populate('category_id', 'name');
    if (parent) {
      names.push(parent.type, parent.category_id?.name);
    }
  }

  return names.some((name) => String(name || '').trim().toLowerCase() === 'grocery');
}

async function listCards(req, res, next) {
  try {
    const cards = await MonthlyGroceryCard.find({ user_id: req.user._id })
      .populate(cardPopulate)
      .sort({ createdAt: -1 });
    successResponse(res, { cards }, 'Monthly grocery cards retrieved');
  } catch (error) { next(error); }
}

async function createCard(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    if (!name || name.length > 50) {
      return errorResponse(res, 'Card name is required and must be 50 characters or fewer', 422);
    }

    const card = await MonthlyGroceryCard.create({ user_id: req.user._id, name });
    const populated = await populatedCard(card._id, req.user._id);
    return successResponse(res, { card: populated }, 'Monthly grocery card created', 201);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 'A card with this name already exists', 409);
    }
    next(error);
  }
}

async function getCard(req, res, next) {
  try {
    if (!isObjectId(req.params.cardId)) return errorResponse(res, 'Invalid card ID', 422);
    const card = await populatedCard(req.params.cardId, req.user._id);
    if (!card) return errorResponse(res, 'Monthly grocery card not found', 404);
    successResponse(res, { card }, 'Monthly grocery card retrieved');
  } catch (error) { next(error); }
}

async function deleteCard(req, res, next) {
  try {
    if (!isObjectId(req.params.cardId)) return errorResponse(res, 'Invalid card ID', 422);
    const card = await MonthlyGroceryCard.findOneAndDelete({
      _id: req.params.cardId,
      user_id: req.user._id,
    });
    if (!card) return errorResponse(res, 'Monthly grocery card not found', 404);
    successResponse(res, null, 'Monthly grocery card deleted');
  } catch (error) { next(error); }
}

async function addItem(req, res, next) {
  try {
    const { cardId } = req.params;
    const { product_id: productId, quantity = 1, variant } = req.body;
    if (!isObjectId(cardId) || !isObjectId(productId)) {
      return errorResponse(res, 'Invalid card or product ID', 422);
    }
    if (!validQuantity(quantity)) {
      return errorResponse(res, 'Quantity must be a whole number of at least 1', 422);
    }

    const [card, product] = await Promise.all([
      MonthlyGroceryCard.findOne({ _id: cardId, user_id: req.user._id }),
      Product.findOne({
        _id: productId,
        status: true,
        is_active: true,
        $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
      }).populate({
        path: 'business_id',
        populate: { path: 'category_id', select: 'name' },
      }),
    ]);
    if (!card) return errorResponse(res, 'Monthly grocery card not found', 404);
    if (!product) return errorResponse(res, 'Active product not found', 404);
    if (!(await isGroceryProduct(product))) {
      return errorResponse(res, 'Only Grocery products can be added to a monthly grocery card', 422);
    }

    const variantName = variant?.name || '';
    const existing = card.items.find((item) =>
      String(item.product_id) === String(productId) &&
      (item.variant?.name || '') === variantName
    );
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      const newItem = { product_id: productId, quantity: Number(quantity), checked: false };
      if (variant && variant.name) {
        newItem.variant = { name: variant.name, price: Number(variant.price || 0) };
      }
      card.items.push(newItem);
    }
    await card.save();

    const populated = await populatedCard(cardId, req.user._id);
    successResponse(res, { card: populated }, 'Product added to monthly grocery card');
  } catch (error) { next(error); }
}

async function updateItem(req, res, next) {
  try {
    const { cardId, itemId } = req.params;
    if (!isObjectId(cardId) || !isObjectId(itemId)) {
      return errorResponse(res, 'Invalid card or item ID', 422);
    }
    const updates = {};
    if (Object.prototype.hasOwnProperty.call(req.body, 'quantity')) {
      if (!validQuantity(req.body.quantity)) {
        return errorResponse(res, 'Quantity must be a whole number of at least 1', 422);
      }
      updates.quantity = Number(req.body.quantity);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'checked')) {
      if (typeof req.body.checked !== 'boolean') {
        return errorResponse(res, 'Checked must be true or false', 422);
      }
      updates.checked = req.body.checked;
    }
    if (!Object.keys(updates).length) return errorResponse(res, 'No valid item changes supplied', 422);

    const card = await MonthlyGroceryCard.findOne({ _id: cardId, user_id: req.user._id });
    if (!card) return errorResponse(res, 'Monthly grocery card not found', 404);
    const item = card.items.id(itemId);
    if (!item) return errorResponse(res, 'Monthly grocery item not found', 404);
    Object.assign(item, updates);
    await card.save();

    const populated = await populatedCard(cardId, req.user._id);
    successResponse(res, { card: populated }, 'Monthly grocery item updated');
  } catch (error) { next(error); }
}

async function removeItem(req, res, next) {
  try {
    const { cardId, itemId } = req.params;
    if (!isObjectId(cardId) || !isObjectId(itemId)) {
      return errorResponse(res, 'Invalid card or item ID', 422);
    }
    const card = await MonthlyGroceryCard.findOne({ _id: cardId, user_id: req.user._id });
    if (!card) return errorResponse(res, 'Monthly grocery card not found', 404);
    const item = card.items.id(itemId);
    if (!item) return errorResponse(res, 'Monthly grocery item not found', 404);
    item.deleteOne();
    await card.save();

    const populated = await populatedCard(cardId, req.user._id);
    successResponse(res, { card: populated }, 'Product removed from monthly grocery card');
  } catch (error) { next(error); }
}

module.exports = {
  listCards,
  createCard,
  getCard,
  deleteCard,
  addItem,
  updateItem,
  removeItem,
};