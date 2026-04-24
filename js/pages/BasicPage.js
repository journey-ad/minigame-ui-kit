import * as PIXI from '../../libs/pixi.min';
import { Button, Icon, ICON_NAMES, Collapse, Page, logger, COLOR, SIZE, FONT } from '../ui/index';

export default class BasicPage extends Page {
    constructor(w, h) {
        super(w, h);
        this._build();
    }

    _build() {
        const w = this._w;
        let y = 20;

        const title = new PIXI.Text('基础组件', { fontSize: SIZE.textSizeXxl, fill: COLOR.white, fontWeight: 'bold', fontFamily: FONT });
        title.x = SIZE.pad;
        title.y = y;
        this.addChild(title);
        y += 80;

        // === Button ===
        let secLabel = new PIXI.Text('按钮 Button', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const btnPrimary = new Button({
            text: '主要按钮', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.primary,
            onTap: () => logger.info('[Button] 主要按钮'),
        });
        btnPrimary.x = SIZE.pad;
        btnPrimary.y = y;
        this.addChild(btnPrimary);

        const btnSuccess = new Button({
            text: '成功按钮', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.success,
            onTap: () => logger.info('[Button] 成功按钮'),
        });
        btnSuccess.x = SIZE.pad + SIZE.btnW + 40;
        btnSuccess.y = y;
        this.addChild(btnSuccess);
        y += SIZE.btnH + 30;

        const btnWarn = new Button({
            text: '警告按钮', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.warning, textColor: COLOR.textDark,
            onTap: () => logger.info('[Button] 警告按钮'),
        });
        btnWarn.x = SIZE.pad;
        btnWarn.y = y;
        this.addChild(btnWarn);

        const btnDanger = new Button({
            text: '危险按钮', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.danger,
            onTap: () => logger.info('[Button] 危险按钮'),
        });
        btnDanger.x = SIZE.pad + SIZE.btnW + 40;
        btnDanger.y = y;
        this.addChild(btnDanger);
        y += SIZE.btnH + 30;

        const btnDisabled = new Button({
            text: '禁用按钮', width: SIZE.btnW, height: SIZE.btnH, color: 0x555555,
            textColor: COLOR.textSec, disabled: true,
        });
        btnDisabled.x = SIZE.pad;
        btnDisabled.y = y;
        this.addChild(btnDisabled);
        y += SIZE.btnH + 60;

        // === Icon (自定义) ===
        secLabel = new PIXI.Text('自定义图标', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const customIcon = new Icon({ path: 'images/logo.png', size: 64 });
        customIcon.x = SIZE.pad;
        customIcon.y = y;
        this.addChild(customIcon);

        const customLabel = new PIXI.Text('自定义图标 (path: images/logo.png)', {
            fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT,
        });
        customLabel.x = SIZE.pad + 80;
        customLabel.y = y + 16;
        this.addChild(customLabel);
        y += 90;

        // === Icon (图标库 - 折叠面板) ===
        const contentW = w - SIZE.pad * 2;
        const cols = 5;
        const cellW = Math.floor((contentW - 24 * 2) / cols);
        const iconSize = 64;
        const cellH = 145;

        const unique = [...new Set(ICON_NAMES)];

        const gridContent = new PIXI.Container();
        for (let i = 0; i < unique.length; i += cols) {
            const rowNames = unique.slice(i, i + cols);
            const rowIdx = Math.floor(i / cols);
            const row = this._buildRow(rowNames, cellW, cellH, iconSize);
            row.y = rowIdx * (cellH + 8);
            gridContent.addChild(row);
        }

        const collapse = new Collapse({
            title: `图标库 Icon（${unique.length}）`,
            width: contentW,
            content: gridContent,
            height: 800,
            expanded: true,
        });
        collapse.x = SIZE.pad;
        collapse.y = y;
        this.addChild(collapse);
    }

    _buildRow(names, cellW, cellH, iconSize) {
        const row = new PIXI.Container();
        row._itemH = cellH;

        names.forEach((name, i) => {
            const icon = new Icon({ name, size: iconSize, color: COLOR.white });
            icon.x = i * cellW + (cellW - iconSize) / 2;
            icon.y = 8;
            row.addChild(icon);

            const label = new PIXI.Text(name, {
                fontSize: 28, fill: COLOR.textSec, fontFamily: FONT,
                wordWrap: true, wordWrapWidth: cellW - 8,
                align: 'center',
            });
            label.anchor.set(0.5, 0);
            label.x = i * cellW + cellW / 2;
            label.y = iconSize + 14;
            row.addChild(label);
        });

        return row;
    }
}
