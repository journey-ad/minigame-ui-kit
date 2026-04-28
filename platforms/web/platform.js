import PIXI from '@/js/ui/common/pixi';

export function initPlatform() {
  const dpr = window.devicePixelRatio || 1;
  const screenW = window.innerWidth * dpr;
  const screenH = window.innerHeight * dpr;

  const canvas = document.createElement('canvas');
  canvas.width = screenW;
  canvas.height = screenH;
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    display: 'block',
  });
  document.body.appendChild(canvas);

  return { canvas, screenW, screenH };
}

export function patchCoordinateMapping(canvas) {
  PIXI.interaction.InteractionManager.prototype.mapPositionToPoint = function (point, x, y) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    point.x = (x - rect.left) * scaleX;
    point.y = (y - rect.top) * scaleY;
  };
}

// 隐藏 input 悬浮在 canvas 上，视觉上直接在界面里输入
let _hiddenInput = null;

function getOrCreateHiddenInput() {
  if (_hiddenInput) return _hiddenInput;

  const input = document.createElement('input');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('autocorrect', 'off');
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('spellcheck', 'false');
  Object.assign(input.style, {
    position: 'fixed',
    opacity: '0',
    pointerEvents: 'none',
    width: '1px',
    height: '1px',
    top: '0',
    left: '0',
    border: 'none',
    outline: 'none',
    padding: '0',
    fontSize: '16px', // 防止 iOS Safari 自动缩放
  });
  document.body.appendChild(input);
  _hiddenInput = input;
  return input;
}

export const keyboardAdapter = {
  open(currentValue, options = {}) {
    return new Promise(resolve => {
      const input = getOrCreateHiddenInput();
      input.type = options.type === 'password' ? 'password' : 'text';
      input.value = currentValue || '';
      if (options.maxLength) input.maxLength = options.maxLength;

      const onInput = () => {
        if (options.onInput) options.onInput(input.value);
      };

      const onKeyDown = (e) => {
        if (e.key === 'Enter') {
          finish();
        }
      };

      const onBlur = () => {
        finish();
      };

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        input.removeEventListener('input', onInput);
        input.removeEventListener('keydown', onKeyDown);
        input.removeEventListener('blur', onBlur);
        const val = input.value;
        resolve(val);
        if (options.onClose) options.onClose();
      };

      input.addEventListener('input', onInput);
      input.addEventListener('keydown', onKeyDown);
      input.addEventListener('blur', onBlur);

      input.focus();
    });
  },

  close() {
    if (_hiddenInput) _hiddenInput.blur();
  },
};
