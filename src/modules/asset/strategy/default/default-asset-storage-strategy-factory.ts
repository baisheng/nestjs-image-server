import { Request } from 'express';
import { AssetServerOptions } from '../../../../types';
import { LocalAssetStorageStrategy } from '../local-asset-storage.strategy';

/**
 * 默认存储策略工厂函数
 */
export function defaultAssetStorageStrategyFactory(
  options: AssetServerOptions,
) {
  const { assetUrlPrefix, assetUploadDir, route } = options;
  const toAbsoluteUrlFn = (request: Request, identifier: string): string => {
    if (!identifier) {
      return '';
    }
    const prefix =
      assetUrlPrefix ||
      `${request.protocol}://${request.get('host')}/${route}/`;
    return identifier.startsWith(prefix)
      ? identifier
      : `${prefix}${identifier}`;
  };
  return new LocalAssetStorageStrategy(assetUploadDir, toAbsoluteUrlFn);
}
