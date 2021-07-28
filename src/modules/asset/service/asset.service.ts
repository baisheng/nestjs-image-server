import { Injectable } from '@nestjs/common';
import slug from 'limax';
import * as path from 'path';
import { Stream } from 'stream';

import { EntityManager } from '@mikro-orm/core';
// tslint:disable-next-line:no-var-requires
import sizeOf from 'image-size';
import { AssetNamingStrategy } from '../strategy/interface/asset-naming-strategy';
import { AssetPreviewStrategy } from '../strategy/interface/asset-preview-strategy';
import { HashedAssetNamingStrategy } from '../strategy/hashed-asset-naming.strategy';
import { SharpAssetPreviewStrategy } from '../strategy/sharp-asset-preview.strategy';
import { defaultAssetStorageStrategyFactory } from '../strategy/default/default-asset-storage-strategy-factory';
import { Asset } from '../../../entity/asset/asset.entity';
import { AssetType, CreateAssetInput } from '../../../types';
import { getAssetType } from '../../../utils/utils';
export interface PaginatedList<T> {
  items: T[];
  totalItems: number;
}

@Injectable()
export class AssetService {
  // 命名策略
  private assetNamingStrategy: AssetNamingStrategy;
  // 预览策略
  private assetPreviewStrategy: AssetPreviewStrategy;
  // 存储策略
  private assetStorageStrategy;

  constructor(private em: EntityManager) {
    this.assetNamingStrategy = new HashedAssetNamingStrategy();
    this.assetPreviewStrategy = new SharpAssetPreviewStrategy({
      maxWidth: 1600,
      maxHeight: 1600,
    });
    this.assetStorageStrategy = defaultAssetStorageStrategyFactory({
      route: 'assets',
      // assetUploadDir: path.join(__dirname, 'assets'),
      assetUploadDir: 'assets',
    });
  }

  async createFromBuffer(data): Promise<Asset> {
    const { stream, filename, mimetype } = data;
    // Logger.info(mimetype)
    // const stream = createReadStream();
    // const stream = buffer
    return await this.createAssetInternal(stream, filename, mimetype);
  }

  async create(input: CreateAssetInput): Promise<Asset> {
    // console.log(input)
    const { createReadStream, filename, mimetype } = await input.file;
    const stream = createReadStream();
    const result = await this.createAssetInternal(stream, filename, mimetype);
    // if (isGraphQlErrorResult(result)) {
    //   return result;
    // }
    return result;
  }

  private async createAssetInternal(
    stream: Stream,
    filename: string,
    mimetype: string,
  ): Promise<Asset> {
    // console.log(assetStorageStrategy)

    const fileTitle = filename;
    const filenameSlug = slug(filename);
    // console.log(filenameSlug)
    // const
    const sourceFileName = await this.getSourceFileName(filenameSlug);
    const previewFileName = await this.getPreviewFileName(sourceFileName);
    const sourceFileIdentifier =
      await this.assetStorageStrategy.writeFileFromStream(
        sourceFileName,
        stream,
      );
    const sourceFile = await this.assetStorageStrategy.readFileToBuffer(
      sourceFileIdentifier,
    );
    let preview: Buffer;
    try {
      preview = await this.assetPreviewStrategy.generatePreviewImage(
        mimetype,
        sourceFile,
      );
    } catch (e) {
      throw e;
    }
    const previewFileIdentifier =
      await this.assetStorageStrategy.writeFileFromBuffer(
        previewFileName,
        preview,
      );
    const type = getAssetType(mimetype);
    const { width, height } = this.getDimensions(
      type === AssetType.IMAGE ? sourceFile : preview,
    );

    const asset = new Asset({
      type,
      width,
      height,
      title: fileTitle,
      name: path.basename(sourceFileName),
      fileSize: sourceFile.byteLength,
      mimeType: mimetype,
      source: sourceFileIdentifier,
      preview: previewFileIdentifier,
      focalPoint: null,
    });

    await this.em.persistAndFlush(asset);
    return asset;
    // return this.connection.manager.save(asset);
  }

  private getDimensions(imageFile: Buffer): { width: number; height: number } {
    try {
      const { width, height } = sizeOf(imageFile);
      return { width, height };
    } catch (e) {
      return { width: 0, height: 0 };
    }
  }

  private async getSourceFileName(fileName: string): Promise<string> {
    return this.generateUniqueName(fileName, (name, conflict) =>
      this.assetNamingStrategy.generateSourceFileName(name, conflict),
    );
  }

  private async getPreviewFileName(fileName: string): Promise<string> {
    return this.generateUniqueName(fileName, (name, conflict) =>
      this.assetNamingStrategy.generatePreviewFileName(name, conflict),
    );
  }

  /**
   * 生成资源的唯一标识
   * @param inputFileName
   * @param generateNameFn
   */
  private async generateUniqueName(
    inputFileName: string,
    generateNameFn: (fileName: string, conflictName?: string) => string,
  ): Promise<string> {
    let outputFileName: string | undefined;
    do {
      outputFileName = generateNameFn(inputFileName, outputFileName);
    } while (await this.assetStorageStrategy.fileExists(outputFileName));
    return outputFileName;
  }
}
