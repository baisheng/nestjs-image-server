// tslint:disable
export type ID = string | number;

import { AssetNamingStrategy } from './modules/asset/strategy/interface/asset-naming-strategy';
import { AssetStorageStrategy } from './modules/asset/strategy/interface/asset-store-strategy';

export type Maybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
/** 所有内置和自定义标量 */
export type Scalars = {
  ID: string | number;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

/**
 * Partial<T> 类型的递归实现
 * Source: https://stackoverflow.com/a/49936686/772859
 */
export type DeepPartial<T> = {
  [P in keyof T]?:
    | null
    | (T[P] extends Array<infer U>
        ? Array<DeepPartial<U>>
        : T[P] extends ReadonlyArray<infer U>
        ? ReadonlyArray<DeepPartial<U>>
        : DeepPartial<T[P]>);
};

export type PaginatedList = {
  items: Array<Node>;
  totalItems: Scalars['Int'];
};
export type Coordinate = {
  __typename?: 'Coordinate';
  x: Scalars['Float'];
  y: Scalars['Float'];
};

export type CoordinateInput = {
  x: Scalars['Float'];
  y: Scalars['Float'];
};

export type DateRange = {
  start: Scalars['DateTime'];
  end: Scalars['DateTime'];
};

export type DateOperators = {
  eq?: Maybe<Scalars['DateTime']>;
  before?: Maybe<Scalars['DateTime']>;
  after?: Maybe<Scalars['DateTime']>;
  between?: Maybe<DateRange>;
};

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type StringOperators = {
  eq?: Maybe<Scalars['String']>;
  notEq?: Maybe<Scalars['String']>;
  like?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Scalars['String']>>;
  notIn?: Maybe<Array<Scalars['String']>>;
  regex?: Maybe<Scalars['String']>;
};

export type NumberOperators = {
  eq?: Maybe<Scalars['Float']>;
  lt?: Maybe<Scalars['Float']>;
  lte?: Maybe<Scalars['Float']>;
  gt?: Maybe<Scalars['Float']>;
  gte?: Maybe<Scalars['Float']>;
  between?: Maybe<NumberRange>;
};

export type NumberRange = {
  start: Scalars['Float'];
  end: Scalars['Float'];
};

export type Asset = Node & {
  __typename?: 'Asset';
  id: Scalars['ID'];
  createdAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  type?: Maybe<AssetType>;
  fileSize?: Maybe<Scalars['Int']>;
  mimeType?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Int']>;
  height?: Maybe<Scalars['Int']>;
  source?: Maybe<Scalars['String']>;
  preview?: Maybe<Scalars['String']>;
  focalPoint?: Maybe<Coordinate>;
};

export type AssetFilterParameter = {
  createdAt?: Maybe<DateOperators>;
  updatedAt?: Maybe<DateOperators>;
  name?: Maybe<StringOperators>;
  type?: Maybe<StringOperators>;
  fileSize?: Maybe<NumberOperators>;
  mimeType?: Maybe<StringOperators>;
  width?: Maybe<NumberOperators>;
  height?: Maybe<NumberOperators>;
  source?: Maybe<StringOperators>;
  preview?: Maybe<StringOperators>;
};

export type AssetList = PaginatedList & {
  __typename?: 'AssetList';
  items: Array<Asset>;
  totalItems: Scalars['Int'];
};

export type AssetListOptions = {
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
  sort?: Maybe<AssetSortParameter>;
  filter?: Maybe<AssetFilterParameter>;
};

export type AssetSortParameter = {
  id?: Maybe<SortOrder>;
  createdAt?: Maybe<SortOrder>;
  updatedAt?: Maybe<SortOrder>;
  name?: Maybe<SortOrder>;
  fileSize?: Maybe<SortOrder>;
  mimeType?: Maybe<SortOrder>;
  width?: Maybe<SortOrder>;
  height?: Maybe<SortOrder>;
  source?: Maybe<SortOrder>;
  preview?: Maybe<SortOrder>;
};

export enum AssetType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  BINARY = 'BINARY',
}
export type CreateAssetInput = {
  file: Scalars['Upload'];
};

