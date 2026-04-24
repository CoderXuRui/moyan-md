# 墨砚 Markdown 笔记应用 · 技术文档

## 一、项目概述

| 属性 | 内容 |
|------|------|
| 项目名称 | 墨砚 (MoYan) |
| 项目类型 | 纯前端 Web 应用，PWA（渐进式 Web 应用） |
| 技术栈 | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| 代码量 | 约 3000 行（核心逻辑 + AI 扩展 + PWA） |
| 存储方式 | IndexedDB（主存储） |
| 离线能力 | Service Worker + Cache API |

---

## 二、文件结构

```
markdown-app/
├── src/
│   ├── App.tsx              # 主应用组件（UI 逻辑 + 状态管理 + AI 集成）
│   ├── main.tsx             # React 入口 + SW 注册
│   ├── index.css            # Tailwind 样式 + 全局 CSS 变量 + 组件样式
│   ├── types.ts             # 共享类型定义
│   ├── db/
│   │   └── index.ts         # IndexedDB 封装（notes + meta stores）
│   ├── ai/
│   │   ├── types.ts         # AI 配置类型定义
│   │   ├── service.ts       # LLM API 流式/非流式请求封装
│   │   └── prompts.ts       # Prompt 模板（续写/修正/解释）
│   ├── components/
│   │   ├── FloatingToolbar.tsx   # 选区浮动工具栏（Markdown 格式化）
│   │   ├── AIComplete.tsx        # AI 自动补全（流式建议）
│   │   ├── CodeExplain.tsx       # AI 代码解释弹窗
│   │   └── AISettings.tsx        # AI 配置面板（多提供商支持）
│   ├── hooks/
│   │   └── useNetworkStatus.ts   # 网络状态 React Hook
│   ├── sw-register.ts       # Service Worker 注册与更新管理
│   └── assets/              # 静态资源
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── manifest.json        # PWA 应用清单
│   └── sw.js                # Service Worker（缓存策略）
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

---

## 三、功能实现清单

### 3.1 笔记管理

| 功能 | 状态 | 说明 |
|------|------|------|
| 新建笔记 | ✅ | 快捷键 `⌘/Ctrl + N`，或点击「新建」按钮 |
| 编辑笔记 | ✅ | 选中笔记后直接编辑标题和内容 |
| 删除笔记 | ✅ | 笔记项右侧删除按钮，支持误删预防 |
| 笔记列表 | ✅ | 按更新时间倒序展示，带动画延迟 |
| 无标题处理 | ✅ | 标题为空时显示「无标题」 |

### 3.2 搜索功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 按标题搜索 | ✅ | 实时过滤，侧边栏统计匹配数量 |
| 按内容搜索 | ✅ | 同时匹配标题和内容 |
| 空结果提示 | ✅ | 搜索无结果时显示空状态 |

### 3.3 编辑器

| 功能 | 状态 | 说明 |
|------|------|------|
| 双栏布局 | ✅ | 左侧编辑器，右侧实时预览 |
| 标题输入 | ✅ | 独立的标题输入框 |
| Markdown 即时渲染 | ✅ | react-markdown 驱动 |
| 代码块语法高亮 | ✅ | react-syntax-highlighter + Prism，支持多语言 |
| 行号显示 | ✅ | 代码块自动标注 |
| placeholder 提示 | ✅ | 编辑器空时显示 Markdown 语法提示 |

### 3.4 主题系统

| 功能 | 状态 | 说明 |
|------|------|------|
| 浅色主题 | ✅ | 默认白色主题 |
| 深色主题 | ✅ | 深色背景，适合夜间 |
| 护眼主题（羊皮纸）| ✅ | 暖色调，类纸张质感 |
| 主题持久化 | ✅ | 保存到 IndexedDB |
| 主题切换动画 | ✅ | 平滑过渡 |

### 3.5 导入 / 导出

| 功能 | 状态 | 说明 |
|------|------|------|
| 导入 .md 文件 | ✅ | 自动提取文件名或首个 `#` 标题作为笔记标题 |
| 导出 Markdown | ✅ | 生成标准 .md 文件下载 |
| 导出 HTML | ✅ | 生成带样式的独立 HTML 文件 |
| 导出 PDF | ✅ | 通过浏览器打印功能实现 |

### 3.6 专注模式

| 功能 | 状态 | 说明 |
|------|------|------|
| 全屏编辑 | ✅ | 隐藏侧边栏和顶部栏 |
| 退出专注 | ✅ | 点击恢复按钮，或按 `Esc` 键 |

### 3.7 自动保存（IndexedDB）

| 功能 | 状态 | 说明 |
|------|------|------|
| 防抖保存 | ✅ | 编辑后 800ms 自动保存到 IndexedDB |
| 保存状态指示 | ✅ | 状态栏显示「已保存」/「新建中...」 |
| 数据隔离 | ✅ | 多标签页共享同一 IndexedDB |

