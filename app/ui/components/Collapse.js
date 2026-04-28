import PIXI from '../common/pixi';
import { drawRoundedRect, isTap } from '../common/utils';
import { COLOR, SIZE, FONT } from '../common/styles';
import Icon from './Icon';
import ScrollBox from './ScrollBox';

const HEADER_H = 88;
const ARROW_SIZE = 36;
const PAD_X = 24;

export class Collapse extends PIXI.Container {
    /**
     * @param {object} options
     * @param {string} options.title
     * @param {number} options.width
     * @param {PIXI.Container} options.content - 内容容器，需设置好内部布局
     * @param {number} options.height - 内容区高度，超出时溢出滚动
     * @param {boolean} [options.expanded=false]
     * @param {function} [options.onToggle]
     */
    constructor({
        title,
        width,
        content,
        height,
        expanded = false,
        onToggle,
    }) {
        super();
        this._panelW = width;
        this._contentH = height;
        this._expanded = expanded;
        this._animating = false;
        this._onToggle = onToggle;

        // 整体边框背景
        this._bg = new PIXI.Graphics();
        this._drawBg(expanded ? height : 0);
        this.addChild(this._bg);

        // 头部
        const header = new PIXI.Container();
        header.interactive = true;
        header.hitArea = new PIXI.Rectangle(0, 0, width, HEADER_H);

        const titleText = new PIXI.Text(title, {
            fontSize: SIZE.textSize, fill: COLOR.text, fontWeight: 'bold', fontFamily: FONT,
        });
        titleText.x = PAD_X;
        titleText.y = (HEADER_H - titleText.height) / 2;
        header.addChild(titleText);

        // 箭头图标
        const arrow = new Icon({ name: 'chevron-down', size: ARROW_SIZE, color: COLOR.textSec });
        arrow.x = width - PAD_X - ARROW_SIZE;
        arrow.y = (HEADER_H - ARROW_SIZE) / 2;
        arrow.pivot.set(ARROW_SIZE / 2, ARROW_SIZE / 2);
        arrow.x += ARROW_SIZE / 2;
        arrow.y += ARROW_SIZE / 2;
        header.addChild(arrow);
        this._arrow = arrow;

        // 点击头部切换
        let startY = 0;
        header.on('touchstart', (e) => { startY = e.data.global.y; });
        const onEnd = (e) => {
            if (isTap(startY, e.data.global.y)) {
                this.toggle();
            }
        };
        header.on('touchend', onEnd);
        header.on('touchendoutside', onEnd);

        this.addChild(header);

        // 内容区域（使用 ScrollBox 支持溢出滚动）
        const scrollBox = new ScrollBox({
            width,
            height,
            items: [content],
            padding: PAD_X,
            gap: 0,
            border: null,
            background: null,
            radius: 0,
        });
        scrollBox.y = HEADER_H;
        this._contentWrapper = scrollBox;
        this.addChild(scrollBox);

        // 让 ScrollBox 内部 mask 不渲染白色，但保留裁剪功能
        scrollBox._mask.renderable = false;

        // 初始状态
        if (!expanded) {
            this._resizeScrollMask(0);
            arrow.rotation = -Math.PI / 2;
        }
    }

    get expanded() {
        return this._expanded;
    }

    get totalHeight() {
        if (this._expanded) {
            return HEADER_H + this._contentH;
        }
        return HEADER_H;
    }

    _drawBg(h) {
        this._bg.clear();
        drawRoundedRect(this._bg, 0, 0, this._panelW, HEADER_H + h, 12, COLOR.card, COLOR.border);
    }

    _resizeScrollMask(h) {
        const mask = this._contentWrapper._mask;
        mask.clear();
        mask.beginFill(0xffffff);
        mask.drawRect(0, 0, this._panelW, h);
        mask.endFill();
    }

    toggle() {
        if (this._animating) return;
        if (this._expanded) {
            this._collapse();
        } else {
            this._expand();
        }
    }

    _expand() {
        this._expanded = true;
        this._animating = true;

        const duration = 200;
        let elapsed = 0;
        const targetH = this._contentH;
        const tweenFn = () => {
            elapsed += PIXI.ticker.shared.elapsedMS;
            const t = Math.min(elapsed / duration, 1);
            const ease = t * (2 - t);
            const h = targetH * ease;
            this._arrow.rotation = -Math.PI / 2 * (1 - ease);
            this._resizeScrollMask(h);
            this._drawBg(h);
            if (t >= 1) {
                this._animating = false;
                PIXI.ticker.shared.remove(tweenFn);
            }
        };
        PIXI.ticker.shared.add(tweenFn);
        if (this._onToggle) this._onToggle(true, this);
    }

    _collapse() {
        this._expanded = false;
        this._animating = true;

        const duration = 200;
        let elapsed = 0;
        const startH = this._contentH;
        const tweenFn = () => {
            elapsed += PIXI.ticker.shared.elapsedMS;
            const t = Math.min(elapsed / duration, 1);
            const ease = t * (2 - t);
            const h = startH * (1 - ease);
            this._arrow.rotation = -Math.PI / 2 * ease;
            this._resizeScrollMask(h);
            this._drawBg(h);
            if (t >= 1) {
                this._animating = false;
                PIXI.ticker.shared.remove(tweenFn);
            }
        };
        PIXI.ticker.shared.add(tweenFn);
        if (this._onToggle) this._onToggle(false, this);
    }
}

export default Collapse
