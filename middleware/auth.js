export function attachAuth(req, res, next) {
  res.locals.currentUser = req.session?.user || null;
  next();
}

export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    req.flash('error', 'Debes iniciar sesión para continuar.');
    return res.redirect('/auth/login');
  }
  return next();
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    const user = req.session?.user;

    if (!user || !roles.includes(user.role)) {
      req.flash('error', 'No tienes permisos para esta acción.');
      return res.redirect('/');
    }

    return next();
  };
}
