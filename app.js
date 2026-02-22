import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import path from 'path';
import { fileURLToPath } from 'url';

import mainRoutes from './routes/index.js';
import authRoutes from './routes/authRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import listRoutes from './routes/listRoutes.js';
import productRoutes from './routes/productRoutes.js';
import { attachAuth } from './middleware/auth.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    name: 'industrialhub.sid',
    secret: process.env.SESSION_SECRET || 'industrialhub-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

app.use(flash());
app.use(attachAuth);
app.use((req, res, next) => {
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error')
  };
  next();
});

const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiadas acciones en poco tiempo. Intenta nuevamente en 15 minutos.'
});

app.use('/providers/:id/reviews', reviewLimiter);
app.use('/providers/reviews/:reviewId/reply', reviewLimiter);

app.use('/', mainRoutes);
app.use('/auth', authRoutes);
app.use('/providers', providerRoutes);
app.use('/lists', listRoutes);
app.use('/products', productRoutes);

app.use((req, res) => {
  res.status(404).render('home/404', { title: 'Página no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('home/500', { title: 'Error interno' });
});

app.listen(PORT, () => {
  console.log(`IndustrialHub ejecutándose en http://localhost:${PORT}`);
});
