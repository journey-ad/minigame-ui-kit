import PIXI from '../common/pixi';
import { drawRoundedRect, isTap } from '../common/utils';
import { COLOR, SIZE, FONT } from '../common/styles';
import tapOutside from '../common/tapOutside';
import logger from '../common/logger';

const NoopAdapter = {
    open(currentValue, options = {}) {
        if (options.onClose) {
            options.onClose();
        }
        return Promise.resolve(currentValue);
    },
    close() { },
};

let _defaultAdapter = NoopAdapter;
let _activeInput = null;

/**
 * 适配器接口：
 *   open(currentValue, options) - 拉起键盘
 *   options 包含 { type, maxLength, onInput(v), onClose() }
 * 
 *   close() - 可选，关闭键盘
 *
 * 事件：
 *   'input' - 每次输入时触发，参数为当前值
 *   'change' - 输入结束且值有变化时触发，参数为最终值
 */
export class Input extends PIXI.Container {

    static setDefaultAdapter(adapter) {
        _defaultAdapter = adapter || NoopAdapter;
    }

    constructor({
        width, height, placeholder = '', type = 'text',
        maxLength = 0, onChange, onInput, disabled = false,
    } = {}) {
        super();

        this._w = width;
        this._h = height;
        this._placeholder = placeholder;
        this._value = '';
        this._type = type;
        this._maxLength = maxLength;
        this._focused = false;
        this._startY = 0;
        this._disabled = disabled;
        this._oldValue = '';
        // 左右各留 20px 间距
        this._textMaxW = width - 40;
        this._blinkTimer = null;

        this.interactive = !disabled;
        this.hitArea = new PIXI.Rectangle(0, 0, width, height);

        this._bg = new PIXI.Graphics();
        this._drawBg(COLOR.border);
        this.addChild(this._bg);

        this._text = new PIXI.Text(placeholder, {
            fontSize: SIZE.textSize,
            fill: COLOR.textSec,
            fontFamily: FONT,
        });
        this._text.x = 20;
        this._text.y = (height - this._text.height) / 2;
        this.addChild(this._text);

        this._cursor = new PIXI.Graphics();
        this._cursor.beginFill(COLOR.text);
        this._cursor.drawRect(0, 0, 3, SIZE.textSize + 4);
        this._cursor.endFill();
        this._cursor.y = (height - SIZE.textSize - 4) / 2;
        this._cursor.visible = false;
        this.addChild(this._cursor);

        if (disabled) {
            this.alpha = 0.5;
        }
        if (onChange) {
            this.on('change', onChange);
        }
        if (onInput) {
            this.on('input', onInput);
        }

        this.on('touchstart', (e) => {
            this._startY = e.data.global.y;
        });
        const onEnd = (e) => {
            if (isTap(this._startY, e.data.global.y)) {
                this._openInput();
            }
        };
        this.on('touchend', onEnd);
        this.on('touchendoutside', onEnd);
    }

    _drawBg(borderColor) {
        this._bg.clear();
        drawRoundedRect(this._bg, 0, 0, this._w, this._h, SIZE.inputR, COLOR.surface, borderColor);
    }

    _updateCursorPos() {
        // 空值时光标在 placeholder 之前，有值时跟在文字末尾
        if (this._value.length > 0) {
            this._cursor.x = this._text.x + Math.min(this._text.width, this._textMaxW) + 2;
        } else {
            this._cursor.x = this._text.x;
        }
    }

    _setCursor(visible) {
        this._cursor.visible = visible;

        if (this._blinkTimer) {
            clearInterval(this._blinkTimer);
            this._blinkTimer = null;
        }

        if (visible) {
            this._updateCursorPos();
            this._blinkTimer = setInterval(() => {
                this._cursor.visible = !this._cursor.visible;
            }, 530);
        }
    }

    async _openInput() {
        if (this._disabled || this._focused) {
            return;
        }

        const activeAdapter = _defaultAdapter || NoopAdapter;

        if (_activeInput && _activeInput !== this) {
            _activeInput._deactivate();
            if (typeof activeAdapter.close === 'function') {
                // 切换 Input 时，先关闭上一个的键盘，等平台完成关闭再拉起新键盘
                activeAdapter.close();
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }

        _activeInput = this;
        this._focused = true;
        this._oldValue = this._value;
        this._drawBg(COLOR.primary);
        this._setCursor(true);
        tapOutside.on(this, [this], () => {
            if (typeof _defaultAdapter.close === 'function') {
                _defaultAdapter.close();
            }
            if (_activeInput) {
                _activeInput._deactivate();
            }
        });

        try {
            await activeAdapter.open(this._value, {
                type: this._type,
                maxLength: this._maxLength,
                onInput: (v) => {
                    // 回调始终路由到 _activeInput，防止切换后旧回调写入错误实例
                    const target = _activeInput;
                    if (!target) {
                        return;
                    }
                    const val = target._clamp(v);
                    target._value = val;
                    target._renderText();
                    target.emit('input', val);
                },
                onClose: () => {
                    if (_activeInput) {
                        _activeInput._deactivate();
                    }
                },
            });
        } catch (e) {
            logger.error('[Input] adapter error:', e);
        }
    }

    _deactivate() {
        if (!this._focused) {
            return;
        }
        this._focused = false;
        this._drawBg(COLOR.border);
        this._setCursor(false);

        if (this._value !== this._oldValue) {
            this.emit('change', this._value);
        }
        if (_activeInput === this) {
            _activeInput = null;
            tapOutside.off(this);
        }
    }

    // 过滤+截断：密码框只允许 ASCII 可打印字符（\x21-\x7e）
    _clamp(v) {
        if (this._type === 'password') {
            v = v.replace(/[^\x21-\x7e]/g, '');
        }
        if (this._maxLength > 0 && v.length > this._maxLength) {
            return v.slice(0, this._maxLength);
        }
        return v;
    }

    // 渲染显示文本，超出宽度截断并加省略号
    _renderText() {
        const hasValue = this._value.length > 0;
        let display;
        if (hasValue) {
            display = this._type === 'password'
                ? '●'.repeat(this._value.length)
                : this._value;
        } else {
            display = this._placeholder;
        }

        this._text.style.fill = hasValue ? COLOR.text : COLOR.textSec;
        this._text.text = display;

        if (this._text.width > this._textMaxW) {
            let truncated = display;
            while (truncated.length > 1) {
                truncated = truncated.slice(0, -1);
                this._text.text = `${truncated}...`;
                if (this._text.width <= this._textMaxW) {
                    break;
                }
            }
        }

        if (this._focused) {
            this._updateCursorPos();
        }
    }

    getValue() {
        return this._value;
    }

    setValue(v) {
        this._value = this._clamp(String(v));
        this._renderText();
    }

    setDisabled(disabled) {
        this._disabled = disabled;
        this.interactive = !disabled;
        this.alpha = disabled ? 0.5 : 1;
    }

    destroy(options) {
        if (this._blinkTimer) {
            clearInterval(this._blinkTimer);
        }
        if (_activeInput === this) {
            _activeInput = null;
        }
        super.destroy(options);
    }
}

export default Input
