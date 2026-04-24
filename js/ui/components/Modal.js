import * as PIXI from '../common/pixi';
import { drawRoundedRect, isTap } from '../common/utils';
import { COLOR, SIZE, FONT } from '../common/styles';
import Button from './Button';

export class Modal extends PIXI.Container {
    constructor({
        title,
        message = '',
        width = 680,
        screenW = SIZE.W,
        screenH = SIZE.H,
        messageAlign = 'center',
        showConfirmButton = true,
        showCancelButton = false,
        confirmButtonText = '确认',
        cancelButtonText = '取消',
        overlay = true,
        closeOnClickOverlay = false,
        animation = 'fade',
        onConfirm,
        onCancel,
    } = {}) {
        super();
        this._onConfirm = onConfirm;
        this._onCancel = onCancel;
        this._animation = animation;

        this.interactive = true;
        this.hitArea = new PIXI.Rectangle(0, 0, screenW, screenH);

        // 遮罩层
        if (overlay) {
            const overlayBg = new PIXI.Graphics();
            overlayBg.beginFill(0x000000, 0.6);
            overlayBg.drawRect(0, 0, screenW, screenH);
            overlayBg.endFill();
            this.addChild(overlayBg);

            if (closeOnClickOverlay) {
                overlayBg.interactive = true;
                overlayBg.hitArea = new PIXI.Rectangle(0, 0, screenW, screenH);
                overlayBg.on('touchstart', (e) => { this._overlayStartY = e.data.global.y; });
                const onEnd = (e) => {
                    if (isTap(this._overlayStartY, e.data.global.y)) {
                        this._handleCancel();
                    }
                };
                overlayBg.on('touchend', onEnd);
                overlayBg.on('touchendoutside', onEnd);
            }
        }

        // 弹窗卡片
        const padX = 56;
        const padTop = 48;
        const padBottom = 40;
        const btnAreaH = SIZE.btnH + 20;
        const gap = 24;

        // 预计算内容高度
        let contentY = padTop;

        // 标题
        let titleText = null;
        if (title) {
            titleText = new PIXI.Text(title, {
                fontSize: SIZE.textSizeXl,
                fill: COLOR.white,
                fontWeight: 'bold',
                fontFamily: FONT,
                wordWrap: true,
                wordWrapWidth: width - padX * 2,
                align: 'center',
            });
            titleText.anchor.set(0.5, 0);
            contentY += titleText.height + gap;
        }

        // 消息正文
        let msgText = null;
        if (message) {
            msgText = new PIXI.Text(message, {
                fontSize: SIZE.textSize,
                fill: COLOR.text,
                fontFamily: FONT,
                wordWrap: true,
                wordWrapWidth: width - padX * 2,
                align: messageAlign,
                lineHeight: SIZE.textSize * 1.5,
            });
            msgText.anchor.set(0.5, 0);
            contentY += msgText.height + gap;
        }

        contentY += padBottom;
        const hasButtons = showConfirmButton || showCancelButton;
        const cardH = contentY + (hasButtons ? btnAreaH : 0);

        // 卡片背景
        const card = new PIXI.Graphics();
        drawRoundedRect(card, 0, 0, width, cardH, 24, COLOR.card, COLOR.border);
        card.x = (screenW - width) / 2;
        card.y = (screenH - cardH) / 2;
        card.interactive = true;
        card.hitArea = new PIXI.Rectangle(0, 0, width, cardH);
        this.addChild(card);
        this._card = card;
        this._cardCenterX = card.x + width / 2;
        this._cardCenterY = card.y + cardH / 2;

        // 放置标题
        let drawY = padTop;
        if (titleText) {
            titleText.x = width / 2;
            titleText.y = drawY;
            card.addChild(titleText);
            drawY += titleText.height + gap;
        }

        // 放置消息
        if (msgText) {
            msgText.x = width / 2;
            msgText.y = drawY;
            card.addChild(msgText);
            drawY += msgText.height + gap;
        }

        // 按钮区域
        if (hasButtons) {
            drawY += padBottom - gap;
            const btnY = drawY;

            if (showCancelButton && showConfirmButton) {
                const btnW = (width - padX * 2 - 24) / 2;
                const cancelBtn = new Button({
                    text: cancelButtonText,
                    width: btnW,
                    height: SIZE.btnH,
                    color: COLOR.surface,
                    textColor: COLOR.text,
                    onTap: () => this._handleCancel(),
                });
                cancelBtn.x = padX;
                cancelBtn.y = btnY;
                card.addChild(cancelBtn);

                const confirmBtn = new Button({
                    text: confirmButtonText,
                    width: btnW,
                    height: SIZE.btnH,
                    color: COLOR.primary,
                    onTap: () => this._handleConfirm(),
                });
                confirmBtn.x = padX + btnW + 24;
                confirmBtn.y = btnY;
                card.addChild(confirmBtn);
            } else if (showConfirmButton) {
                const btnW = width - padX * 2;
                const confirmBtn = new Button({
                    text: confirmButtonText,
                    width: btnW,
                    height: SIZE.btnH,
                    color: COLOR.primary,
                    onTap: () => this._handleConfirm(),
                });
                confirmBtn.x = padX;
                confirmBtn.y = btnY;
                card.addChild(confirmBtn);
            }
        }

        this._animateIn();
    }

    _animateIn() {
        const card = this._card;
        const anim = this._animation;
        const duration = 150;

        if (anim === 'pop') {
            card.pivot.set(this._cardCenterX - card.x, this._cardCenterY - card.y);
            card.x = this._cardCenterX;
            card.y = this._cardCenterY;
            card.scale.set(0.8);
        }
        this.alpha = 0;

        let elapsed = 0;
        const tweenFn = () => {
            elapsed += PIXI.ticker.shared.elapsedMS;
            const t = Math.min(elapsed / duration, 1);
            const ease = t * (2 - t);

            this.alpha = ease;
            if (anim === 'pop') {
                const s = 0.8 + 0.2 * ease;
                card.scale.set(s);
            }

            if (t >= 1) {
                PIXI.ticker.shared.remove(tweenFn);
            }
        };
        PIXI.ticker.shared.add(tweenFn);
    }

    _animateOut(callback) {
        const card = this._card;
        const anim = this._animation;
        const duration = 120;

        if (anim === 'pop' && card.pivot.x === 0) {
            card.pivot.set(this._cardCenterX - card.x, this._cardCenterY - card.y);
            card.x = this._cardCenterX;
            card.y = this._cardCenterY;
        }

        let elapsed = 0;
        const tweenFn = () => {
            elapsed += PIXI.ticker.shared.elapsedMS;
            const t = Math.min(elapsed / duration, 1);
            const ease = t * (2 - t);

            this.alpha = 1 - ease;
            if (anim === 'pop') {
                const s = 1 - 0.2 * ease;
                card.scale.set(s);
            }

            if (t >= 1) {
                PIXI.ticker.shared.remove(tweenFn);
                callback();
            }
        };
        PIXI.ticker.shared.add(tweenFn);
    }

    _handleConfirm() {
        if (this._onConfirm) this._onConfirm();
        this.close();
    }

    _handleCancel() {
        if (this._onCancel) this._onCancel();
        this.close();
    }

    close() {
        if (this._closing) return;
        this._closing = true;
        this._animateOut(() => {
            if (this.parent) {
                this.parent.removeChild(this);
            }
            this.destroy({ children: true });
        });
    }
}

export default Modal
