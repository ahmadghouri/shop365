const InternshipApplication = require('./internship-application.model');

async function store(req, res, next) {
  try {
    const { full_name, email, phone, portfolio_url, academic_info } = req.body;
    if (!full_name || !email || !phone) {
      return res.status(422).json({ message: 'Validation failed', errors: { full_name: !full_name ? 'required' : undefined, email: !email ? 'required' : undefined, phone: !phone ? 'required' : undefined } });
    }
    await InternshipApplication.create({ full_name, email, phone, portfolio_url, academic_info });
    res.status(201).json({ message: 'Application submitted successfully!' });
  } catch (error) { next(error); }
}

async function index(req, res, next) {
  try {
    const applications = await InternshipApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) { next(error); }
}

module.exports = { store, index };
