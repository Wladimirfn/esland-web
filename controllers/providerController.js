import prisma from '../lib/prisma.js';
import { sanitizeText } from '../middleware/validation.js';

export async function providerProfile(req, res) {
  const providerId = Number(req.params.id);

  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      owner: true,
      gallery: true,
      reviews: {
        include: {
          user: true,
          providerReply: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!provider) {
    req.flash('error', 'Proveedor no encontrado.');
    return res.redirect('/');
  }

  return res.render('providers/profile', {
    title: `${provider.companyName} - Perfil de proveedor`,
    provider
  });
}

export async function updatePlanMock(req, res) {
  const providerId = Number(req.params.id);
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });

  if (!provider) {
    req.flash('error', 'Proveedor no encontrado.');
    return res.redirect('/');
  }

  if (provider.ownerId !== req.session.user.id && req.session.user.role !== 'ADMIN') {
    req.flash('error', 'No puedes cambiar este plan.');
    return res.redirect(`/providers/${providerId}`);
  }

  await prisma.provider.update({
    where: { id: providerId },
    data: {
      plan: 'PRO',
      featured: true
    }
  });

  req.flash('success', 'Plan PRO activado (Mock). TODO: integrar Flow o MercadoPago.');
  return res.redirect(`/providers/${providerId}`);
}

export async function respondReview(req, res) {
  const reviewId = Number(req.params.reviewId);
  const reply = sanitizeText(req.body.reply);

  if (!reply) {
    req.flash('error', 'La respuesta no puede estar vacía.');
    return res.redirect('back');
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { provider: true }
  });

  if (!review) {
    req.flash('error', 'Reseña no encontrada.');
    return res.redirect('/');
  }

  if (review.provider.ownerId !== req.session.user.id && req.session.user.role !== 'ADMIN') {
    req.flash('error', 'No tienes permisos para responder esta reseña.');
    return res.redirect(`/providers/${review.providerId}`);
  }

  await prisma.reviewProviderReply.upsert({
    where: { reviewId: review.id },
    create: {
      reviewId: review.id,
      providerUserId: req.session.user.id,
      reply
    },
    update: {
      reply
    }
  });

  req.flash('success', 'Respuesta publicada.');
  return res.redirect(`/providers/${review.providerId}`);
}
