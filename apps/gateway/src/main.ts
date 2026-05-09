import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  const config=app.get('ConfigService');
  const port=config.get('PORT') || 3000;
  await app.listen(port, () => {
    console.log(`Gateway is running on port ${port}`);
  });
}
bootstrap();
