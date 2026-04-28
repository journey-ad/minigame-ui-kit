import PIXI from '../common/pixi';
import { COLOR } from '../common/styles';
import logger from '../common/logger';

export class Swiper extends PIXI.Container {
    constructor({ width, height, items, gap = 24, autoplay = true, interval = 3000, loop = true } = {}) {
        super();
        this._w = width;
        this._h = height;
        this._gap = gap;
        this._step = width + gap;
        this._autoplay = autoplay;
        this._interval = interval;
        this._loop = loop;

        // items: { length, buildItem } 或 Container[]
        let count, buildItem;
        if (typeof items.buildItem === 'function') {
            count = items.length;
            buildItem = items.buildItem;
        } else {
            count = items.length;
            buildItem = (i) => items[i];
        }
        this._count = count;
        this._buildItem = buildItem;
        // _index 是内部下标（包含 clone），_current 是外部真实页码
        this._index = loop ? 1 : 0;
        this._current = 0;
        this._scrolling = false;

        this.interactive = true;
        this.hitArea = new PIXI.Rectangle(0, 0, width, height);

        // 遮罩
        const mask = new PIXI.Graphics();
        mask.beginFill(0xFFFFFF);
        mask.drawRoundedRect(0, 0, width, height, 16);
        mask.endFill();
        this.addChild(mask);

        // 内容容器
        this._content = new PIXI.Container();
        this._content.mask = mask;
        this.addChild(this._content);

        // 构建包含 clone 的布局
        this._buildSlides();

        // 初始位置
        this._content.x = -this._index * this._step;

        // 指示器
        this._dots = new PIXI.Container();
        this._buildDots();
        this.addChild(this._dots);

        this._bindEvents();

        if (autoplay && count > 1) {
            this._startAutoplay();
        }
    }

    _buildSlides() {
        const { _count: count, _loop: loop, _buildItem: build } = this;

        // loop 模式: [clone_last] [item_0] ... [item_n-1] [clone_first]
        // 非 loop 模式: [item_0] ... [item_n-1]
        const slides = [];

        if (loop && count > 1) {
            slides.push(build(count - 1));
        }

        for (let i = 0; i < count; i++) {
            slides.push(build(i));
        }

        if (loop && count > 1) {
            slides.push(build(0));
        }

        const step = this._step;
        slides.forEach((slide, i) => {
            slide.x = i * step;
            this._content.addChild(slide);
        });

        this._slides = slides;
    }

    _buildDots() {
        const dotR = 8;
        const dotGap = 24;
        const count = this._count;
        const totalW = count * dotR * 2 + (count - 1) * (dotGap - dotR * 2);

        this._dotGraphics = [];
        for (let i = 0; i < count; i++) {
            const dot = new PIXI.Graphics();
            dot.x = (this._w - totalW) / 2 + i * dotGap;
            dot.y = this._h - 40;
            this._dots.addChild(dot);
            this._dotGraphics.push(dot);
        }
        this._drawDots();
    }

    _drawDots() {
        const dotR = 8;
        this._dotGraphics.forEach((dot, i) => {
            dot.clear();
            const active = i === this._current;
            dot.beginFill(active ? COLOR.white : COLOR.textSec, active ? 1 : 0.5);
            dot.drawCircle(dotR, dotR, dotR);
            dot.endFill();
        });
    }

    // 内部 index 转真实页码
    _indexToCurrent(index) {
        if (!this._loop) return index;
        if (index <= 0) return this._count - 1;
        if (index >= this._count + 1) return 0;
        return index - 1;
    }

    _bindEvents() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let dragging = false;
        let dirLocked = false;
        const dirThreshold = 8;

        this.on('touchstart', (e) => {
            startX = e.data.global.x;
            startY = e.data.global.y;
            startTime = Date.now();
            dragging = true;
            dirLocked = false;
            this._stopAutoplay();
            this._stopAnimation();
            // 如果停在 clone 区域，立即跳转到真实位置再开始拖拽
            this._checkBoundaryJump();
            this._dragBaseX = this._content.x;
        });

        this.on('touchmove', (e) => {
            if (!dragging) return;

            // 锁定拖动方向为横向，避免影响父级的滚动
            if (!dirLocked) {
                const dx = Math.abs(e.data.global.x - startX);
                const dy = Math.abs(e.data.global.y - startY);
                if (Math.max(dx, dy) < dirThreshold) return;
                if (dy > dx) {
                    dragging = false;
                    if (this._autoplay) this._startAutoplay();
                    return;
                }
                dirLocked = true;
            }
            e.stopPropagation();

            const dx = e.data.global.x - startX;
            this._content.x = this._dragBaseX + dx;
        });

        const onEnd = (e) => {
            if (!dragging) return;
            dragging = false;
            dirLocked = false;

            const dx = e.data.global.x - startX;
            const dt = Date.now() - startTime;
            const velocity = Math.abs(dx / dt);

            const currentX = this._content.x;
            let target = Math.round(-currentX / this._step);

            if (velocity > 0.5 && Math.abs(dx) > 10) {
                if (dx < 0) {
                    target = Math.ceil(-currentX / this._step);
                } else {
                    target = Math.floor(-currentX / this._step);
                }
            }

            // 限制在 slides 范围内
            target = Math.max(0, Math.min(target, this._slides.length - 1));

            this._index = target;
            this._current = this._indexToCurrent(target);
            this._drawDots();
            this._animateTo(target, () => {
                this._checkBoundaryJump();
                if (this._autoplay) {
                    this._startAutoplay();
                }
            });
        };
        this.on('touchend', onEnd);
        this.on('touchendoutside', onEnd);
    }

    _animateTo(index, onComplete) {
        this._stopAnimation();
        const targetX = -index * this._step;
        this._scrolling = true;

        const animate = () => {
            const diff = targetX - this._content.x;
            if (Math.abs(diff) < 1) {
                this._content.x = targetX;
                this._scrolling = false;
                this._animFrameId = null;
                if (onComplete) onComplete();
                return;
            }
            this._content.x += diff * 0.2;
            this._animFrameId = requestAnimationFrame(animate);
        };
        animate();
    }

    // 动画结束后，如果停在 clone 位置，静默跳转到真实位置
    _checkBoundaryJump() {
        if (!this._loop) return;
        const count = this._count;

        if (this._index <= 0) {
            this._index = count;
            this._content.x = -this._index * this._step;
        } else if (this._index >= count + 1) {
            this._index = 1;
            this._content.x = -this._index * this._step;
        }
    }

    _stopAnimation() {
        if (this._animFrameId) {
            cancelAnimationFrame(this._animFrameId);
            this._animFrameId = null;
            this._scrolling = false;
        }
    }

    _startAutoplay() {
        this._stopAutoplay();
        this._autoTimer = setInterval(() => {
            this._autoNext();
        }, this._interval);
    }

    _autoNext() {
        if (this._scrolling) return;
        this._index++;
        this._current = this._indexToCurrent(this._index);
        this._drawDots();
        this._animateTo(this._index, () => {
            this._checkBoundaryJump();
        });
    }

    _stopAutoplay() {
        if (this._autoTimer) {
            clearTimeout(this._autoTimer);
            clearInterval(this._autoTimer);
            this._autoTimer = null;
        }
    }

    goTo(index) {
        if (index < 0 || index >= this._count) return;
        logger.debug(`[Swiper] goTo ${index}`);
        this._current = index;
        this._index = this._loop ? index + 1 : index;
        this._drawDots();
        this._animateTo(this._index);
    }
}

export default Swiper
