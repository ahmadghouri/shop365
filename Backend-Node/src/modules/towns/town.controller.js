const Town = require('./town.model');
const { successResponse } = require('../../utils/api-response');

async function index(req, res, next) {
  try {
    const towns = await Town.find();
    successResponse(res, towns, 'list of towns');
  } catch (error) { next(error); }
}

async function store(req, res, next) {
  try {
    await Town.create(req.body);
    successResponse(res, null, 'Town created successfully', 201);
  } catch (error) { next(error); }
}

async function show(req, res, next) {
  try {
    const town = await Town.findById(req.params.id);
    if (!town) return res.status(404).json({ message: 'Town not found' });
    successResponse(res, town, 'Town Found', 201);
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const town = await Town.findById(req.params.id);
    if (!town) return res.status(404).json({ message: 'Town not found' });
    Object.assign(town, req.body);
    await town.save();
    successResponse(res, town, 'Town updated successfully');
  } catch (error) { next(error); }
}

async function destroy(req, res, next) {
  try {
    const town = await Town.findById(req.params.id);
    if (!town) return res.status(404).json({ message: 'Town not found' });
    await Town.findByIdAndDelete(req.params.id);
    successResponse(res, null, 'Deleted successfully', 201);
  } catch (error) { next(error); }
}

module.exports = { index, store, show, update, destroy };
