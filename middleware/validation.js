export const sanitizeText = (value = '') => String(value).trim().replace(/[<>]/g, '');

export const parseStars = (value) => {
  const stars = Number(value);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return null;
  }
  return stars;
};
