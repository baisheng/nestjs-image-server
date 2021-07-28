import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
  Type,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { NextFunction, Request, Response, Router } from 'express';
import { fromBuffer } from 'file-type';
// import { createReadStream, createWriteStream } from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';

export enum UploadTypesEnum {
  ANY = 'jpg|jpeg|png|gif|pdf|docx|doc|xlsx|xls',
  IMAGES = 'jpg|jpeg|png|gif',
  DOCS = 'pdf|docx|doc|xlsx|xls',
}

/**
 * @description

 * `AssetModule` 服务提供本地文件上传管理，也将支持配置其他存储策略，例如：阿里云，并支持实时图像转换
 *
 * @example
 *
 * ## 转换模式
 *
 * Asset 预览图像可以转换（调整尺寸 & 裁剪）在请求的 url 中添加查询参数：
 *
 * `http://localhost:3000/assets/some-asset.jpg?w=500&h=300&mode=resize`
 *
 * 上面的 URL 将返回 宽 500px x 高 300px 的 `some-asset.jpg` 图像
 *
 * ### 预览模式
 *
 * `mode` 参数可以是裁剪 `crop` 或调整尺寸 `resize`。详见  [ImageTransformMode]({{< relref "image-transform-mode" >}})
 *
 * ### 焦点
 *
 * 当裁剪图像时（`mode=crop`），将试图在裁剪帧中保持图像最 "有特点" 的区域。它是通过寻找图像中熵值最高的区域（图像中的热点区域）。然而，有时这个并不完美，大部分仍可能被删除掉。
 *
 * 所以焦点的作用就是可以通过传递`fpx`和`fpy`查询参数来手动指定，这些是标准化座标（介于0 和 1 之间的数字）,所以 `fpx=0&fpy=0` 对应于图像的左上角。
 *
 * 例如，假设有一个非常宽的景观图像，我们想要修剪成正方形。主题是一所最左边的房子图像。下面的查询将把它裁剪成以房子为中心的正方形
 *
 * `http://localhost:3000/assets/landscape.jpg?w=150&h=150&mode=crop&fpx=0.2&fpy=0.7`
 *
 * ### 转换模式预设
 *
 * 预设可以定义允许使用单个预设名称，而不是指定的宽度、高度和模式。预设是通过 AssetServerOptions [presets property]({{< relref "asset-server-options" >}}#presets) 配置
 *
 * 例如，定义以下预置:
 *
 * ```ts
 * new AssetModule({
 *   // ...
 *   presets: [
 *     { name: 'my-preset', width: 85, height: 85, mode: 'crop' },
 *   ],
 * }),
 * ```
 *
 * 意味着请求:
 *
 * `http://localhost:3000/assets/some-asset.jpg?preset=my-preset`
 *
 * 等价于:
 *
 * `http://localhost:3000/assets/some-asset.jpg?w=85&h=85&mode=crop`
 *
 * AssetModule带有以下预置:
 *
 * name | width | height | mode
 * -----|-------|--------|-----
 * tiny | 50px | 50px | crop
 * thumb | 150px | 150px | crop
 * small | 300px | 300px | resize
 * medium | 500px | 500px | resize
 * large | 800px | 800px | resize
 *
 * ### 缓存
 * 默认情况下，AssetModule 将缓存每个转换的图像，所以转换只需要执行一次给定的配置。
 * 关闭缓存可以使用 `?cache=false` 查询参数。
 *
 * @docsCategory AssetModule
 */
import { AssetService } from './service/asset.service';
import { AssetsController } from './controller/asset.controller';
import { defaultAssetStorageStrategyFactory } from './strategy/default/default-asset-storage-strategy-factory';
import { AssetServerOptions, ImageTransformPreset } from '../../types';
import { transformImage } from '../../utils/transform-image';

@Module({
  providers: [AssetService],
  controllers: [AssetsController],
})
export class AssetModule implements NestModule, OnApplicationBootstrap {
  private static assetStorage = defaultAssetStorageStrategyFactory({
    route: 'asset',
    assetUploadDir: 'assets',
    // assetUploadDir: path.join(__dirname, 'assets'),
  });
  private readonly cacheDir = 'cache';
  private presets: ImageTransformPreset[] = [
    { name: 'tiny', width: 50, height: 50, mode: 'crop' },
    { name: 'thumb', width: 150, height: 150, mode: 'crop' },
    { name: 'small', width: 300, height: 300, mode: 'resize' },
    { name: 'medium', width: 500, height: 500, mode: 'resize' },
    { name: 'large', width: 800, height: 800, mode: 'resize' },
  ];
  private static options: AssetServerOptions;

