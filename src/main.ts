import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './modules/app.module';

const PORT = process.env.PORT || 3001;
const corsOption = {
  origin: [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'https://lms.rastercell.com',
    'http://lms.rastercell.com',
    'https://*.rastercell.com',
    'http://*.rastercell.com',
    'http://localhost:5173',
    'http://192.168.1.35:8100',
    'http://192.168.56.1:8101',
    'http://192.168.1.35:8101',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:8100',
    'http://localhost:8101',
    'http://localhost:8102',
    'https://*.csb.app',
    'https://localhost:3000',
    'https://localhost:3001',
    'https://localhost:3002',
    'https://localhost:8100',
    'https://localhost'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

async function bookstore() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('lms-api');

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Node Nest LMS API')
      .setDescription('Node JS + Nest JS + Mongoose + MongoDB')
      .setVersion('1.0.0')
      .setContact('Email', 'mailto:rahathossenmanik@gmail.com', 'rahathossenmanik@gmail.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('lms-api/docs', app, document);
  }

  app.enableCors(corsOption);

  await app.listen(PORT);
}
bookstore();
