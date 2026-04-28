import PIXI from '../common/pixi';
import { COLOR, SIZE } from '../common/styles';
import logger from '../common/logger';
import { Icon } from './Icon';
import { stage } from '../common/stage';

const SNAP_THRESHOLD = 20;
const SHADOW_LAYERS = 8; // 模拟模糊阴影的层数

export class FloatBox extends PIXI.Container {
    constructor({
        size = 120,
        bgColor = COLOR.primary,
        border = 0,
        borderColor = COLOR.white,
        borderRadius = 0,
        icon = null,
        iconColor = COLOR.white,
        image = null,
        text = null,
        textColor = COLOR.white,
        padding = 20,
        opacity = 1,
        x = SIZE.W - 180,
        y = SIZE.H / 2,
        onTap,
    } = {}) {
        super();

        this._size = size;
        this._border = border;
        this._borderColor = borderColor;
        this._borderRadius = Math.max(0, Math.min(1, borderRadius));
        this._dragging = false;
        this._dragOffsetX = 0;
        this._dragOffsetY = 0;
        this._startX = 0;
        this._startY = 0;
        this._moved = false;

        this.pivot.set(size / 2, size / 2);
        this.interactive = true;
        this.hitArea = new PIXI.Rectangle(0, 0, size, size);

        // 模糊阴影：多层半透明圆，向右下偏移，半径递增、透明度递减
        this._shadow = new PIXI.Graphics();
        this._drawShadow();
        this.addChild(this._shadow);

        // 主体
        this._bg = new PIXI.Graphics();
        this._drawBg(bgColor);
        this.addChild(this._bg);

        if (icon) {
            const iconSize = size - padding * 2;
            this._content = new Icon({ name: icon, size: iconSize, color: iconColor });
            this._content.x = padding;
            this._content.y = padding;
            this.addChild(this._content);
        } else if (image) {
            const imgSize = size - padding * 2;
            const sprite = PIXI.Sprite.fromImage(image);
            sprite.width = imgSize;
            sprite.height = imgSize;
            sprite.x = padding;
            sprite.y = padding;
            // 用 Graphics mask 裁剪图片形状，跟随 borderRadius
            const imgMask = new PIXI.Graphics();
            imgMask.beginFill(0xffffff);
            const cr = this._cornerRadius();
            if (cr >= imgSize / 2 - 1) {
                imgMask.drawCircle(padding + imgSize / 2, padding + imgSize / 2, imgSize / 2);
            } else {
                imgMask.drawRoundedRect(padding, padding, imgSize, imgSize, Math.max(0, cr - padding));
            }
            imgMask.endFill();
            this.addChild(imgMask);
            sprite.mask = imgMask;
            this._content = sprite;
            this.addChild(this._content);
        } else if (text) {
            this._content = new PIXI.Text(text, { fontSize: size * 0.3, fill: textColor, fontWeight: 'bold' });
            this._content.anchor.set(0.5);
            this._content.x = size / 2;
            this._content.y = size / 2;
            this.addChild(this._content);
        }

        this.x = x + size / 2;
        this.y = y + size / 2;

        if (onTap) this._onTap = onTap;
        this.alpha = opacity;

        this._bindEvents();
    }

    _cornerRadius() {
        // borderRadius: 0 → 纯圆(r=size/2), 1 → 方形(r≈0), 中间线性插值
        return (this._size / 2) * (1 - this._borderRadius);
    }