  /**
   * @description
   * Set the plugin options.
   */
  static init(options: AssetServerOptions): Type<AssetModule> {
    AssetModule.options = options;
    return this;
  }

  /** @internal */
  onApplicationBootstrap(): void | Promise<void> {
    if (AssetModule.options.presets) {
      for (const preset of AssetModule.options.presets) {
        const existingIndex = this.presets.findIndex(
          (p) => p.name === preset.name,
        );
        if (-1 < existingIndex) {
          this.presets.splice(existingIndex, 1, preset);
        } else {
          this.presets.push(preset);
        }
      }
    }
    const cachePath = path.join(
      AssetModule.options.assetUploadDir,
      this.cacheDir,
    );
    fs.ensureDirSync(cachePath);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.createAssetServer()).forRoutes('assets');
  }

  /**
   * 创建映像服务器实例
   */
  private createAssetServer() {
    const assetServer = Router();
    assetServer.use(this.sendAsset(), this.generateTransformedImage());
    return assetServer;
  }

  /**
   * 读取请求的文件并将响应发送到浏览器。
   */
  private sendAsset() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = this.getFileNameFromRequest(req);
      try {
        const file = await AssetModule.assetStorage.readFileToBuffer(key);
        let mimeType = this.getMimeType(key);
        if (!mimeType) {
          mimeType =
            (await fromBuffer(file))?.mime || 'application/octet-stream';
        }
        res.contentType(mimeType);
        res.send(file);
      } catch (e) {
        const err = new Error('File not found');
        (err as any).status = 404;
        return next(err);
      }
    };
  }

  /**
   * 如果一个异常被第一个处理程序抛出，那么它可能是因为一个转换的图像
   * 正在被请求，但还不存在。在这种情况下，这个处理程序将生成
   * 转换后的图像，保存到缓存中，并作为响应提供结果。
   */
  private generateTransformedImage() {
    return async (
      err: any,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      if (err && (err.status === 404 || err.statusCode === 404)) {
        if (req.query) {
          let file: Buffer;
          try {
            file = await AssetModule.assetStorage.readFileToBuffer(req.path);
          } catch (err) {
            res.status(404).send('Resource not found');
            return;
          }
          const image = await transformImage(
            file,
            req.query as any,
            this.presets || [],
          );
          try {
            const imageBuffer = await image.toBuffer();
            if (!req.query.cache || req.query.cache === 'true') {
              const cachedFileName = this.getFileNameFromRequest(req);
              await AssetModule.assetStorage.writeFileFromBuffer(
                cachedFileName,
                imageBuffer,
              );
            }
            res.set('Content-Type', `image/${(await image.metadata()).format}`);
            res.send(imageBuffer);
            return;
          } catch (e) {
            res.status(500).send(e.message);
            return;
          }
        }
      }
      next();
    };
  }

  private getFileNameFromRequest(req: Request): string {
    const { w, h, mode, preset, fpx, fpy } = req.query;
    const focalPoint = fpx && fpy ? `_fpx${fpx}_fpy${fpy}` : '';
    let imageParamHash: string | null = null;
    if (w || h) {
      const width = w || '';
      const height = h || '';
      imageParamHash = this.md5(
        `_transform_w${width}_h${height}_m${mode}${focalPoint}`,
      );
    } else if (preset) {
      if (this.presets && !!this.presets.find((p) => p.name === preset)) {
        imageParamHash = this.md5(`_transform_pre_${preset}${focalPoint}`);
      }
    }

    if (imageParamHash) {
      return path.join(this.cacheDir, this.addSuffix(req.path, imageParamHash));
    } else {
      return req.path;
    }
  }

  private md5(input: string): string {
    return createHash('md5').update(input).digest('hex');
  }

  private addSuffix(fileName: string, suffix: string): string {
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const dirName = path.dirname(fileName);
    return path.join(dirName, `${baseName}${suffix}${ext}`);
  }

  /**
   * 尝试从文件名中获取mime类型。
   */
  private getMimeType(fileName: string): string | undefined {
    const ext = path.extname(fileName);
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.svg':
        return 'image/svg+xml';
      case '.tiff':
        return 'image/tiff';
      case '.webp':
        return 'image/webp';
    }
  }
}
