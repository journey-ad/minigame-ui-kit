import * as PIXI from '../common/pixi';
import { COLOR, SIZE, FONT } from '../common/styles';
import stage, { LAYER } from '../common/stage';
import logger from '../common/logger';

let _current = null;

function drawSuccessIcon(g, cx, cy, r) {
    g.beginFill(COLOR.success);
    g.drawCircle(cx, cy, r);
    g.endFill();
    g.lineStyle(6, COLOR.white);
    g.moveTo(cx - r * 0.35, cy);
    g.lineTo(cx - r * 0.05, cy + r * 0.3);
    g.lineTo(cx + r * 0.4, cy - r * 0.25);
}

function drawErrorIcon(g, cx, cy, r) {
    g.beginFill(COLOR.danger);
    g.drawCircle(cx, cy, r);
    g.endFill();
    g.lineStyle(6, COLOR.white);
    const d = r * 0.3;
    g.moveTo(cx - d, cy - d);
    g.lineTo(cx + d, cy + d);
    g.moveTo(cx + d, cy - d);
    g.lineTo(cx - d, cy + d);
}

function drawWarningIcon(g, cx, cy, r) {
    g.beginFill(COLOR.warning);
    g.drawCircle(cx, cy, r);
    g.endFill();
    // 感叹号
    g.beginFill(COLOR.textDark);
    g.drawRoundedRect(cx - 4, cy - r * 0.45, 8, r * 0.55, 3);
    g.endFill();
    g.beginFill(COLOR.textDark);
    g.drawCircle(cx, cy + r * 0.35, 5);
    g.endFill();
}

const ICON_DRAWERS = {
    success: drawSuccessIcon,
    error: drawErrorIcon,
    warning: drawWarningIcon,
};

export const Toast = {
    show({ text = '', type = 'success', duration = 2000 } = {}) {
        logger.debug(`[Toast] ${type}: ${text}`);
        if (_current && _current.parent) {
            stage.removeFrom(LAYER.LAYER_2, _current);
            _current.destroy({ children: true });
            _current = null;
        }

        const container = new PIXI.Container();

        const iconR = 24;
        const padX = 48;
        const padY = 28;
        const iconTextGap = 20;

        const label = new PIXI.Text(text, {
            fontSize: SIZE.textSize,
            fill: COLOR.white,
            fontFamily: FONT,
        });

        const totalW = iconR * 2 + iconTextGap + label.width + padX * 2;
        const totalH = Math.max(iconR * 2, label.height) + padY * 2;

        // 背景
        const bg = new PIXI.Graphics();
        bg.beginFill(0x000000, 0.8);
        bg.drawRoundedRect(0, 0, totalW, totalH, 16);
        bg.endFill();
        container.addChild(bg);

        // 图标
        const iconG = new PIXI.Graphics();
        const drawIcon = ICON_DRAWERS[type];
        if (drawIcon) {
            drawIcon(iconG, padX + iconR, totalH / 2, iconR);
        }
        container.addChild(iconG);

        // 文字
        label.x = padX + iconR * 2 + iconTextGap;
        label.y = (totalH - label.height) / 2;
        container.addChild(label);

        container.x = (stage.screenW - totalW) / 2;
        container.y = (stage.screenH - totalH) / 2;

        stage.addTo(LAYER.LAYER_2, container);
        _current = container;

        // 自动消失
        const fadeStart = duration - 300;
        let elapsed = 0;

        const ticker = PIXI.ticker.shared;
        const onTick = (dt) => {
            elapsed += ticker.elapsedMS;
            if (elapsed >= fadeStart && elapsed < duration) {
                container.alpha = 1 - (elapsed - fadeStart) / 300;
            }
            if (elapsed >= duration) {
                ticker.remove(onTick);
                stage.removeFrom(LAYER.LAYER_2, container);
                container.destroy({ children: true });
                if (_current === container) {
                    _current = null;
                }
            }
        };
        ticker.add(onTick);
    },
};

export default Toast;
