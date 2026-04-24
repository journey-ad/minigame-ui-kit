import * as PIXI from '../common/pixi';
import { drawRoundedRect, isTap } from '../common/utils';
import { COLOR, SIZE, FONT } from '../common/styles';
import stage, { LAYER } from '../common/stage';

export const ActionSheet = {
    show({ actions = [], cancelText = '取消' } = {}) {
        return new Promise((resolve, reject) => {
            const screenW = stage.screenW;
            const screenH = stage.screenH;

            const container = new PIXI.Container();
            container.interactive = true;
            container.hitArea = new PIXI.Rectangle(0, 0, screenW, screenH);

            // 遮罩
            const overlay = new PIXI.Graphics();
            overlay.beginFill(0x000000, 0.6);
            overlay.drawRect(0, 0, screenW, screenH);
            overlay.endFill();
            container.addChild(overlay);

            const close = (result) => {
                if (container._closing) return;
                container._closing = true;

                const startPanelY = panel.y;
                const targetPanelY = screenH;
                const duration = 200;
                let elapsed = 0;

                const tweenFn = () => {
                    elapsed += PIXI.ticker.shared.elapsedMS;
                    const t = Math.min(elapsed / duration, 1);
                    const ease = t * (2 - t);
                    overlay.alpha = 1 - ease;
                    panel.y = startPanelY + (targetPanelY - startPanelY) * ease;
                    if (t >= 1) {
                        PIXI.ticker.shared.remove(tweenFn);
                        stage.removeFrom(LAYER.LAYER_1, container);
                        container.destroy({ children: true });
                        if (result !== undefined) {
                            resolve(result);
                        } else {
                            reject();
                        }
                    }
                };
                PIXI.ticker.shared.add(tweenFn);
            };

            // 点击遮罩关闭
            let overlayStartY = 0;
            overlay.interactive = true;
            overlay.hitArea = new PIXI.Rectangle(0, 0, screenW, screenH);
            overlay.on('touchstart', (e) => { overlayStartY = e.data.global.y; });
            const onOverlayEnd = (e) => {
                if (isTap(overlayStartY, e.data.global.y)) {
                    close();
                }
            };
            overlay.on('touchend', onOverlayEnd);
            overlay.on('touchendoutside', onOverlayEnd);

            // 面板
            const padX = 20;
            const itemH = 120;
            const panelW = screenW - padX * 2;
            const gap = 16;
            const cancelH = itemH;
            const listH = itemH * actions.length;
            const panelTotalH = listH + gap + cancelH + 40;

            const panel = new PIXI.Container();
            panel.x = padX;
            panel.y = screenH - panelTotalH;
            panel.interactive = true;
            panel.hitArea = new PIXI.Rectangle(0, 0, panelW, panelTotalH);
            container.addChild(panel);

            // 列表背景
            const listBg = new PIXI.Graphics();
            drawRoundedRect(listBg, 0, 0, panelW, listH, 16, COLOR.card);
            panel.addChild(listBg);

            // 操作项
            actions.forEach((action, idx) => {
                const item = new PIXI.Container();
                item.interactive = true;
                item.hitArea = new PIXI.Rectangle(0, 0, panelW, itemH);
                item.y = idx * itemH;

                const label = new PIXI.Text(action.name, {
                    fontSize: SIZE.textSize,
                    fill: COLOR.text,
                    fontFamily: FONT,
                });
                label.anchor.set(0.5);
                label.x = panelW / 2;
                label.y = itemH / 2;
                item.addChild(label);

                // 分割线
                if (idx > 0) {
                    const line = new PIXI.Graphics();
                    line.beginFill(COLOR.border);
                    line.drawRect(20, 0, panelW - 40, 1);
                    line.endFill();
                    item.addChild(line);
                }

                item._startY = 0;
                item.on('touchstart', (e) => {
                    e.stopPropagation();
                    item._startY = e.data.global.y;
                });
                const onItemEnd = (e) => {
                    if (isTap(item._startY, e.data.global.y)) {
                        close(action);
                    }
                };
                item.on('touchend', onItemEnd);
                item.on('touchendoutside', onItemEnd);

                panel.addChild(item);
            });

            // 取消按钮
            const cancelBg = new PIXI.Graphics();
            drawRoundedRect(cancelBg, 0, 0, panelW, cancelH, 16, COLOR.card);
            cancelBg.y = listH + gap;
            cancelBg.interactive = true;
            cancelBg.hitArea = new PIXI.Rectangle(0, 0, panelW, cancelH);
            panel.addChild(cancelBg);

            const cancelLabel = new PIXI.Text(cancelText, {
                fontSize: SIZE.textSize,
                fill: COLOR.textSec,
                fontFamily: FONT,
            });
            cancelLabel.anchor.set(0.5);
            cancelLabel.x = panelW / 2;
            cancelLabel.y = cancelH / 2;
            cancelBg.addChild(cancelLabel);

            let cancelStartY = 0;
            cancelBg.on('touchstart', (e) => {
                e.stopPropagation();
                cancelStartY = e.data.global.y;
            });
            const onCancelEnd = (e) => {
                if (isTap(cancelStartY, e.data.global.y)) {
                    close();
                }
            };
            cancelBg.on('touchend', onCancelEnd);
            cancelBg.on('touchendoutside', onCancelEnd);

            stage.addTo(LAYER.LAYER_1, container);

            // 入场动画
            const finalPanelY = panel.y;
            panel.y = screenH;
            overlay.alpha = 0;
            const duration = 180;
            let animElapsed = 0;

            const inTween = () => {
                animElapsed += PIXI.ticker.shared.elapsedMS;
                const t = Math.min(animElapsed / duration, 1);
                const ease = t * (2 - t);
                overlay.alpha = ease;
                panel.y = screenH + (finalPanelY - screenH) * ease;
                if (t >= 1) {
                    PIXI.ticker.shared.remove(inTween);
                }
            };
            PIXI.ticker.shared.add(inTween);
        });
    },
};

export default ActionSheet;
