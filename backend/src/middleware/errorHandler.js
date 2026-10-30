export const notFound = (req, res) => res.status(404).json({ message: 'Not found.' });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err.name === 'CastError') return res.status(404).json({ message: 'Not found.' });
  if (err.name === 'ZodError') return res.status(422).json({ message: 'Invalid input.' });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Server error.' : err.message, details: err.details });
};
