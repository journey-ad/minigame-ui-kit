# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 PixiJS 的微信小游戏 UI 组件库 Demo，运行在微信小游戏环境（`compileType: "game"`）。使用微信开发者工具开发和预览，无 npm 构建流程。

## Development

用微信开发者工具打开项目根目录即可运行。无独立的构建/测试命令。

入口：`game.js` → `js/main.js`

## Architecture

### 启动流程

`Main` 构造函数（`js/main.js`）负责：
1. 调用 `initPlatform()`（`js/platform.js`）获取 canvas 和屏幕尺寸
2. 创建 `PIXI.Application`
3. 修补触摸坐标映射（`patchCoordinateMapping`）
4. 注册微信键盘适配器到 `Input` 组件
5. 从 `js/pages/index.js` 注册表实例化所有 Tab 页面
6. 创建 `TabBar` 控制页面切换
7. 调用 `stage.init()` 初始化全局层级系统

### 层级系统（`js/ui/common/stage.js`）

全局 `stage` 对象管理三个 `PIXI.Container` 层：
- `LAYER_0`：下拉框等附加内容（显示在页面内容上方）
- `LAYER_1`：Dialog 等弹窗
- `LAYER_2`：Toast 等最顶层提示

组件通过 `stage.addTo(LAYER.LAYER_X, child)` 挂载，支持 `stage.init()` 前的缓存调用。

### 组件体系（`js/ui/`）

所有组件从 `js/ui/index.js` 统一导出。

- **基础组件**：`Button`、`Icon`、`Input`（依赖 `keyboardAdapter`）、`CheckBox`、`Radio`、`Switch`、`Slider`、`ProgressBar`
- **容器组件**：`Page`（带惯性滚动）、`ScrollBox`、`Swiper`、`Collapse`
- **浮层组件**：`Dialog`、`Toast`、`ActionSheet`、`Select`、`Overlay`、`FloatBox`（悬浮球）
- **导航组件**：`TabBar`、`Router`（支持 `push/pop/replace/popToRoot`，`slide`/`fade` 过渡动画）
- **列表组件**：`ListItem`

### 样式常量（`js/ui/common/styles.js`）

- `COLOR`：主题色板（深色主题，`bg: 0x1A1A2E`）
- `SIZE`：设计稿基准 1080×1920，含各组件默认尺寸
- `FONT`：默认字体 `'Arial'`

### 页面注册（`js/pages/index.js`）

页面以数组形式注册 `{ label, icon, Page }`，`Main` 按顺序实例化并绑定到 TabBar。新增页面只需在此数组追加。

### 平台适配（`js/platform.js`）

- `initPlatform()`：读取 `GameGlobal.canvas` 和 `wx.getSystemInfoSync()` 获取物理像素尺寸
- `patchCoordinateMapping()`：修补 PIXI 交互管理器的坐标映射以适配小游戏触摸事件
- `keyboardAdapter`：封装 `wx.showKeyboard` / `wx.hideKeyboard`，供 `Input` 组件调用

### Router 组件

`Router` 维护路由栈，路由定义格式：
```js
{ path: '/detail/:id', builder: (params, router) => new DetailView(params, router) }
```
支持路径参数（`:param`），过渡动画通过 `PIXI.ticker.shared` 驱动帧动画实现。
