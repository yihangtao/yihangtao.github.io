# Publications Images Directory

此目录用于存放论文相关的图片文件。

## 文件夹命名规范

每篇论文应该有一个独立的文件夹，命名格式：`paper-{year}-{short-name}`

例如：
- `paper-2025-shared-spatial-memory`
- `paper-2025-neptune-x`
- `paper-2025-instruct2see`

## 文件命名规范

每个论文文件夹中应包含以下文件：

### 必需文件：
1. **`thumbnail.png`** 或 **`thumbnail.jpg`**
   - 论文的架构图/示意图缩略图
   - 建议尺寸：400-600px 宽
   - 将显示在左侧

2. **`venue-logo.png`** 或 **`venue-logo.jpg`** 或 **`venue-logo.svg`**
   - 会议/期刊的官方logo
   - 例如：ArXiv logo, NeurIPS logo, ICML logo等
   - 建议尺寸：高度80-120px
   - 将显示在右上角

### 示例文件夹结构：

```
assets/publications/
├── paper-2025-shared-spatial-memory/
│   ├── thumbnail.png          # 论文架构图
│   └── venue-logo.png         # ArXiv logo
├── paper-2025-neptune-x/
│   ├── thumbnail.jpg
│   └── venue-logo.png         # NeurIPS logo
├── paper-2025-instruct2see/
│   ├── thumbnail.png
│   └── venue-logo.png         # ICML logo
└── README.md
```

## 在 publications.json 中引用

在 `data/publications.json` 文件中，为每篇论文添加以下字段：

```json
{
  "title": "Your Paper Title",
  "authors": "...",
  "venue": "ArXiv 2025",
  "thumbnail": "assets/publications/paper-2025-short-name/thumbnail.png",
  "venueLogo": "assets/publications/paper-2025-short-name/venue-logo.png",
  "type": "preprint",
  "isFirstAuthor": true,
  "tags": [...]
}
```

## 图片格式建议

- **缩略图（thumbnail）**：PNG或JPG，建议PNG以保持透明背景
- **会议logo（venue-logo）**：优先使用PNG或SVG格式，保持透明背景
- 文件大小：每张图片尽量控制在500KB以内

## 常见会议/期刊Logo获取

可以从以下网站获取官方logo：
- 会议官方网站
- [Wikimedia Commons](https://commons.wikimedia.org/)
- 各会议的官方品牌资源页面

