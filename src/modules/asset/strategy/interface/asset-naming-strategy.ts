/**
 * @description
 * 附件上传命名策略，根据上传的源文件名确定如何生成文件名，
 * 以及如何处理命名冲突。
 *
 * @docsCategory assets
 */
export interface AssetNamingStrategy {
  /**
   * @description
   * 给定上传文件的原始文件名，生成文件名到存储的服务器上。
   * 像标准化的时间戳这样的操作可以用这种方法执行。
   *
   * 将检查输出是否与现有文件的命名冲突。如果一个检查到一个冲突 exists,
   * 此方法将被再次调用，并传入第二个参数和一个新的、唯一的参数，然后生成文件名。
   * 此过程将一直重复，直到出现唯一的文件名返回。
   */
  generateSourceFileName(
    originalFileName: string,
    conflictFileName?: string,
  ): string;

  /**
   * @description
   * 给定`generateSourceFileName`方法生成的源文件名,
   * 此方法应该生成预览图像的文件名。
   *
   * 检查冲突的机制与上面描述的相同。
   */
  generatePreviewFileName(
    sourceFileName: string,
    conflictFileName?: string,
  ): string;
}