### 3.8 统计与信息展示

| 功能 | 状态 | 说明 |
|------|------|------|
| 字数统计 | ✅ | 去除空白后的词数 |
| 字符统计 | ✅ | 内容总字符数 |
| 时间格式化 | ✅ | 「刚刚」「N 分钟前」「N 小时前」「N 天前」 |

### 3.9 响应式设计

| 功能 | 状态 | 说明 |
|------|------|------|
| 移动端适配 | ✅ | 汉堡菜单，侧边栏可折叠 |
| 触摸友好 | ✅ | 按钮尺寸适合触控 |
| 断点适配 | ✅ | 不同屏幕尺寸自适应布局 |

### 3.10 浮动工具栏（选区格式化）

| 功能 | 状态 | 说明 |
|------|------|------|
| 选区检测 | ✅ | 鼠标/键盘选中文本后自动弹出 |
| 行内格式化 | ✅ | 加粗、斜体、删除线、行内代码、链接 |
| 块级格式化 | ✅ | H1、H2、引用、无序列表、有序列表 |
| 代码块包裹 | ✅ | 选中文本一键包裹为代码块 |
| 智能定位 | ✅ | 基于 mirror div 计算选区绝对位置，自动边界 clamp |
| AI 解释 | ✅ | 选中代码后一键调用 AI 解释 |

### 3.11 AI 写作助手

| 功能 | 状态 | 说明 |
|------|------|------|
| 内置配置 | ✅ | 开发者通过 `.env.local` 提供 API Key，用户开箱即用 |
| 用户自定义覆盖 | ✅ | 高级用户可自行配置其他提供商/模型 |
| AI 续写 | ✅ | 输入停顿 1.5s 后触发，流式显示建议，Tab 接受 |
| Markdown 修正 | ✅ | 一键修正格式错误 |
| 代码解释 | ✅ | 选区代码块 → AI 中文解释，流式输出 |
| 多提供商 | ✅ | OpenAI / DeepSeek / 智谱 GLM |

### 3.11 AI 写作增强

| 功能 | 状态 | 说明 |
|------|------|------|
| AI 自动补全 | ✅ | 输入停顿 1.5s 后触发，光标在末尾时流式续写 |
| Tab 接受建议 | ✅ | 按 Tab 插入建议内容，Esc 取消 |
| Markdown 语法修正 | ✅ | 顶部工具栏魔杖按钮，一键修正格式错误 |
| 代码块解释 | ✅ | 浮动工具栏 AI 按钮，流式中文解释 |
| 多 LLM 支持 | ✅ | OpenAI / DeepSeek / 智谱 GLM |
| API 配置面板 | ✅ | 右上角齿轮图标，支持自定义 Base URL 和模型 |

### 3.12 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `⌘/Ctrl + N` | 新建笔记 |
| `Esc` | 退出专注模式 / 取消 AI 建议 / 关闭弹窗 |
| `Tab` | 接受 AI 自动补全建议 |

---

## 四、PWA 与离线化

### 4.1 IndexedDB 存储引擎

**数据库设计**：

```
moyan-db (version: 1)
├── objectStore: notes
│   ├── keyPath: id (string, UUID v4)
│   └── index: updatedAt (非唯一索引，倒序读取)
└── objectStore: meta
    └── keyPath: key (string)
```

**API 列表**：

| 函数 | 说明 |
|------|------|
| `getAllNotes()` | 按 updatedAt 倒序读取全部笔记 |
| `saveNote(note)` | 保存/更新单条笔记 |
| `deleteNote(id)` | 删除指定笔记 |
| `getMeta(key)` | 读取元数据（主题等） |
| `setMeta(key, value)` | 写入元数据 |
| `migrateFromLocalStorage()` | 从旧版 LocalStorage 迁移数据 |

**迁移策略**：
- 应用启动时自动检测 `markdown-notes-v3`（旧 LocalStorage key）
- 存在旧数据时批量导入 IndexedDB，成功后删除旧数据并设置迁移标记
- 无感升级，用户数据零丢失

### 4.2 Service Worker

**文件位置**：`public/sw.js`（构建后自动复制到 `dist/`）

**缓存策略**：

| 请求类型 | 策略 | 说明 |
|----------|------|------|
| 导航请求 (HTML) | Network First | 优先联网获取，失败回退缓存，离线也能访问 |
| 静态资源 (JS/CSS/SVG) | Cache First + SWR | 先读缓存保证速度，后台静默刷新最新版本 |
| 其他请求 | 不拦截 | 由浏览器正常处理 |

**生命周期**：

```
install  →  缓存核心静态资源  →  skipWaiting
    ↓
activate  →  清理旧版本缓存  →  clients.claim（立即接管页面）
    ↓
fetch     →  按策略拦截请求  →  返回缓存或网络响应
    ↓
message   →  接收 SKIP_WAITING  →  立即激活新版本
```

