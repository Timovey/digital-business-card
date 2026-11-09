import { Global, Module } from '@nestjs/common';
import { Clock, SystemClock } from './clock/clock';

@Global()
@Module({
  providers: [{ provide: Clock, useClass: SystemClock }],
  exports: [Clock],
})
export class CommonModule {}
