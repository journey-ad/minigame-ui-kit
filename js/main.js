import '../libs/weapp-adapter.js';
import * as PIXI from '../libs/pixi.min';
import { TabBar, Input, stage, logger, COLOR, SIZE } from './ui/index';
import { initPlatform, patchCoordinateMapping, keyboardAdapter } from './platform';
import pageRegistry from './pages/index';

export default class Main {
    constructor() {
        logger.setLevel(logger.LEVEL.DEBUG);
        logger.info('PixiJS UI Demo 启动');

        const platform = initPlatform();

        const { canvas, screenW, screenH } = platform;

        // 创建 PIXI 应用
        const app = new PIXI.Application({
            width: screenW,
            height: screenH,
            view: canvas,
            backgroundColor: COLOR.bg,
            resolution: 1,
        });

        // 修补坐标映射
        patchCoordinateMapping(canvas, screenW);
        // 设置输入适配器
        Input.setDefaultAdapter(keyboardAdapter);

        const contentH = screenH - SIZE.tabH;

        // 内容遮罩
        const mask = new PIXI.Graphics();
        mask.beginFill(0xFFFFFF);
        mask.drawRect(0, 0, screenW, contentH);
        mask.endFill();
        app.stage.addChild(mask);

        const content = new PIXI.Container();
        content.mask = mask;
        app.stage.addChild(content);

        const pages = pageRegistry.map(entry => new entry.Page(screenW, contentH));
        pages.forEach((page, i) => {
            page.visible = i === 0;
            content.addChild(page);
        });

        // TabBar
        const tabBar = new TabBar({
            screenWidth: screenW,
            tabs: pageRegistry,
            onSwitch: (idx) => {
                pages.forEach((page, j) => { page.visible = j === idx; });
                logger.info(`切换 Tab ${idx}`);
            },
        });
        tabBar.y = contentH;
        app.stage.addChild(tabBar);

        // 初始化舞台
        stage.init(app.stage, screenW, screenH);
        logger.info('UI 初始化完成', screenW, screenH);
    }
}
