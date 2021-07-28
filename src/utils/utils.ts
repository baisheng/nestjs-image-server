import { AssetType } from '../types';

export function getAssetType(mimeType: string): AssetType {
  const type = mimeType.split('/')[0];
  switch (type) {
    case 'image':
      return AssetType.IMAGE;
    case 'video':
      return AssetType.VIDEO;
    default:
      return AssetType.BINARY;
  }
}
export const imageFileFilter = (req, file, callback) => {
  // if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|docx|doc|xlsx|xls)$/)) {
  //     return callback(new Error('Only image files are allowed!'), false);
  // }
  file.encoding = 'gbk';
  callback(null, true);
};
