import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS pour permettre les requêtes depuis le frontend
  app.enableCors({
    origin: ['http://localhost:8081', 'exp://192.168.1.100:8081'], // Expo dev server
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuration Swagger pour la documentation API
  const config = new DocumentBuilder()
    .setTitle('Expense Tracker API')
    .setDescription('API pour l\'application de suivi des dépenses')
    .setVersion('1.0')
    .addTag('expenses', 'Gestion des dépenses')
    .addTag('categories', 'Gestion des catégories')
    .addTag('banks', 'Gestion des banques')
    .addTag('subscriptions', 'Gestion des abonnements')
    .addTag('installments', 'Gestion des paiements échelonnés')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application démarrée sur le port ${port}`);
  console.log(`📚 Documentation Swagger disponible sur http://localhost:${port}/api`);
}

bootstrap();
