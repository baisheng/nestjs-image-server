import { Entity, Property } from '@mikro-orm/core';
import { AbstractBaseEntity } from '../base.entity';
import { AssetType, DeepPartial } from '../../types';

@Entity({
  tableName: 'assets',
})
export class Asset extends AbstractBaseEntity<Asset> {
  constructor(input?: DeepPartial<Asset>) {
    super(input);
  }
  // 文件标题
  @Property() title: string;
  // 文件标识
  @Property() name: string;
  // 文件类型
  @Property() type: AssetType;
  // 文件 mime type
  @Property() mimeType: string;

  @Property({ default: 0 }) width: number;

  @Property({ default: 0 }) height: number;

  @Property() fileSize: number;

  @Property() source: string;

  @Property() preview: string;

  @Property({
    nullable: true,
  })
  focalPoint?: { x: number; y: number };
}
