// This file is for any 3rd party JS libs which don't have a corresponding @types/ package.

declare module 'opn' {
  declare const opn: (path: string) => Promise<any>;
  export default opn;
}
