import PIXI from '../common/pixi';
import { isTap } from '../common/utils';
import { COLOR, SIZE, FONT } from '../common/styles';

export class ListItem extends PIXI.Container {
    constructor({ width, height = 56, text, showDivider = false, onTap } = {}) {
        super();
        this._itemH = height;
        this._itemW = width;
        this.interactive = true;
        this.hitArea = new PIXI.Rectangle(0, 0, width, height);

        // 圆点
        const dot = new PIXI.Graphics();
        dot.beginFill(COLOR.primary);
        dot.drawCircle(8, height / 2, 8);
        dot.endFill();
        this.addChild(dot);

        // 文字
        const label = new PIXI.Text(text, { fontSize: SIZE.textSize, fill: COLOR.text, fontFamily: FONT });
        label.x = 30;
        label.y = (height - label.height) / 2;
        this.addChild(label);

        // 箭头
        const arrow = new PIXI.Text('>', { fontSize: SIZE.textSize, fill: COLOR.textSec, fontFamily: FONT });
        arrow.x = width - 20;
        arrow.y = (height - arrow.height) / 2;
        this.addChild(arrow);

        // 分割线
        if (showDivider) {
            const line = new PIXI.Graphics();
            line.beginFill(COLOR.border);
            line.drawRect(0, -8, width, 1);
            line.endFill();
            this.addChild(line);
        }

        // 点击
        if (onTap) {
            let startY = 0;
            this.on('touchstart', (e) => { startY = e.data.global.y; });
            const onEnd = (e) => {
                if (isTap(startY, e.data.global.y)) onTap(text);
            };
            this.on('touchend', onEnd);
            this.on('touchendoutside', onEnd);
        }
    }
}

export default ListItem
