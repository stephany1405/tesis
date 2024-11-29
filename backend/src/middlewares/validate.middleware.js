import { validationResult } from 'express-validator';

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(403).json({ errors: errorMessages });
  }
  next();
};

export default validateResult;