import {
  BaseEntity,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { DeepPartial, ID } from '../types';

/**
 * @description
 * 所有 entities 继承此类
 * @docsCategory entities
 */
export abstract class AbstractBaseEntity<
  T extends { id: any },
> extends BaseEntity<T, 'id'> {
  protected constructor(input?: DeepPartial<AbstractBaseEntity<T>>) {
    super();
    if (input) {
      for (const [key, value] of Object.entries(input)) {
        (this as any)[key] = value;
      }
    }
  }

  // mongodb 专用
  @PrimaryKey()
  _id!: ObjectId;

  // 兼容查询
  @SerializedPrimaryKey()
  id!: ID;
  // @PrimaryKey()
  // id: string; // Number or String ID type

  @Property({
    type: Date,
  })
  createdAt = new Date();

  @Property({
    type: Date,
    onUpdate: () => new Date(),
  })
  updatedAt = new Date();
}
