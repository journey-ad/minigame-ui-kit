globalThis.__PLATFORM__ = {
  init() {
    const canvas = GameGlobal.canvas;
    const { windowWidth, windowHeight, pixelRatio } = wx.getSystemInfoSync();
    const screenW = windowWidth * pixelRatio;
    const screenH = windowHeight * pixelRatio;

    return { canvas, screenW, screenH };
  },

  /**
   * 小游戏环境触摸坐标映射
   */
  patchCoordinateMapping(canvas, screenW) {
    const pixelRatio = (canvas.width / (window.innerWidth || screenW)) || 1;
    globalThis.PIXI.interaction.InteractionManager.prototype.mapPositionToPoint = function (point, x, y) {
      point.x = x * pixelRatio;
      point.y = y * pixelRatio;
    };
  },

  /**
   * 小游戏键盘适配器，供 Input 组件使用
   */
  keyboardAdapter: {
    open(currentValue, options) {
      return new Promise(resolve => {
        let _value = '';
        wx.showKeyboard({
          defaultValue: currentValue,
          maxLength: options.maxLength || 140,
          confirmHold: false,
          confirmType: 'done',
          success: (res) => resolve(res.value),
          fail: () => resolve(currentValue),
        });

        const done = () => {
          wx.offKeyboardComplete(done);
          wx.offKeyboardInput(onInput);
          resolve(_value);
          if (options.onClose) options.onClose();
        };
        const onInput = (res) => {
          _value = res.value;
          if (options.onInput) options.onInput(_value);
        };
        wx.onKeyboardInput(onInput);
        wx.onKeyboardComplete(done);
      });
    },
    close() {
      wx.hideKeyboard();
    }
  }
};
