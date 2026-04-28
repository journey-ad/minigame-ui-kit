import PIXI from '../common/pixi';
import { drawRoundedRect, isTap } from '../common/utils';
import { COLOR, SIZE, FONT } from '../common/styles';
import stage, { LAYER } from '../common/stage';
import tapOutside from '../common/tapOutside';
import logger from '../common/logger';

export class Select extends PIXI.Container {
    constructor({ width, height, items, onChange } = {}) {
        super();
        this._w = width;
        this._h = height;
        this._items = items;
        this._open = false;
        this._startY = 0;

        this.interactive = true;
        this.hitArea = new PIXI.Rectangle(0, 0, width, height);

        const bg = new PIXI.Graphics();
        drawRoundedRect(bg, 0, 0, width, height, SIZE.inputR, COLOR.surface, COLOR.border);
        this.addChild(bg);

        this._arrow = new PIXI.Text('\u25BC', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        this._arrow.x = Math.floor(width - SIZE.textSizeSm * 1.75);
        this._arrow.y = (height - this._arrow.height) / 2;
        this.addChild(this._arrow);

        this._selected = new PIXI.Text(items[0], { fontSize: SIZE.textSize, fill: COLOR.text, fontFamily: FONT });
        this._selected.x = 20;
        this._selected.y = (height - this._selected.height) / 2;
        this.addChild(this._selected);

        if (onChange) {
            this.on('change', onChange);
        }

        this._buildPanel();
        this._bindEvents();
    }

    _setOpen(v) {
        this._open = v;
        logger.debug(`[Select] ${v ? 'open' : 'close'}`);
        this._arrow.text = v ? '\u25B2' : '\u25BC';

        if (this._tweenFn) {
            PIXI.ticker.shared.remove(this._tweenFn);
        }

        if (v) {
            const pos = this.getGlobalPosition();
            this._panel.x = pos.x;
            this._panel.y = pos.y + this._h + 4;
            this._panel.visible = true;
            this._panel.pivot.y = 0;
            tapOutside.on(this, [this, this._panel], () => this._setOpen(false));
            stage.addTo(LAYER.LAYER_0, this._panel);
        }

        const startAlpha = this._panel.alpha;
        const startScale = this._panel.scale.y;
        const targetAlpha = v ? 1 : 0;
        const targetScale = v ? 1 : 0;
        const duration = 120;
        let elapsed = 0;

        this._tweenFn = () => {
            elapsed += PIXI.ticker.shared.elapsedMS;
            const t = Math.min(elapsed / duration, 1);
            const ease = t * (2 - t);
            this._panel.alpha = startAlpha + (targetAlpha - startAlpha) * ease;
            this._panel.scale.y = startScale + (targetScale - startScale) * ease;
            if (t >= 1) {
                PIXI.ticker.shared.remove(this._tweenFn);
                this._tweenFn = null;
                if (!v) {
                    this._panel.visible = false;
                    stage.removeFrom(LAYER.LAYER_0, this._panel);
                    tapOutside.off(this);
                }
            }
        };
        PIXI.ticker.shared.add(this._tweenFn);
    }

    _buildPanel() {
        const { _w: w, _h: h, _items: items } = this;

        this._panel = new PIXI.Container();
        this._panel.visible = false;
        this._panel.interactive = true;
        this._panel.hitArea = new PIXI.Rectangle(0, 0, w, h * items.length);

        const panelBg = new PIXI.Graphics();
        drawRoundedRect(panelBg, 0, 0, w, h * items.length, SIZE.inputR, COLOR.surfaceLight, COLOR.border);
        this._panel.addChild(panelBg);

        items.forEach((itemText, idx) => {
            const item = new PIXI.Container();
            item.interactive = true;
            item.hitArea = new PIXI.Rectangle(0, 0, w, h);
            item.y = h * idx;
            item._startY = 0;

            const itemBg = new PIXI.Graphics();
            item.addChild(itemBg);

            const label = new PIXI.Text(itemText, { fontSize: SIZE.textSize, fill: COLOR.text, fontFamily: FONT });
            label.x = 20;
            label.y = (h - label.height) / 2;
            item.addChild(label);

            item.on('touchstart', (e) => {
                e.stopPropagation();
                item._startY = e.data.global.y;
            });

            const onItemEnd = (e) => {
                if (isTap(item._startY, e.data.global.y)) {
                    this._selected.text = itemText;
                    this._setOpen(false);
                    this.emit('change', itemText);
                }
            };
            item.on('touchend', onItemEnd);
            item.on('touchendoutside', onItemEnd);

            this._panel.addChild(item);
        });
    }

    _bindEvents() {
        this.on('touchstart', (e) => {
            this._startY = e.data.global.y;
        });

        const onSelectEnd = (e) => {
            if (isTap(this._startY, e.data.global.y)) {
                this._setOpen(!this._open);
            }
        };
        this.on('touchend', onSelectEnd);
        this.on('touchendoutside', onSelectEnd);
    }

    destroy(options) {
        if (this._tweenFn) {
            PIXI.ticker.shared.remove(this._tweenFn);
            this._tweenFn = null;
        }
        if (this._open) {
            stage.removeFrom(LAYER.LAYER_0, this._panel);
            tapOutside.off(this);
        }
        if (this._panel) {
            this._panel.destroy({ children: true });
            this._panel = null;
        }
        super.destroy(options);
    }
}

export default Select
