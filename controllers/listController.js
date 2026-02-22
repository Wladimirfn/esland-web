import prisma from '../lib/prisma.js';
import { sanitizeText } from '../middleware/validation.js';

const FREE_LIST_LIMIT = 1;
const FREE_PROVIDER_LIMIT = 10;

export async function myLists(req, res) {
  const lists = await prisma.list.findMany({
    where: { userId: req.session.user.id },
    include: {
      providers: {
        include: { provider: true }
      }
    }
  });

  return res.render('home/lists', {
    title: 'Mis listas guardadas',
    lists,
    freeLimits: {
      FREE_LIST_LIMIT,
      FREE_PROVIDER_LIMIT
    }
  });
}

export async function createList(req, res) {
  const name = sanitizeText(req.body.name);
  if (!name) {
    req.flash('error', 'Nombre de lista requerido.');
    return res.redirect('/lists');
  }

  const user = await prisma.user.findUnique({ where: { id: req.session.user.id } });
  const totalLists = await prisma.list.count({ where: { userId: user.id } });

  if (user.subscription === 'FREE' && totalLists >= FREE_LIST_LIMIT) {
    req.flash('error', 'Mejora tu plan: FREE permite solo 1 lista.');
    return res.redirect('/lists');
  }

  await prisma.list.create({
    data: {
      userId: user.id,
      name
    }
  });

  req.flash('success', 'Lista creada.');
  return res.redirect('/lists');
}

export async function saveProvider(req, res) {
  const providerId = Number(req.params.providerId);
  const listId = Number(req.body.listId);

  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { user: true, providers: true }
  });

  if (!list || list.userId !== req.session.user.id) {
    req.flash('error', 'Lista inválida.');
    return res.redirect('back');
  }

  if (list.user.subscription === 'FREE' && list.providers.length >= FREE_PROVIDER_LIMIT) {
    req.flash('error', 'Mejora tu plan: FREE permite máximo 10 proveedores por lista.');
    return res.redirect('/lists');
  }

  await prisma.listProvider.upsert({
    where: {
      listId_providerId: {
        listId,
        providerId
      }
    },
    create: {
      listId,
      providerId
    },
    update: {}
  });

  req.flash('success', 'Proveedor guardado en tu lista.');
  return res.redirect('/lists');
}

export async function activatePro(req, res) {
  await prisma.user.update({
    where: { id: req.session.user.id },
    data: { subscription: 'PRO' }
  });

  req.session.user.subscription = 'PRO';

  req.flash('success', 'Plan PRO activado (Mock). TODO: integrar Flow o MercadoPago.');
  return res.redirect('/lists');
}
