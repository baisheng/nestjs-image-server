import { MongoHighlighter } from '@mikro-orm/mongo-highlighter';
import { Asset } from './entity/asset/asset.entity';

export default {
  entities: [Asset],
  dbName: 'asset-store',
  type: 'mongo', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`,
  clientUrl:
    'mongodb://mongo:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false',
  debug: true,
  highlighter: new MongoHighlighter(),
  // 用于 mongodb 初始化索引，如果 false Unique 不会有效
  // ensureIndexes: true,
};
