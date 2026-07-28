const HeaderImage = require('./header-image.model');
const { successResponse } = require('../../utils/api-response');

async function index(req, res, next) {
  try {
    const images = await HeaderImage.find().sort({ order: 1 });
    res.json(images);
  } catch (error) { next(error); }
}

async function store(req, res, next) {
  try {
    const imagePath = req.body.image_path || '/images/placeholder.jpg';
    const count = await HeaderImage.countDocuments();
    const headerImage = await HeaderImage.create({
      title: req.body.title,
      description: req.body.description,
      image_path: imagePath,
      order: req.body.order || count,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
    });
    res.status(201).json({ message: 'Image uploaded successfully', data: headerImage });
  } catch (error) { next(error); }
}

async function show(req, res, next) {
  try {
    const image = await HeaderImage.findById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Header image not found' });
    res.json(image);
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const headerImage = await HeaderImage.findById(req.params.id);
    if (!headerImage) return res.status(404).json({ message: 'Header image not found' });
    if (req.body.title !== undefined) headerImage.title = req.body.title;
    if (req.body.description !== undefined) headerImage.description = req.body.description;
    if (req.body.order !== undefined) headerImage.order = req.body.order;
    if (req.body.is_active !== undefined) headerImage.is_active = req.body.is_active;
    if (req.body.image_path) headerImage.image_path = req.body.image_path;
    await headerImage.save();
    res.json({ message: 'Image updated successfully', data: headerImage });
  } catch (error) { next(error); }
}

async function destroy(req, res, next) {
  try {
    const image = await HeaderImage.findById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Header image not found' });
    await HeaderImage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) { next(error); }
}

async function reorder(req, res, next) {
  try {
    if (req.body.orders && Array.isArray(req.body.orders)) {
      for (const item of req.body.orders) {
        await HeaderImage.findByIdAndUpdate(item.id, { order: item.order });
      }
    }
    res.json({ message: 'Order updated successfully' });
  } catch (error) { next(error); }
}

module.exports = { index, store, show, update, destroy, reorder };
