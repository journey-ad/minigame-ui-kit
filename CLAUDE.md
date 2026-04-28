# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

基于 PixiJS 的多平台 UI 组件库 Demo，支持微信小游戏和 Web 浏览器两种运行环境。包管理器使用 pnpm。

## Development

```bash
pnpm dev:web            # Web 开发服务器 (Vite)
pnpm dev:weixin         # 微信小游戏 watch 模式
pnpm build:web          # Web 构建 → dist/web/
pnpm build:weixin       # 微信构建 → dist/weixin/
```

微信小游戏：`pnpm build:weixin` 后用微信开发者工具打开 `dist/weixin/` 即可运行。

## Architecture

### 多平台架构

```
app/                  # 共享应用代码（平台无关）
platforms/
  weixin/             # 微信小游戏工程模板
  web/                # Web 工程模板 (Vite)
dist/
  weixin/             # 微信构建产物
  web/                # Web 构建产物
```

### 构建系统

- **微信**：`scripts/build-weixin.js` 用 esbuild 将 `app/main.js` 打包为 `libs/runtime.js`，连同 `platforms/weixin/` 模板文件和图标 PNG 一并复制到 `dist/weixin/`。
- **Web**：`scripts/build-web.js` 用 Vite 以 `platforms/web/` 为入口构建，产物输出到 `dist/web/`。
- 两个构建脚本都通过 `define` 注入 `__ICON_BASE__`（微信为 `"images/icons"`，Web 为 `"./icons"`），`app/ui/icons/index.js` 中的 `ICON_BASE` 据此确定图标加载路径。

### 平台适配器模式

各平台的 `platform.js` 统一导出 `{ init, patchCoordinateMapping, keyboardAdapter }`，由平台入口文件赋值到 `globalThis.__PLATFORM__`。`app/main.js` 中的 `Main` 类通过 `globalThis.__PLATFORM__` 访问平台能力，不直接依赖任何平台 API。

### 启动流程

**微信入口** `platforms/weixin/game.js`（3 行，链式导入）：
1. `import './libs/weapp-adapter.js'`（副作用导入，模拟浏览器 API）
2. `import './libs/platform.js'`（赋值 `globalThis.__PLATFORM__`）
3. `import './libs/runtime.js'`（esbuild 打包后的 `app/main.js`，实例化 `Main`）

**Web 入口** `platforms/web/main.js`（2 行）：
1. `import './platform.js'`（赋值 `globalThis.__PLATFORM__`）
2. `import '@/app/main'`（`@` 别名指向项目根，实例化 `Main`）

**Web 平台适配器**（`platforms/web/platform.js`）：
- `init()`：创建全屏 canvas，尺寸 = `window.innerWidth/Height * devicePixelRatio`
- `patchCoordinateMapping()`：修补 `InteractionManager.prototype.mapPositionToPoint` 以适配 canvas 的 CSS 缩放
- `keyboardAdapter`：通过悬浮在 canvas 上的隐藏 `<input>` 元素实现文本输入

**微信平台适配器**（`platforms/weixin/platform.js`）：
- `init()`：读取 `GameGlobal.canvas` 和 `wx.getSystemInfoSync()` 获取物理像素尺寸
- `patchCoordinateMapping()`：修补 PIXI 交互管理器的坐标映射以适配小游戏触摸事件
- `keyboardAdapter`：封装 `wx.showKeyboard` / `wx.hideKeyboard`

**`Main` 构造函数**（`app/main.js`）：
1. 从 `globalThis.__PLATFORM__` 获取平台适配器
2. 调用 `platform.init()` 获取 canvas 和屏幕尺寸
3. 创建 `PIXI.Application`
4. 调用 `platform.patchCoordinateMapping()` 修补触摸坐标映射
5. 注册 `platform.keyboardAdapter` 到 `Input` 组件
6. 从 `app/pages/index.js` 注册表实例化所有 Tab 页面，设置 clip mask 防止内容溢出
7. 创建 `TabBar` 控制页面切换
8. 调用 `stage.init()` 初始化全局层级系统
9. 将 `PIXI` 挂到 `globalThis.PIXI`

### PixiJS 包装（`app/ui/common/pixi.js`）

加载 `app/ui/libs/pixi.min.js`（PixiJS v4），导出 `PIXI`。同时对 `InteractionManager.prototype.processInteractive` 做 monkey-patch：在命中测试前调用 `displayObject.updateTransform()`，修复 PIXI v4 因 worldTransform 未及时更新导致 hitArea 判定位置错误的问题。所有使用 PIXI 的模块都应从此文件导入而非直接引用 `window.PIXI`。

### 层级系统（`app/ui/common/stage.js`）

全局 `stage` 对象管理三个 `PIXI.Container` 层：
- `LAYER_0`：下拉框等附加内容（显示在页面内容上方）
- `LAYER_1`：Dialog、ActionSheet、Overlay 等弹窗
- `LAYER_2`：Toast、Loading 等最顶层提示

组件通过 `stage.addTo(LAYER.LAYER_X, child)` 挂载，支持 `stage.init()` 前的缓存调用。

### 组件体系（`app/ui/`）

所有组件从 `app/ui/index.js` 统一导出。

- **基础组件**：`Button`、`Icon`、`Input`（依赖 `keyboardAdapter`）、`CheckBox`、`Radio`、`Switch`、`Slider`、`ProgressBar`
- **容器组件**：`Page`（带惯性滚动）、`ScrollBox`、`Swiper`、`Collapse`
- **浮层组件**：`Dialog`、`Toast`、`ActionSheet`、`Select`、`Overlay`、`FloatBox`（悬浮球）、`Loading`
- **导航组件**：`TabBar`、`Router`（支持 `push/pop/replace/popToRoot`，`slide`/`fade` 过渡动画）
- **列表组件**：`ListItem`

### 通用工具（`app/ui/common/`）

- **`pixi.js`**：PIXI v4 包装，含交互修复 monkey-patch
- **`stage.js`**：三级浮层系统
- **`styles.js`**：`COLOR` 主题色板（深色主题）、`SIZE` 设计稿基准 1080×1920、`FONT` 默认字体
- **`logger.js`**：分级日志（DEBUG/INFO/WARN/ERROR/NONE），带样式 console 输出
- **`utils.js`**：`drawRoundedRect`、`isTap`、`lerpColor`、`nextTick`（通过 `PIXI.ticker.shared` 调度下一帧回调）
- **`tapOutside.js`**：注册目标元素，在点击目标外部时触发回调。通过 monkey-patch `InteractionManager.prototype.onPointerDown/Up` 实现，供 Select、Dialog 等组件使用

### 页面注册（`app/pages/index.js`）

页面以数组形式注册 `{ label, icon, Page }`，`Main` 按顺序实例化并绑定到 TabBar。`icon` 字段对应 Lucide 图标库名称。新增页面只需在此数组追加。

### Router 组件

Router 维护路由栈，路由定义格式：
```js
{ path: '/detail/:id', builder: (params, router) => new DetailView(params, router) }
```
路由视图是普通 `PIXI.Container`，可选实现 `onEnter(params)` 和 `onLeave()` 生命周期方法。过渡动画通过 `PIXI.ticker.shared` 驱动帧动画实现。

### 图标系统（`app/ui/icons/`）

`ALL_ICONS` 导出约 1943 个 Lucide 图标名称。`ICON_BASE` 由构建时的 `__ICON_BASE__` define 注入，指向 PNG 图标目录。`Icon` 组件支持两种模式：传入 `name` 加载图标库图标，传 `path` 加载本地图片。
