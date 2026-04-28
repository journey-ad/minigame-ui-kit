import PIXI from './ui/common/pixi';
import { TabBar, Input, stage, logger, COLOR, SIZE } from './ui/index';
import pageRegistry from './pages/index';

class Main {
    constructor() {
        const platform = globalThis.__PLATFORM__;
        logger.setLevel(logger.LEVEL.DEBUG);
        logger.info('PixiJS UI Demo 启动');

        const { canvas, screenW, screenH } = platform.init();

        const app = new PIXI.Application({
            width: screenW,
            height: screenH,
            view: canvas,
            backgroundColor: COLOR.bg,
            resolution: 1,
        });

        platform.patchCoordinateMapping(canvas, screenW);
        Input.setDefaultAdapter(platform.keyboardAdapter);

        const contentH = screenH - SIZE.tabH;

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

        stage.init(app.stage, screenW, screenH);
        logger.info('UI 初始化完成', screenW, screenH);
    }
}

globalThis.PIXI = PIXI;

new Main();
