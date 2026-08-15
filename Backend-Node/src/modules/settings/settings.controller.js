const Setting = require('./settings.model');
const { successResponse } = require('../../utils/api-response');

async function getSettings(req, res, next) {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({ min_order_price: 0, delivery_fee: 150 });
    }
    successResponse(res, settings, 'Settings retrieved successfully');
  } catch (error) { next(error); }
}

async function updateSettings(req, res, next) {
  try {
    const { min_order_price, delivery_fee } = req.body;
    const settings = await Setting.findOneAndUpdate(
      {},
      { min_order_price, delivery_fee },
      { upsert: true, new: true },
    );
    successResponse(res, settings, 'Settings updated successfully');
  } catch (error) { next(error); }
}

module.exports = { getSettings, updateSettings };
