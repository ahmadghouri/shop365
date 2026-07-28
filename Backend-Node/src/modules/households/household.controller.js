const Household = require('./household.model');
const { successResponse } = require('../../utils/api-response');

async function update(req, res, next) {
  try {
    const householdId = req.params.id || (req.user && req.user.household_id);
    if (!householdId) return res.status(404).json({ message: 'Household not found' });
    const household = await Household.findByIdAndUpdate(householdId, req.body, { new: true });
    if (!household) return res.status(404).json({ message: 'Household not found' });
    successResponse(res, { household }, 'Household updated successfully');
  } catch (error) { next(error); }
}

module.exports = { update };
