import PIXI from '../common/pixi';
import { COLOR, SIZE, FONT } from '../common/styles';
import stage, { LAYER } from '../common/stage';
import logger from '../common/logger';

let _current = null;
let _tickFn = null;

export const Loading = {
    show({ text = '' } = {}) {
        logger.debug('[Loading] show', text);
        if (_current) {
            Loading.hide();
        }

        const screenW = stage.screenW;
        const screenH = stage.screenH;

        const container = new PIXI.Container();
        container.interactive = true;
        container.hitArea = new PIXI.Rectangle(0, 0, screenW, screenH);

        // 遮罩
        const overlay = new PIXI.Graphics();
        overlay.beginFill(0x000000, 0.4);
        overlay.drawRect(0, 0, screenW, screenH);
        overlay.endFill();
        container.addChild(overlay);

        // 居中容器
        const boxW = 200;
        const boxH = text ? 200 : 160;
        const box = new PIXI.Graphics();
        box.beginFill(0x000000, 0.8);
        box.drawRoundedRect(0, 0, boxW, boxH, 16);
        box.endFill();
        box.x = (screenW - boxW) / 2;
        box.y = (screenH - boxH) / 2;
        container.addChild(box);

        // 旋转圆弧
        const arcR = 30;
        const arcG = new PIXI.Graphics();
        arcG.x = boxW / 2;
        arcG.y = text ? boxH / 2 - 20 : boxH / 2;
        box.addChild(arcG);

        // 文字
        if (text) {
            const label = new PIXI.Text(text, {
                fontSize: SIZE.textSizeSm,
                fill: COLOR.white,
                fontFamily: FONT,
                align: 'center',
            });
            label.anchor.set(0.5, 0);
            label.x = boxW / 2;
            label.y = boxH / 2 + 20;
            box.addChild(label);
        }

        // 旋转动画
        let angle = 0;
        _tickFn = () => {
            angle += 0.08;
            arcG.clear();
            arcG.lineStyle(5, COLOR.white);
            arcG.arc(0, 0, arcR, angle, angle + Math.PI * 1.2);
        };
        PIXI.ticker.shared.add(_tickFn);

        stage.addTo(LAYER.LAYER_1, container);
        _current = container;
    },

    hide() {
        if (!_current) return;
        logger.debug('[Loading] hide');
        if (_tickFn) {
            PIXI.ticker.shared.remove(_tickFn);
            _tickFn = null;
        }
        stage.removeFrom(LAYER.LAYER_1, _current);
        _current.destroy({ children: true });
        _current = null;
    },
};

export default Loading;
