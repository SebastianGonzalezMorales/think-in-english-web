export function notFound(req, res) {
  res.status(404).json({ message: 'Ruta no encontrada.' });
}

export function handleError(error, req, res, next) { // eslint-disable-line no-unused-vars
  if (error?.code === 11000) return res.status(409).json({ message: 'Ese registro ya existe.' });
  if (error?.name === 'ZodError') {
    return res.status(400).json({ message: error.issues[0]?.message ?? 'Datos inválidos.' });
  }
  console.error(error);
  return res.status(500).json({ message: 'Ocurrió un error inesperado.' });
}
