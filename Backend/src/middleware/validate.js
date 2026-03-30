/**
 * Generic Joi validation middleware factory.
 *
 * Wraps a Joi schema into Express middleware that validates `req.body`.
 * On failure, responds with HTTP 422 and a structured error payload:
 *   { errors: [{ field: "email", message: "..." }, ...] }
 *
 * @param {import('joi').ObjectSchema} schema - Compiled Joi schema.
 * @returns {import('express').RequestHandler}
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, ''),
    }));
    return res.status(422).json({ errors });
  }

  // Replace req.body with the validated & stripped value
  req.body = value;
  return next();
};

module.exports = validate;
