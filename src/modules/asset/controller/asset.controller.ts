import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { AssetService } from '../service/asset.service';
import { imageFileFilter } from '../../../utils/utils';

@Controller('')
export class AssetsController {
  constructor(private assetService: AssetService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  async upload(@UploadedFile() file) {
    const stream = new Readable();
    await stream.push(file.buffer);
    await stream.push(null);
    // const fileTitle = iconv.decode(
    //   iconv.encode(file.originalname, 'gbk'),
    //   'gbk',
    // );
    return await this.assetService.createFromBuffer({
      filename: file.originalname,
      mimetype: file.mimetype,
      stream,
    });
  }

  @Get()
  print() {
    return 'Hello World!';
  }
}
