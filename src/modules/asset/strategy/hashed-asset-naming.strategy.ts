import { createHash } from 'crypto';
import path from 'path';
import { DefaultAssetNamingStrategy } from './default/default-asset-naming.strategy';

/**
 * @description
 * 一个 {@link DefaultAssetNamingStrategy} 的扩展，它将文件名作为前缀（`'source'` or `'preview'`）
 * 以及一个2字符基于原始文件名的 md5 Hash 的子目录
 *
 * 这种实现技术称为 "hashed directory" 文件存储，它的目的是减少单个目录中的文件数量，
 * 因为一个目录包含非常大量文件时，会导性能问题。
 *
 * 使用这个策略，即使总文件超过20万，单目也只会包含少于800个文件。
 */
export class HashedAssetNamingStrategy extends DefaultAssetNamingStrategy {
  generateSourceFileName(
    originalFileName: string,
    conflictFileName?: string,
  ): string {
    const filename = super.generateSourceFileName(
      originalFileName,
      conflictFileName,
    );
    return path.join('source', this.getHashedDir(filename), filename);
  }
  generatePreviewFileName(
    originalFileName: string,
    conflictFileName?: string,
  ): string {
    const filename = super.generatePreviewFileName(
      originalFileName,
      conflictFileName,
    );
    return path.join('preview', this.getHashedDir(filename), filename);
  }

  private getHashedDir(filename: string): string {
    return createHash('md5').update(filename).digest('hex').slice(0, 2);
  }
}
