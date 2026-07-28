const Complaint = require('./complaint.model');
const { successResponse } = require('../../utils/api-response');

async function index(req, res, next) {
  try {
    let complaints;
    if (req.user && req.user.town_id && req.query.town) {
      complaints = await Complaint.find({ town_id: req.user.town_id });
      return successResponse(res, complaints, 'All Complaints of the Town');
    }
    complaints = await Complaint.find();
    successResponse(res, complaints, 'Your all complaints');
  } catch (error) { next(error); }
}

async function store(req, res, next) {
  try {
    const complaint = await Complaint.create({ ...req.body, user_id: req.user._id });
    successResponse(res, complaint, 'Complaint submitted successfully');
  } catch (error) { next(error); }
}

async function show(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    successResponse(res, complaint, 'Complain', 201);
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (req.body.status) complaint.status = req.body.status;
    await complaint.save();
    successResponse(res, complaint, 'Updated Complain', 201);
  } catch (error) { next(error); }
}

async function destroy(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    await Complaint.findByIdAndDelete(req.params.id);
    successResponse(res, null, 'Deleted Successfully');
  } catch (error) { next(error); }
}

async function complaintsOfTown(req, res, next) {
  try {
    const complaints = await Complaint.find({ town_id: req.user.town_id });
    successResponse(res, complaints, 'All Complaints of the Town');
  } catch (error) { next(error); }
}

module.exports = { index, store, show, update, destroy, complaintsOfTown };
