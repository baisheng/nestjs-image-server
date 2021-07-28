/**
 * 规范化字符串以替换非字母、数字和特殊符号
 *
 * Based on https://stackoverflow.com/a/37511463/772859
 */
export function normalizeString(input: string, spaceReplacer = ' '): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[!"£$%^&*()+[\]{};:@#~?\\/,|><`¬'=]/g, '')
    .replace(/\s+/g, spaceReplacer);
}
