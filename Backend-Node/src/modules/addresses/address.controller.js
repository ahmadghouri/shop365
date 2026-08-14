const Address = require("./address.model");

// GET /addresses
exports.list = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user_id: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ status: true, message: "Addresses", data: addresses });
  } catch (err) {
    next(err);
  }
};

// POST /addresses
exports.create = async (req, res, next) => {
  try {
    const { label, address, street, area, city, latitude, longitude } =
      req.body;
    const doc = await Address.create({
      user_id: req.user._id,
      label,
      address,
      street,
      area,
      city,
      latitude,
      longitude,
    });
    res
      .status(201)
      .json({ status: true, message: "Address created", data: doc });
  } catch (err) {
    next(err);
  }
};

// PUT /addresses/:id/activate  — set as active, deactivate others
exports.activate = async (req, res, next) => {
  try {
    await Address.updateMany({ user_id: req.user._id }, { is_active: false });
    const doc = await Address.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { is_active: true },
      { returnDocument: "after" },
    );
    if (!doc)
      return res
        .status(404)
        .json({ status: false, message: "Address not found" });
    res.json({ status: true, message: "Address activated", data: doc });
  } catch (err) {
    next(err);
  }
};

// DELETE /addresses/:id
exports.remove = async (req, res, next) => {
  try {
    await Address.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });
    res.json({ status: true, message: "Address deleted", data: null });
  } catch (err) {
    next(err);
  }
};

// PUT /addresses/:id
exports.update = async (req, res, next) => {
  try {
    const allowed = [
      "label",
      "address",
      "street",
      "area",
      "city",
      "latitude",
      "longitude",
    ];
    const fields = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k)),
    );
    const doc = await Address.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      fields,
      { returnDocument: "after", runValidators: true },
    );
    if (!doc)
      return res
        .status(404)
        .json({ status: false, message: "Address not found" });
    res.json({ status: true, message: "Address updated", data: doc });
  } catch (err) {
    next(err);
  }
};
