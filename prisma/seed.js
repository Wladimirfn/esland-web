import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';

async function main() {
  await prisma.reviewProviderReply.deleteMany();
  await prisma.review.deleteMany();
  await prisma.listProvider.deleteMany();
  await prisma.list.deleteMany();
  await prisma.providerGalleryImage.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('12345678', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin IndustrialHub',
      email: 'admin@industrialhub.cl',
      passwordHash: defaultPassword,
      role: 'ADMIN',
      subscription: 'PRO'
    }
  });

  const user = await prisma.user.create({
    data: {
      name: 'Cliente Demo',
      email: 'cliente@industrialhub.cl',
      passwordHash: defaultPassword,
      role: 'USER',
      subscription: 'FREE'
    }
  });

  const providerOwner = await prisma.user.create({
    data: {
      name: 'Proveedor Demo',
      email: 'proveedor@industrialhub.cl',
      passwordHash: defaultPassword,
      role: 'PROVIDER',
      provider: {
        create: {
          companyName: 'FríoMaq Industrial SpA',
          description: 'Especialistas en mantenimiento de sistemas de refrigeración industrial y cámaras de frío.',
          contactEmail: 'contacto@friomaq.cl',
          phone: '+56 9 5555 1212',
          showPhone: true,
          category: 'REFRIGERACION',
          verified: true,
          hourlyRate: 38000,
          plan: 'PRO',
          featured: true,
          legalImagesAccepted: true,
          legalImagesAcceptedAt: new Date(),
          gallery: {
            create: [
              { imageUrl: '/pistas.png', caption: 'Instalación cámara de frío' },
              { imageUrl: '/grefg.webp', caption: 'Mantenimiento preventivo planta' }
            ]
          }
        }
      }
    },
    include: { provider: true }
  });

  await prisma.review.create({
    data: {
      providerId: providerOwner.provider.id,
      userId: user.id,
      stars: 5,
      comment: 'Excelente servicio, respuesta rápida y técnica clara.',
      providerReply: {
        create: {
          providerUserId: providerOwner.id,
          reply: '¡Gracias por confiar en nosotros!'
        }
      }
    }
  });

  const aggregate = await prisma.review.aggregate({
    where: { providerId: providerOwner.provider.id },
    _avg: { stars: true },
    _count: { id: true }
  });

  await prisma.provider.update({
    where: { id: providerOwner.provider.id },
    data: {
      ratingAvg: Number(aggregate._avg.stars || 0),
      reviewCount: aggregate._count.id
    }
  });

  const list = await prisma.list.create({
    data: {
      userId: user.id,
      name: 'Favoritos minería'
    }
  });

  await prisma.listProvider.create({
    data: {
      listId: list.id,
      providerId: providerOwner.provider.id
    }
  });

  await prisma.product.createMany({
    data: [
      {
        code: 'EQ-CHL-001',
        brand: 'Carrier',
        description: 'Unidad condensadora comercial para aplicaciones industriales de baja temperatura.',
        buyUrl: 'https://example.com/comprar/carrier-eq-chl-001',
        manualUrl: 'https://example.com/manuales/carrier-eq-chl-001'
      },
      {
        code: 'EQ-ELC-045',
        brand: 'Schneider',
        description: 'Tablero eléctrico de control para automatización de bombas industriales.',
        buyUrl: 'https://example.com/comprar/schneider-eq-elc-045',
        manualUrl: 'https://example.com/manuales/schneider-eq-elc-045'
      }
    ]
  });

  console.log('Seed completado. Usuarios demo: admin, cliente, proveedor. Password: 12345678');
  console.log('Admin ID:', admin.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
