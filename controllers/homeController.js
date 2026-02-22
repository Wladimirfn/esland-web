import prisma from '../lib/prisma.js';
import { sanitizeText } from '../middleware/validation.js';

export async function home(req, res) {
  const query = sanitizeText(req.query.q || '');
  const category = sanitizeText(req.query.category || '');
  const sort = sanitizeText(req.query.sort || 'rating_desc');

  const where = {
    ...(category ? { category } : {}),
    ...(query
      ? {
          OR: [
            { companyName: { contains: query } },
            { description: { contains: query } }
          ]
        }
      : {})
  };

  const providers = await prisma.provider.findMany({
    where,
    orderBy: sort === 'rating_asc' ? { ratingAvg: 'asc' } : { ratingAvg: 'desc' },
    include: {
      gallery: true
    }
  });

  return res.render('home/index', {
    title: 'IndustrialHub - Proveedores Industriales',
    providers,
    filters: { query, category, sort }
  });
}
