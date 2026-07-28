function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      const issues = error.issues || error.errors || [];
      const errors = {};
      issues.forEach((err) => {
        const path = (err.path || []).join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      // Laravel returns 422 for validation with message + errors
      res.status(422).json({ message: 'Validation failed', errors });
    }
  };
}

module.exports = { validate };
