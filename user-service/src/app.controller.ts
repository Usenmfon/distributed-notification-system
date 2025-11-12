// import { Controller, Get } from '@nestjs/common';
// import { AppService } from './app.service';

// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get()
//   getHello(): string {
//     return this.appService.getHello();
//   }
// }

import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller()
export class AppController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get('health')
  async health() {
    const dbHealthy = this.connection.isConnected;

    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      service: 'user-service',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
    };
  }
}
