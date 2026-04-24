import * as PIXI from '../common/pixi';
import { isTap } from '../common/utils';
import stage, { LAYER } from '../common/stage';

export class Overlay extends PIXI.Container {
    /**
     * @param {object} options
     * @param {number} [options.color=0x000000]
     * @param {number} [options.opacity=0.6]
     * @param {boolean} [options.closeOnTap=true]
     * @param {function} [options.onTap]
     */
    constructor({
        color = 0x000000,
        opacity = 0.6,
        closeOnTap = true,
        onTap,
    } = {}) {
        super();

        const screenW = stage.screenW;
        const screenH = stage.screenH;

        this.interactive = true;
        this.hitArea = new PIXI.Rectangle(0, 0, screenW, screenH);

        // 遮罩背景
        const bg = new PIXI.Graphics();
        bg.beginFill(color, opacity);
        bg.drawRect(0, 0, screenW, screenH);
        bg.endFill();
        bg.interactive = true;
        bg.hitArea = new PIXI.Rectangle(0, 0, screenW, screenH);
        this.addChild(bg);
        this._bg = bg;

        // 点击遮罩
        let startY = 0;
        bg.on('touchstart', (e) => { startY = e.data.global.y; });
        const onEnd = (e) => {
            if (isTap(startY, e.data.global.y)) {
                if (onTap) onTap();
                if (closeOnTap) this.close();
            }
        };
        bg.on('touchend', onEnd);
        bg.on('touchendoutside', onEnd);
    }

    show() {
        if (this._showing) return;
        this._showing = true;
        this._closing = false;
        stage.addTo(LAYER.LAYER_0, this);

        this.alpha = 0;
        const duration = 150;
        let elapsed = 0;

        const tweenFn = () => {
            elapsed += PIXI.ticker.shared.elapsedMS;
            const t = Math.min(elapsed / duration, 1);
            this.alpha = t * (2 - t);
            if (t >= 1) {
                PIXI.ticker.shared.remove(tweenFn);
            }
        };
        PIXI.ticker.shared.add(tweenFn);
        return this;
    }

    close() {
        if (this._closing) return;
        this._closing = true;

        const duration = 120;
        let elapsed = 0;

        const tweenFn = () => {
            elapsed += PIXI.ticker.shared.elapsedMS;
            const t = Math.min(elapsed / duration, 1);
            this.alpha = 1 - t * (2 - t);
            if (t >= 1) {
                PIXI.ticker.shared.remove(tweenFn);
                stage.removeFrom(LAYER.LAYER_0, this);
                this._showing = false;
                this.destroy({ children: true });
            }
        };
        PIXI.ticker.shared.add(tweenFn);
    }
}

export default Overlay
