import { Request } from 'express';
import { Stream } from 'stream';

/**
 * @description
 * Asset文件存储策略接口
 *
 * 本接口确定了Asset 文件的物理存储和检索方式
 *
 * @docsCategory assets
 */
export interface AssetStorageStrategy {
  /**
   * 向存储区写入一个缓冲区并返回一个有唯一标识符的文件，如：文件路径或 URL
   */
  writeFileFromBuffer(fileName: string, data: Buffer): Promise<string>;

  /**
   * 将 readable stream 写入存储区并返回一个有唯一标识符的文件，如：文件路径或 URL
   */
  writeFileFromStream(fileName: string, data: Stream): Promise<string>;

  /**
   * 根据 writeFile 生成的唯一标识读取文件，并以 Buffer 形式返回
   */
  readFileToBuffer(identifier: string): Promise<Buffer>;

  /**
   * 根据 writeFile 生成的唯一标识读取文件，并以 Stream 形式返回
   */
  readFileToStream(identifier: string): Promise<Stream>;

  /**
   * 检查文件名是否已经存在，用于避免保存文件前命名冲突
   */
  fileExists(fileName: string): Promise<boolean>;

  /**a
   * 将 writeFile 生成的标识符，转换为绝对 url。如果标识符已经是一个 url 了，
   * 这个方法就不需要使用
   */
  toAbsoluteUrl?(request: Request, identifier: string): string;
}