export type CreateAssetResult = Asset | MimeTypeError;

export type MimeTypeError = ErrorResult & {
  __typename?: 'MimeTypeError';
  errorCode: ErrorCode;
  message: Scalars['String'];
  fileName: Scalars['String'];
  mimeType: Scalars['String'];
};

export enum ErrorCode {
  PASSWORD_RESET_TOKEN_EXPIRED_ERROR = 'PASSWORD_RESET_TOKEN_EXPIRED_ERROR',
  PASSWORD_RESET_TOKEN_INVALID_ERROR = 'PASSWORD_RESET_TOKEN_INVALID_ERROR',
  EMAIL_ADDRESS_CONFLICT_ERROR = 'EMAIL_ADDRESS_CONFLICT_ERROR',
  INVALID_CREDENTIALS_ERROR = 'INVALID_CREDENTIALS_ERROR',
  MIME_TYPE_ERROR = 'MIME_TYPE_ERROR',
  NATIVE_AUTH_STRATEGY_ERROR = 'NATIVE_AUTH_STRATEGY_ERROR',
  PHONE_CONFLICT_ERROR = 'PHONE_CONFLICT_ERROR',
  NAME_CONFLICT_ERROR = 'NAME_CONFLICT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export type ErrorResult = {
  errorCode: ErrorCode;
  message: Scalars['String'];
};

/** 图像文件的转换模式 */
export type ImageTransformMode = 'crop' | 'resize';

/**
 * @description
 * 预设图像大的小配置选项
 *
 * 预设允许使用一个快捷的方式生成 asset 缩略图预览。
 * 例如内置一个 `tiny` 预置来生成一个 50px x 50px 的裁剪图，访问时就可以通过添加字符串
 * `preset=tiny` 到 asset url 中，来请求。
 *
 * `http://localhost:3000/assets/some-asset.jpg?preset=tiny`
 *
 * 等价于以下 URL:
 *
 * `http://localhost:3000/assets/some-asset.jpg?w=50&h=50&mode=crop`
 *
 */
export interface ImageTransformPreset {
  name: string;
  width: number;
  height: number;
  mode: ImageTransformMode;
}

/**
 * @description
 * 配置选项
 */
export interface AssetServerOptions {
  /**
   * @description
   * asset server 的路由
   */
  route: string;
  /**
   * @description
   *
   * 当使用 {@link LocalAssetStorageStrategy}时，将 asset 上传至本地目录
   */
  assetUploadDir: string;
  /**
   * @description
   * Asset 文件的完整URL前缀。示例："https://assets.picker.cc/"
   *
   * 如果没有配置，将尝试猜测请求和配置的路由，然后，除了最简单的情况，这个猜测可能不会得到正确的结果。
   */
  assetUrlPrefix?: string;
  /**
   * @description
   * 生成预览图像的最大宽度（px）
   *
   * @default 1600
   */
  previewMaxWidth?: number;
  /**
   * @description
   * 生成预览图像的最大高度（px）
   *
   * @default 1600
   */
  previewMaxHeight?: number;
  /**
   * @description
   * 图像转换预设 {@link ImageTransformPreset} 对象数组。
   */
  presets?: ImageTransformPreset[];
  /**
   * @description
   * 定义 asset 文件的命名策略
   *
   * @default HashedAssetNamingStrategy
   */
  namingStrategy?: AssetNamingStrategy;
  /**
   * @description
   * 用来配置 {@link AssetStorageStrategy} 的一个有用的函数。默认情况我们使用本地存储策略 {@link LocalAssetStorageStrategy},
   * 但当需要使用云存储时就需要用到它来进行配置
   *
   * @default () => LocalAssetStorageStrategy
   */
  storageStrategyFactory?: (
    options: AssetServerOptions,
  ) => AssetStorageStrategy | Promise<AssetStorageStrategy>;
}
