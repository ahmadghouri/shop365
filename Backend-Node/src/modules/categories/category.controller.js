const Category = require('./category.model');
const { successResponse } = require('../../utils/api-response');

async function index(req, res, next) {
  try {
    const filter = req.query.all === 'true' ? {} : { status: 'active' };
    const categories = await Category.find(filter).sort({ sort_order: 1, createdAt: 1 });
    successResponse(res, categories, 'Categories retrieved successfully');
  } catch (error) { next(error); }
}

async function show(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    successResponse(res, category, 'Category retrieved successfully');
  } catch (error) { next(error); }
}

async function store(req, res, next) {
  try {
    const data = pickCategoryFields(req.body);
    const category = await Category.create(data);
    successResponse(res, category, 'Category created successfully', 201);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      pickCategoryFields(req.body),
      { returnDocument: 'after', runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    successResponse(res, category, 'Category updated successfully');
  } catch (error) { next(error); }
}


async function destroy(req, res, next) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    successResponse(res, null, 'Category deleted successfully');
  } catch (error) { next(error); }
}

function pickCategoryFields(body) {
  const data = {};
  const allowed = ['name', 'subtitle', 'image', 'status', 'sort_order'];
  for (const field of allowed) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (data.image && typeof data.image !== 'string') delete data.image;
  return data;
}

module.exports = { index, show, store, update, destroy };
