import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TrpcRouter } from '@server/trpc/trpc.router';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigurationType } from './configuration';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const { host, isProd, port } =
    configService.get<ConfigurationType['server']>('server')!;

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.useStaticAssets(join(__dirname, '..', 'client', 'assets'), {
    prefix: '/dash/assets/',
  });
  app.setBaseViewsDir(join(__dirname, '..', 'client'));
  app.setViewEngine('hbs');

  if (isProd) {
    app.enable('trust proxy');
  }

  app.enableCors({
    exposedHeaders: ['authorization'],
  });

  const trpc = app.get(TrpcRouter);
  trpc.applyMiddleware(app);

  await app.listen(port, host);

  console.log(`Server is running at http://${host}:${port}`);
}
bootstrap();
