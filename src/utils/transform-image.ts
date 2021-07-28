import sharp, { Region, ResizeOptions } from 'sharp';
import { ImageTransformPreset } from '../types';

export type Dimensions = { w: number; h: number };
export type Point = { x: number; y: number };

/**
 * 根据查询参数转换图像
 */
export async function transformImage(
  originalImage: Buffer,
  queryParams: Record<string, string>,
  presets: ImageTransformPreset[],
): Promise<sharp.Sharp> {
  let targetWidth = Math.round(+queryParams.w) || undefined;
  let targetHeight = Math.round(+queryParams.h) || undefined;
  let mode = queryParams.mode || 'crop';
  const fpx = +queryParams.fpx || undefined;
  const fpy = +queryParams.fpy || undefined;
  if (queryParams.preset) {
    const matchingPreset = presets.find((p) => p.name === queryParams.preset);
    if (matchingPreset) {
      targetWidth = matchingPreset.width;
      targetHeight = matchingPreset.height;
      mode = matchingPreset.mode;
    }
  }
  const options: ResizeOptions = {};
  if (mode === 'crop') {
    options.position = sharp.strategy.entropy;
  } else {
    options.fit = 'inside';
  }

  const image = sharp(originalImage);
  if (fpx && fpy && targetWidth && targetHeight && mode === 'crop') {
    const metadata = await image.metadata();
    if (metadata.width && metadata.height) {
      const xCenter = fpx * metadata.width;
      const yCenter = fpy * metadata.height;
      const { width, height, region } = resizeToFocalPoint(
        { w: metadata.width, h: metadata.height },
        { w: targetWidth, h: targetHeight },
        { x: xCenter, y: yCenter },
      );
      return image.resize(width, height).extract(region);
    }
  }

  return image.resize(targetWidth, targetHeight, options);
}

/**
 * 调整图像大小，但保持其在焦点的中心。
 * Based on the method outlined in https://github.com/lovell/sharp/issues/1198#issuecomment-384591756
 */
export function resizeToFocalPoint(
  original: Dimensions,
  target: Dimensions,
  focalPoint: Point,
): { width: number; height: number; region: Region } {
  const { width, height, factor } = getIntermediateDimensions(original, target);
  const region = getExtractionRegion(factor, focalPoint, target, {
    w: width,
    h: height,
  });
  return { width, height, region };
}

/**
 * 计算图像的维度数据
 * Calculates the dimensions of the intermediate (resized) image.
 */
function getIntermediateDimensions(
  original: Dimensions,
  target: Dimensions,
): { width: number; height: number; factor: number } {
  const hRatio = original.h / target.h;
  const wRatio = original.w / target.w;

  let factor: number;
  let width: number;
  let height: number;

  if (hRatio < wRatio) {
    factor = hRatio;
    height = Math.round(target.h);
    width = Math.round(original.w / factor);
  } else {
    factor = wRatio;
    width = Math.round(target.w);
    height = Math.round(original.h / factor);
  }
  return { width, height, factor };
}

/**
 * 计算从中间图像中提取的范围数据
 */
function getExtractionRegion(
  factor: number,
  focalPoint: Point,
  target: Dimensions,
  intermediate: Dimensions,
): Region {
  const newXCenter = focalPoint.x / factor;
  const newYCenter = focalPoint.y / factor;
  const region: Region = {
    left: 0,
    top: 0,
    width: target.w,
    height: target.h,
  };

  if (intermediate.h < intermediate.w) {
    region.left = clamp(
      0,
      intermediate.w - target.w,
      Math.round(newXCenter - target.w / 2),
    );
  } else {
    region.top = clamp(
      0,
      intermediate.h - target.h,
      Math.round(newYCenter - target.h / 2),
    );
  }
  return region;
}

/**
 * 将输入值限制为指定的最小值和最大值。
 */
function clamp(min: number, max: number, input: number) {
  return Math.min(Math.max(min, input), max);
}
