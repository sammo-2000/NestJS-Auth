import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Application API')
    .setDescription('API documentation for the auth application')
    .setVersion('1.0.0')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
    },
  });
}