### 4.3 应用更新机制

**流程**：

1. 用户访问应用时，浏览器在后台检查 SW 更新
2. 新版本 SW 下载并安装完成后，触发 `updatefound` 事件
3. 顶部显示提示条：**「新版本已就绪，刷新即可体验」**
4. 用户点击「立即刷新」→ 向 waiting SW 发送 `SKIP_WAITING` 消息
5. 新 SW 激活 → `controllerchange` 事件 → 页面自动重载

### 4.4 网络状态感知

| 状态 | 指示 | 图标 |
|------|------|------|
| 在线 | 绿色「在线」文字 | 云朵对勾 |
| 离线 | 橙色「离线」文字 | 断开的 Wi-Fi |

- 基于 `navigator.onLine` + `online/offline` 事件
- 编辑器状态栏实时显示
- 离线不影响编辑（数据保存在 IndexedDB 本地）

---

## 五、数据模型

```typescript
interface Note {
  id: string           // UUID v4
  title: string        // 笔记标题
  content: string      // Markdown 内容
  createdAt: number    // 创建时间戳
  updatedAt: number    // 更新时间戳
}
```

---

## 六、性能指标

| 指标 | 目标 | 实际 |
|------|------|------|
| 首屏加载 | < 2s | ✅ 约 0.3s（缓存后） |
| 实时预览延迟 | < 100ms | ✅ 即时渲染 |
| 自动保存延迟 | 800ms debounce | ✅ |
| IndexedDB 读取 | < 50ms | ✅ 索引查询 |
| 离线可用性 | 100% | ✅ SW + IndexedDB |

---

## 七、AI 写作助手（已实现）

### 7.1 内置配置（开箱即用）

**设计理念**：作为开发者，你通过环境变量提供 API Key，终端用户无需任何配置即可享受 AI 功能。

**环境变量**（`.env.local`，gitignored）：

| 变量 | 必填 | 默认值 |
|------|------|--------|
| `VITE_AI_PROVIDER` | 否 | `deepseek` |
| `VITE_AI_API_KEY` | **是** | — |
| `VITE_AI_BASE_URL` | 否 | 提供商默认 |
| `VITE_AI_MODEL` | 否 | 提供商默认 |
| `VITE_AI_ENABLED` | 否 | `true`（只要 key 存在） |

**配置优先级**：

```
用户自定义配置 (IndexedDB) > 内置环境变量配置 > null
```

- 如果环境变量提供了 `VITE_AI_API_KEY`，AI 功能默认启用，用户打开即用
- 用户可以在设置面板中添加自己的配置来覆盖内置配置
- 恢复内置配置只需清除自定义覆盖即可

### 7.2 写作增强功能

| 功能 | 状态 | 技术方案 |
|------|------|----------|
| AI 自动补全 | ✅ | `AIComplete.tsx` + `chatStream()` 流式返回，debounce 1.5s 触发，Tab 接受 |
| Markdown 语法修正 | ✅ | `handleFixMarkdown()` + `MARKDOWN_FIX_SYSTEM` prompt |
| 代码块解释 | ✅ | `CodeExplain.tsx` + `buildCodeExplainPrompt()`，支持语言自动检测 |
| 浮动工具栏 | ✅ | `FloatingToolbar.tsx`，选中文本后显示 11 种 Markdown 格式化选项 |

### 7.3 多 LLM 提供商支持

| 提供商 | 默认模型 | 配置项 |
|--------|----------|--------|
| OpenAI | `gpt-4o-mini` | API Key + Base URL |
| DeepSeek | `deepseek-chat` | API Key + Base URL |
| 智谱 GLM | `glm-4-flash` | API Key + Base URL |
| 硅基流动 | `deepseek-ai/DeepSeek-V3` | API Key + Base URL |

### 7.4 文件结构

```
src/ai/
├── types.ts       # AIConfig / ChatMessage / StreamChunk 类型定义
├── env-config.ts  # 从 import.meta.env 读取内置配置
├── service.ts     # chatStream() / chat() 请求封装 + 配置读写
└── prompts.ts     # Prompt 模板（续写 / 修正 / 代码解释）
```

---

## 八、已知待优化项

- [ ] 笔记排序功能（目前按时间倒序，可考虑增加自定义排序）
- [ ] 笔记分类/标签功能
- [ ] 笔记富文本编辑器（当前为纯 Markdown）
- [ ] 包体积优化（react-syntax-highlighter 支持动态导入按需加载语言）
- [ ] AI 智能整理（自动标签、相似笔记推荐、语义搜索）
- [ ] AI 内容处理（翻译、格式转换、标题优化、可读性分析）
- [ ] 生产力工具（番茄钟、写作统计、目标提醒）

---

> 文档更新时间：2026-04-24
> 项目分支：main
> 最近提交：AI 内置配置 + 写作增强 + 浮动工具栏 + IndexedDB + PWA 离线化
