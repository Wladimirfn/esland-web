import prisma from '../lib/prisma.js';

export async function productsIndex(req, res) {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return res.render('home/products', {
    title: 'Productos y manuales',
    products
  });
}
