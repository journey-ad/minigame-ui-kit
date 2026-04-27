import PIXI from '@/js/ui/common/pixi';
import { TabBar, Input, stage, logger, COLOR, SIZE } from '@/js/ui/index';
import { initPlatform, patchCoordinateMapping, keyboardAdapter } from './platform';
import pageRegistry from '@/js/pages/index';

function init() {
  const { canvas, screenW, screenH } = initPlatform();

  const app = new PIXI.Application({
    width: screenW,
    height: screenH,
    view: canvas,
    backgroundColor: COLOR.bg,
    resolution: 1,
  });

  patchCoordinateMapping(canvas);
  Input.setDefaultAdapter(keyboardAdapter);

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
    },
  });
  tabBar.y = contentH;
  app.stage.addChild(tabBar);

  stage.init(app.stage, screenW, screenH);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
