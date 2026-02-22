import prisma from '../lib/prisma.js';
import { parseStars, sanitizeText } from '../middleware/validation.js';

export async function createReview(req, res) {
  const providerId = Number(req.params.id);
  const stars = parseStars(req.body.stars);
  const comment = sanitizeText(req.body.comment);

  if (!stars || !comment) {
    req.flash('error', 'Debes indicar estrellas (1-5) y comentario.');
    return res.redirect(`/providers/${providerId}`);
  }

  try {
    await prisma.review.create({
      data: {
        providerId,
        userId: req.session.user.id,
        stars,
        comment
      }
    });
  } catch {
    req.flash('error', 'Ya dejaste una reseña para este proveedor.');
    return res.redirect(`/providers/${providerId}`);
  }

  const aggregate = await prisma.review.aggregate({
    where: { providerId },
    _avg: { stars: true },
    _count: { id: true }
  });

  await prisma.provider.update({
    where: { id: providerId },
    data: {
      ratingAvg: Number(aggregate._avg.stars || 0),
      reviewCount: aggregate._count.id
    }
  });

  req.flash('success', 'Reseña publicada.');
  return res.redirect(`/providers/${providerId}`);
}
