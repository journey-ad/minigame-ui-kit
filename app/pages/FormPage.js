import PIXI from '../ui/common/pixi';
import { CheckBox, Switch, Radio, Input, Select, Slider, Page, logger } from '../ui/index';
import { COLOR, SIZE, FONT } from '../ui/common/styles';

export default class FormPage extends Page {
    constructor(w, h) {
        super(w, h);
        this._build();
    }

    _build() {
        let y = 100;

        const title = new PIXI.Text('表单组件', { fontSize: SIZE.textSizeXxl, fill: COLOR.white, fontWeight: 'bold', fontFamily: FONT });
        title.x = SIZE.pad;
        title.y = y;
        this.addChild(title);
        y += 80;

        // === Input ===
        let secLabel = new PIXI.Text('输入框 Input', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const input1 = new Input({
            width: SIZE.inputW, height: SIZE.inputH,
            placeholder: '请输入用户名...',
            onChange: (v) => logger.info(`[Input] 用户名: ${v}`),
        });
        input1.x = SIZE.pad;
        input1.y = y;
        this.addChild(input1);
        y += SIZE.inputH + 24;

        const input2 = new Input({
            width: SIZE.inputW, height: SIZE.inputH,
            placeholder: '请输入密码...',
            type: 'password',
            maxLength: 20,
            onChange: (v) => logger.info(`[Input] 密码已更新, 长度: ${v.length}`),
        });
        input2.x = SIZE.pad;
        input2.y = y;
        this.addChild(input2);
        y += SIZE.inputH + 60;

        // === Select ===
        secLabel = new PIXI.Text('选择器 Select', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const selectBox = new Select({
            width: SIZE.inputW, height: SIZE.inputH,
            items: ['微信渠道', '抖音渠道', 'TikTok', 'Vivo', 'OPPO'],
            onChange: (v) => logger.info(`[Select] ${v}`),
        });
        selectBox.x = SIZE.pad;
        selectBox.y = y;
        this.addChild(selectBox);
        y += SIZE.inputH + 60;

        // === CheckBox ===
        secLabel = new PIXI.Text('复选框 CheckBox', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const checks = ['启用音效', '启用震动', '自动保存'];
        checks.forEach((name, i) => {
            const cb = new CheckBox({
                text: name,
                checked: i === 0,
                onChange: (v) => logger.info(`[CheckBox] ${name}: ${v}`),
            });
            cb.x = SIZE.pad;
            cb.y = y;
            this.addChild(cb);
            y += 80;
        });
        y += 20;

        // === Switch ===
        secLabel = new PIXI.Text('开关 Switch', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const switchLabels = ['消息推送', '夜间模式', '省电模式'];
        switchLabels.forEach((name) => {
            const label = new PIXI.Text(name, { fontSize: SIZE.textSize, fill: COLOR.text, fontFamily: FONT });
            label.x = SIZE.pad;
            label.y = y + 8;
            this.addChild(label);

            const sw = new Switch({
                checked: name === '消息推送',
                onChange: (v) => logger.info(`[Switch] ${name}: ${v}`),
            });
            sw.x = SIZE.pad + 300;
            sw.y = y;
            this.addChild(sw);
            y += 70;
        });
        y += 20;

        // === Radio ===
        secLabel = new PIXI.Text('单选 Radio', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const radio = new Radio({
            items: ['简单模式', '普通模式', '困难模式'],
            value: 1,
            onChange: (idx, text) => logger.info(`[Radio] ${text}`),
        });
        radio.x = SIZE.pad;
        radio.y = y;
        this.addChild(radio);
        y += 70 * 3 + 40;

        // === Slider ===
        secLabel = new PIXI.Text('滑块 Slider', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const volLabel = new PIXI.Text('音量', { fontSize: SIZE.textSizeSm, fill: COLOR.text, fontFamily: FONT });
        volLabel.x = SIZE.pad;
        volLabel.y = y;
        this.addChild(volLabel);
        const volVal = new PIXI.Text('50%', { fontSize: SIZE.textSizeSm, fill: COLOR.primary, fontFamily: FONT });
        volVal.x = SIZE.pad + SIZE.sliderW + 60;
        volVal.y = y;
        this.addChild(volVal);
        y += 40;

        const volSlider = new Slider({
            width: SIZE.sliderW, height: SIZE.sliderH, min: 0, max: 100, value: 50, color: COLOR.primary,
            onUpdate: (v) => { volVal.text = `${Math.round(v)}%`; },
        });
        volSlider.x = SIZE.pad;
        volSlider.y = y + SIZE.sliderH / 2;
        this.addChild(volSlider);
        y += SIZE.sliderH + 50;

        const briLabel = new PIXI.Text('亮度', { fontSize: SIZE.textSizeSm, fill: COLOR.text, fontFamily: FONT });
        briLabel.x = SIZE.pad;
        briLabel.y = y;
        this.addChild(briLabel);
        const briVal = new PIXI.Text('70%', { fontSize: SIZE.textSizeSm, fill: COLOR.warning, fontFamily: FONT });
        briVal.x = SIZE.pad + SIZE.sliderW + 60;
        briVal.y = y;
        this.addChild(briVal);
        y += 40;

        const briSlider = new Slider({
            width: SIZE.sliderW, height: SIZE.sliderH, min: 0, max: 100, value: 70, color: COLOR.warning,
            onUpdate: (v) => { briVal.text = `${Math.round(v)}%`; },
        });
        briSlider.x = SIZE.pad;
        briSlider.y = y + SIZE.sliderH / 2;
        this.addChild(briSlider);
    }
}
