
`AssetModule` 服务提供本地文件上传管理，也将支持配置其他存储策略，例如：阿里云，并支持实时图像转换

# Example
## 转换模式

Asset 预览图像可以转换（调整尺寸 & 裁剪）在请求的 url 中添加查询参数：

`http://localhost:3000/assets/some-asset.jpg?w=500&h=300&mode=resize`

上面的 URL 将返回 宽 500px x 高 300px 的 `some-asset.jpg` 图像

### 预览模式

`mode` 参数可以是裁剪 `crop` 或调整尺寸 `resize`。详见  [ImageTransformMode]({{< relref "image-transform-mode" >}})

### 焦点

当裁剪图像时（`mode=crop`），将试图在裁剪帧中保持图像最 "有特点" 的区域。它是通过寻找图像中熵值最高的区域（图像中的热点区域）。然而，有时这个并不完美，大部分仍可能被删除掉。

所以焦点的作用就是可以通过传递`fpx`和`fpy`查询参数来手动指定，这些是标准化座标（介于0 和 1 之间的数字）,所以 `fpx=0&fpy=0` 对应于图像的左上角。

例如，假设有一个非常宽的景观图像，我们想要修剪成正方形。主题是一所最左边的房子图像。下面的查询将把它裁剪成以房子为中心的正方形

`http://localhost:3000/assets/landscape.jpg?w=150&h=150&mode=crop&fpx=0.2&fpy=0.7`

### 转换模式预设

预设可以定义允许使用单个预设名称，而不是指定的宽度、高度和模式。预设是通过 AssetServerOptions [presets property]({{< relref "asset-server-options" >}}#presets) 配置

例如，定义以下预置:

```ts
new AssetModule({
  // ...
  presets: [
    { name: 'my-preset', width: 85, height: 85, mode: 'crop' },
  ],
}),
```

意味着请求:

`http://localhost:3000/assets/some-asset.jpg?preset=my-preset`

等价于:

`http://localhost:3000/assets/some-asset.jpg?w=85&h=85&mode=crop`

AssetModule带有以下预置:

name | width | height | mode
-----|-------|--------|-----
tiny | 50px | 50px | crop
thumb | 150px | 150px | crop
small | 300px | 300px | resize
medium | 500px | 500px | resize
large | 800px | 800px | resize

### 缓存
默认情况下，AssetModule 将缓存每个转换的图像，所以转换只需要执行一次给定的配置。
关闭缓存可以使用 `?cache=false` 查询参数。