    _drawShadow() {
        this._shadow.clear();
        const r = this._cornerRadius();
        const cx = this._size / 2;
        const cy = this._size / 2;
        const offsetX = 4;
        const offsetY = 6;
        const spread = 12; // 最大扩散半径

        for (let i = SHADOW_LAYERS; i >= 1; i--) {
            const t = i / SHADOW_LAYERS;
            const alpha = 0.06 * t;
            const extra = spread * (1 - t);
            this._shadow.beginFill(0x000000, alpha);
            if (r >= this._size / 2 - 1) {
                // 圆形
                this._shadow.drawCircle(cx + offsetX, cy + offsetY, this._size / 2 + extra);
            } else {
                this._shadow.drawRoundedRect(
                    offsetX - extra,
                    offsetY - extra,
                    this._size + extra * 2,
                    this._size + extra * 2,
                    r + extra,
                );
            }
            this._shadow.endFill();
        }
    }

    _drawBg(color) {
        this._bg.clear();
        const r = this._cornerRadius();
        const b = this._border;

        if (b > 0) {
            this._bg.beginFill(this._borderColor);
            if (r >= this._size / 2 - 1) {
                this._bg.drawCircle(this._size / 2, this._size / 2, this._size / 2);
            } else {
                this._bg.drawRoundedRect(0, 0, this._size, this._size, r);
            }
            this._bg.endFill();
        }

        this._bg.beginFill(color);
        const inner = this._size - b * 2;
        const innerR = Math.max(0, r - b);
        if (r >= this._size / 2 - 1) {
            this._bg.drawCircle(this._size / 2, this._size / 2, this._size / 2 - b);
        } else {
            this._bg.drawRoundedRect(b, b, inner, inner, innerR);
        }
        this._bg.endFill();
    }

    _bindEvents() {
        this.on('touchstart', (e) => {
            this._dragging = true;
            this._moved = false;
            const pos = e.data.global;
            this._dragOffsetX = pos.x - this.x;
            this._dragOffsetY = pos.y - this.y;
            this._startX = pos.x;
            this._startY = pos.y;
            this.scale.set(0.95);
            logger.debug(`[FloatBox] touchstart x=${pos.x} y=${pos.y}`);
        });

        this.on('touchmove', (e) => {
            if (!this._dragging) return;
            const pos = e.data.global;
            if (Math.abs(pos.x - this._startX) > 5 || Math.abs(pos.y - this._startY) > 5) {
                this._moved = true;
            }
            const r = this._size / 2;
            const stageW = stage.screenW || SIZE.W;
            const stageH = stage.screenH || SIZE.H;
            const nx = pos.x - this._dragOffsetX;
            const ny = pos.y - this._dragOffsetY;
            this.x = Math.max(r, Math.min(stageW - r, nx));
            this.y = Math.max(r, Math.min(stageH - r, ny));
        });

        const onEnd = (e) => {
            if (!this._dragging) return;
            this._dragging = false;
            this.scale.set(1);
            this._trySnap();
            if (!this._moved && this._onTap) {
                this._onTap(e);
            }
        };

        this.on('touchend', onEnd);
        this.on('touchendoutside', onEnd);
    }

    _trySnap() {
        const r = this._size / 2;
        const stageW = stage.screenW || SIZE.W;
        const leftDist = this.x - r;
        const rightDist = stageW - r - this.x;
        let targetX = this.x;
        if (leftDist < SNAP_THRESHOLD) {
            targetX = r;
        } else if (rightDist < SNAP_THRESHOLD) {
            targetX = stageW - r;
        }
        if (targetX !== this.x) {
            this._animateTo(targetX, this.y);
        }
    }

    _animateTo(targetX, targetY) {
        const duration = 12;
        let frame = 0;
        const startX = this.x;
        const startY = this.y;
        const tick = () => {
            frame++;
            const ease = 1 - Math.pow(1 - frame / duration, 3);
            this.x = startX + (targetX - startX) * ease;
            this.y = startY + (targetY - startY) * ease;
            if (frame < duration) PIXI.ticker.shared.addOnce(tick);
        };
        PIXI.ticker.shared.addOnce(tick);
    }

    setBgColor(color) {
        this._drawBg(color);
    }

    setText(text) {
        if (this._content instanceof PIXI.Text) this._content.text = text;
    }
}

export default FloatBox;
