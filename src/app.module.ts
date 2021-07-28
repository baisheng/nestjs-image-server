import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Asset } from './entity/asset/asset.entity';
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter';
import { AssetModule } from './modules/asset/asset.module';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      useFactory: () => {
        return {
          entities: [Asset],
          dbName: 'asset-store',
          type: 'mongo', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`,
          clientUrl:
            'mongodb://localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false',
          debug: true,
          highlighter: new MongoHighlighter(),
        };
      },
    }),
    AssetModule.init({
      route: 'assets',
      assetUploadDir: 'assets',
    }),
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  configure(consumer: MiddlewareConsumer): any {}

  onModuleInit(): any {}
}
