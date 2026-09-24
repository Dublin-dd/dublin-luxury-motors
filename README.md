# 督柏林 Dublin — Luxury Automotive Website

督柏林（Dublin）全球豪华汽车品牌官网的开源前端实现。项目以纯 HTML、CSS 与 JavaScript 构建，包含六款原创车型、电影感首屏、桌面端 2.5D 车辆交互、动态灯光、排气效果、车型详情与外观配置体验。

## 在线访问

项目通过 GitHub Pages 自动部署：**[在线访问督柏林官网](https://dublin-dd.github.io/dublin-luxury-motors/)**。

## 主要特性

- 六款原创车型与统一的紫底银虎品牌徽章
- 车型悬停放大、随鼠标俯仰与横向转动
- 车灯、地面光晕及尾部排气动态效果
- 电影式首屏运镜与滚动显现
- 全屏导航、车型详情、外观颜色预览与本地配置下载
- 无框架、无第三方运行时依赖，可直接作为静态网站部署

## 本地运行

直接打开 `index.html`，或在项目目录启动任意静态文件服务器：

```bash
python3 -m http.server 8000
```

随后访问 `http://localhost:8000`。

## 项目结构

```text
.
├── index.html           # GitHub Pages 入口与网站源文件
├── motion.css           # 桌面端车辆透视、灯光与排气效果
├── motion.js            # 交互和动画逻辑
├── assets/              # 原创车型、品牌徽章与制作记录
├── build.mjs            # 生成单文件离线版本
└── 督柏林Dublin官网.html # 可离线打开的单文件版本
```

重新生成离线单文件：

```bash
node build.mjs
```

## 浏览器与设备

当前版本专为桌面端设计，建议视口宽度不低于 1024px。系统启用“减少动态效果”时，页面会自动降低动画强度。

## 开源许可

项目代码与随仓库发布的原创视觉素材采用 [MIT License](LICENSE) 开源。`Dublin / 督柏林` 名称及虎徽仅用于本项目品牌标识；如用于其他品牌或商业项目，请替换相应名称、徽章和业务信息。
