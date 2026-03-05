const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const validateUUID = (paramName = 'id') => (req, res, next) => {
  const val = req.params[paramName];
  if (val && !UUID_REGEX.test(val)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  next();
};

module.exports = validateUUID;
