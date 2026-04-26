# 墨砚笔记

一个优雅、简洁且功能强大的 Markdown 笔记应用，支持本地存储、AI 写作辅助和离线使用。

## ✨ 特性

- 📝 **实时编辑与预览** - 左右分栏，所见即所得的 Markdown 编辑体验
- 📁 **分类管理** - 创建自定义分类，更好地组织你的笔记
- 🔍 **全文搜索** - 快速找到你需要的笔记内容
- 💾 **本地持久化** - 基于 IndexedDB，数据安全存储在本地
- 🌙 **多主题** - 支持浅色/深色/护眼三种主题模式
- 📤 **多格式导出** - 支持 Markdown/HTML/PDF 三种导出格式
- 📥 **Markdown 导入** - 快速导入本地 Markdown 文件
- 🎯 **专注模式** - 隐藏界面元素，沉浸式写作
- 🛠️ **浮动工具栏** - 选中文字后快速格式化
- 🤖 **AI 辅助** - AI 智能摘要、AI 标题生成（需要配置）
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 📴 **PWA 离线可用** - 安装后可离线使用
- 📄 **代码高亮** - 支持多种编程语言的语法高亮

## 🚀 快速开始

### 安装依赖

```bash
cd markdown-app
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🛠️ 技术栈

- **框架** - React 19 + TypeScript
- **构建工具** - Vite
- **样式** - Tailwind CSS
- **Markdown 解析** - react-markdown
- **代码高亮** - react-syntax-highlighter
- **本地存储** - IndexedDB (原生封装)
- **AI 集成** - OpenAI / DeepSeek / 智谱 / 硅基流动

## 📖 使用指南

### 基础操作

1. **创建笔记** - 点击右上角「新建」按钮，或使用快捷键 `⌘N`
2. **编辑笔记** - 在左侧编辑器输入 Markdown，右侧实时预览
3. **删除笔记** - 悬停在笔记列表项上，点击垃圾桶图标

### Markdown 语法

支持标准 Markdown 语法，包括：

- 标题（#/##/###）
- 粗体（**text**）和斜体（*text*）
- 列表（有序/无序）
- 链接（[text](url)）和图片
- 代码块（```language）
- 引用块（> text）
- 表格
- 分隔线（---）

### AI 功能配置

AI 功能通过环境变量在构建时配置。支持的提供商：

- OpenAI
- DeepSeek
- 智谱 GLM
- 硅基流动

### 快捷键

- `⌘N` - 新建笔记
- `Esc` - 退出专注模式

## 📁 项目结构

```
markdown-app/
├── src/
│   ├── components/        # React 组件
│   ├── hooks/            # 自定义 Hooks
│   ├── ai/               # AI 相关功能
│   ├── db/               # IndexedDB 数据库封装
│   ├── types.ts          # TypeScript 类型定义
│   ├── App.tsx           # 主应用组件
│   ├── index.css         # 全局样式
│   └── main.tsx          # 入口文件
├── public/               # 静态资源
└── package.json
```

## 🎨 主题定制

三种内置主题：

- **浅色模式** - 明亮清晰
- **深色模式** - 护眼低光
- **护眼模式** - 暖色调，减少眼部疲劳

点击顶部工具栏的主题按钮可切换。

## 💾 数据存储

- 使用 **IndexedDB** 持久化存储笔记和分类
- 支持从旧版本 LocalStorage 自动迁移
- 数据完全存储在本地浏览器，不上传服务器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**墨砚笔记** - 心随笔动，文思泉涌
