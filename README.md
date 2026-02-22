# IndustrialHub MVP (Chile)

MVP full-stack de directorio/marketplace de proveedores de servicios industriales, construido con **Node.js + Express + EJS + Prisma**.

> ✅ Sin Docker. Todo corre local con `npm install` y `npm run dev`.

## Stack

- Backend: Express.js
- Frontend: EJS + HTML/CSS en `/public`
- ORM: Prisma
- DB desarrollo: SQLite (out-of-the-box)
- DB producción: PostgreSQL (solo cambiar variables de entorno)
- Auth: `express-session` + `bcrypt`
- Seguridad: `helmet` + `express-rate-limit`

## Estructura de carpetas

```txt
.
├── app.js
├── controllers/
├── lib/
├── middleware/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── routes/
├── views/
│   ├── auth/
│   ├── home/
│   ├── providers/
│   └── partials/
└── public/
    ├── css/
    └── js/
```

## 1) Instalación

```bash
npm install
cp .env.example .env
```

## 2) Base de datos (SQLite en desarrollo)

```bash
npx prisma db push
npm run prisma:seed
```

## 3) Ejecutar en desarrollo

```bash
npm run dev
```

Abrir: `http://localhost:3000`

## Usuarios de prueba

Todos con password: `12345678`

- `admin@industrialhub.cl` (ADMIN)
- `cliente@industrialhub.cl` (USER)
- `proveedor@industrialhub.cl` (PROVIDER)

## Configuración para PostgreSQL en producción

En tu `.env` de producción:

```env
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://usuario:password@host:5432/industrialhub?schema=public"
NODE_ENV=production
SESSION_SECRET=un-secreto-seguro
```

Luego ejecutar:

```bash
npx prisma migrate deploy
npm start
```

## Funcionalidades MVP implementadas

- Roles: VISITOR (anónimo), USER, PROVIDER, ADMIN.
- Marketplace: búsqueda, filtro por categoría y orden por rating.
- Perfil proveedor: logo, verificado, rating, descripción, contacto, teléfono opcional, tarifa, galería (solo PRO), formulario de contacto visual.
- Reseñas: USER/ADMIN puede dejar 1 por proveedor. PROVIDER/ADMIN puede responder.
- Listas guardadas con límites FREE (1 lista / 10 proveedores) + botón `Activar PRO` (Mock).
- Planes proveedor FREE/PRO + botón `Activar PRO` (Mock).
- Productos/manuales: código, marca, descripción y links externos (sin subida de PDF).
- Registro de proveedor con checkbox legal de imágenes.
- Seguridad: cabeceras HTTP con Helmet, rate-limit en reseñas/respuestas, salida escapada en EJS con `<%= %>`.

## TODO sugeridos (próximos pasos)

- Integrar pagos reales (Flow / MercadoPago) para USER PRO y PROVIDER PRO.
- Panel de administración para moderación de reseñas/proveedores.
- CRUD completo de perfil proveedor y carga de galería con validaciones de tamaño/formato.
- Envío real del formulario de contacto (email o WhatsApp API).
