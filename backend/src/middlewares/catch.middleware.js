export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .json({ message: "Error interno del servidor", error: err.message });
};
