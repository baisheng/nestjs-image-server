import path from 'path';
import { AssetNamingStrategy } from '../interface/asset-naming-strategy';
import { normalizeString } from '../../../../utils/normalize-string';

/**
 * @description
 * 默认策略对文件名进行规范化，以删除不需要的字符和在冲突的情况下，增加一个计数器后缀.
 *
 * @docsCategory assets
 */
export class DefaultAssetNamingStrategy implements AssetNamingStrategy {
  private readonly numberingRe = /__(\d+)(\.[^.]+)?$/;

  generateSourceFileName(
    originalFileName: string,
    conflictFileName?: string,
  ): string {
    const normalized = normalizeString(originalFileName, '-');
    if (!conflictFileName) {
      return normalized;
    } else {
      return this.incrementOrdinalSuffix(normalized, conflictFileName);
    }
  }

  generatePreviewFileName(
    sourceFileName: string,
    conflictFileName?: string,
  ): string {
    const previewSuffix = '__preview';
    const previewFileName = this.isSupportedImageFormat(sourceFileName)
      ? this.addSuffix(sourceFileName, previewSuffix)
      : this.addSuffix(sourceFileName, previewSuffix) + '.png';

    if (!conflictFileName) {
      return previewFileName;
    } else {
      return this.incrementOrdinalSuffix(previewFileName, conflictFileName);
    }
  }

  /**
   * "supported format" 意味着 Sharp 库可以转换它并输出相同的内容文件类型。不支持的图像和其他非图像文件将转换为 PNG。
   *
   * See http://sharp.pixelplumbing.com/en/stable/api-output/#tobuffer
   */
  private isSupportedImageFormat(fileName: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff'];
    const ext = path.extname(fileName);
    return imageExtensions.includes(ext);
  }

  private incrementOrdinalSuffix(
    baseFileName: string,
    conflictFileName: string,
  ): string {
    const matches = conflictFileName.match(this.numberingRe);
    const ord = Number(matches && matches[1]) || 1;
    return this.addOrdinalSuffix(baseFileName, ord + 1);
  }

  private addOrdinalSuffix(fileName: string, order: number): string {
    const paddedOrder = order.toString(10).padStart(2, '0');
    return this.addSuffix(fileName, `__${paddedOrder}`);
  }

  private addSuffix(fileName: string, suffix: string): string {
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    return `${baseName}${suffix}${ext}`;
  }
}
