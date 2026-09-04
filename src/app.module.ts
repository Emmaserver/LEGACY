import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ClientsModule } from './clients/clients.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [PrismaModule, ProductsModule, CategoriesModule, ClientsModule, StockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
