// Express middleware: checks req.body against a Zod schema. On success the
// body is replaced by the parsed result (trimmed, coerced, unknown keys
// dropped); on failure the request ends with a 400 and a readable message.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join('. ');
    return res.status(400).json({ error: message });
  }
  req.body = result.data;
  next();
};

module.exports = { validate };
