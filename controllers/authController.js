import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { sanitizeText } from '../middleware/validation.js';

export function showLogin(req, res) {
  return res.render('auth/login', { title: 'Iniciar sesión' });
}

export function showRegister(req, res) {
  return res.render('auth/register', { title: 'Registro' });
}

export async function register(req, res) {
  const { name, email, password, role, legalImagesAccepted } = req.body;

  const cleanName = sanitizeText(name);
  const cleanEmail = sanitizeText(email).toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    req.flash('error', 'Completa todos los campos obligatorios.');
    return res.redirect('/auth/register');
  }

  if (role === 'PROVIDER' && legalImagesAccepted !== 'on') {
    req.flash('error', 'Debes aceptar la declaración legal de imágenes para proveedores.');
    return res.redirect('/auth/register');
  }

  const alreadyExists = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (alreadyExists) {
    req.flash('error', 'Ya existe una cuenta con ese correo.');
    return res.redirect('/auth/login');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const safeRole = role === 'PROVIDER' ? 'PROVIDER' : 'USER';

  const user = await prisma.user.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: safeRole,
      provider: safeRole === 'PROVIDER' ? {
        create: {
          companyName: `${cleanName} Servicios Industriales`,
          description: 'Completa tu descripción empresarial en el panel.',
          contactEmail: cleanEmail,
          category: 'MECANICO',
          legalImagesAccepted: true,
          legalImagesAcceptedAt: new Date()
        }
      } : undefined
    }
  });

  req.session.user = { id: user.id, name: user.name, role: user.role, subscription: user.subscription };
  req.flash('success', 'Cuenta creada correctamente.');
  return res.redirect('/');
}

export async function login(req, res) {
  const email = sanitizeText(req.body.email).toLowerCase();
  const { password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    req.flash('error', 'Credenciales inválidas.');
    return res.redirect('/auth/login');
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    req.flash('error', 'Credenciales inválidas.');
    return res.redirect('/auth/login');
  }

  req.session.user = {
    id: user.id,
    name: user.name,
    role: user.role,
    subscription: user.subscription
  };

  req.flash('success', 'Sesión iniciada.');
  return res.redirect('/');
}

export function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}
