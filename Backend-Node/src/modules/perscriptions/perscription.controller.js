const Perscription = require('./perscription.model');

async function store(req, res, next) {
  try {
    if (!req.body.product || !req.body.product.prescription || !req.body.product.prescription.prescription_description || !req.body.product.prescription.prescription_image) {
      return res.status(422).json({ message: 'Validation failed' });
    }
    const userId = req.user._id;
    const imageUrl = req.body.product.prescription.prescription_image;
    const perscription = await Perscription.create({
      user_id: userId,
      description: req.body.product.prescription.prescription_description,
      image_url: imageUrl,
    });
    res.status(201).json(perscription);
  } catch (error) { next(error); }
}

module.exports = { store };
