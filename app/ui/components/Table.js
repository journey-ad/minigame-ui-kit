import PIXI from '../common/pixi';
import { drawRoundedRect } from '../common/utils';
import { COLOR, SIZE, FONT } from '../common/styles';
import { ScrollBox } from './ScrollBox';

export class Table extends PIXI.Container {
    constructor({
        width,
        height,
        columns = [],
        data = [],
        rowHeight = 80,
        headerHeight = 72,
    } = {}) {
        super();

        this._w = width;
        this._h = height;
        this._columns = columns;
        this._data = data;
        this._rowH = rowHeight;
        this._headerH = headerHeight;

        this._colWidths = this._calcColWidths();

        this._bg = new PIXI.Graphics();
        drawRoundedRect(this._bg, 0, 0, width, height, 16, COLOR.card, COLOR.border);
        this.addChild(this._bg);

        this._drawHeader();

        const bodyH = height - headerHeight;
        this._bodyH = bodyH;

        const rows = this._data.map((row, i) => this._buildRow(row, i));
        this._scrollBox = new ScrollBox({
            width,
            height: bodyH,
            items: rows,
            gap: 0,
            padding: 0,
            background: COLOR.card,
            radius: 0,
        });
        this._scrollBox.y = headerHeight;
        this.addChild(this._scrollBox);

        // 列分割线（垂直）
        this._colDividers = new PIXI.Graphics();
        this.addChild(this._colDividers);
        this._drawColDividers();
    }

    _calcColWidths() {
        const specified = this._columns.filter(c => c.width != null);
        const unspecified = this._columns.filter(c => c.width == null);
        const specifiedSum = specified.reduce((s, c) => s + c.width, 0);
        const remaining = this._w - specifiedSum;
        const autoW = unspecified.length > 0
            ? Math.max(60, Math.floor(remaining / unspecified.length))
            : 0;

        const widths = [];
        for (const col of this._columns) {
            widths.push(col.width != null ? col.width : autoW);
        }
        return widths;
    }

    _drawHeader() {
        const headerBg = new PIXI.Graphics();
        headerBg.beginFill(COLOR.surfaceLight);
        headerBg.drawRoundedRect(0, 0, this._w, this._headerH, 16);
        // 只保留顶部圆角
        headerBg.beginFill(COLOR.surfaceLight);
        headerBg.drawRect(0, this._headerH - 16, this._w, 12);
        headerBg.endFill();
        this.addChild(headerBg);

        // 底部分割线
        const line = new PIXI.Graphics();
        line.beginFill(COLOR.border);
        line.drawRect(0, this._headerH - 1, this._w, 1);
        line.endFill();
        this.addChild(line);

        let x = 0;
        for (let i = 0; i < this._columns.length; i++) {
            const col = this._columns[i];
            const cw = this._colWidths[i];
            const title = new PIXI.Text(col.title || '', {
                fontSize: SIZE.textSizeSm,
                fill: COLOR.textSec,
                fontWeight: 'bold',
                fontFamily: FONT,
            });
            title.x = x + 24;
            title.y = (this._headerH - title.height) / 2;
            this.addChild(title);
            x += cw;
        }
    }

    _drawColDividers() {
        this._colDividers.clear();
        this._colDividers.beginFill(COLOR.border);
        let x = 0;
        for (let i = 0; i < this._columns.length - 1; i++) {
            x += this._colWidths[i];
            this._colDividers.drawRect(x - 1, 0, 1, this._h);
        }
        this._colDividers.endFill();
    }

    _buildRow(rowData, index) {
        const container = new PIXI.Container();
        container._itemH = this._rowH;

        const bg = new PIXI.Graphics();
        bg.beginFill(index % 2 === 0 ? COLOR.card : COLOR.surface);
        bg.drawRect(0, 0, this._w, this._rowH);
        bg.endFill();
        container.addChild(bg);

        // 行分割线
        const line = new PIXI.Graphics();
        line.beginFill(COLOR.border);
        line.drawRect(0, this._rowH - 1, this._w, 1);
        line.endFill();
        container.addChild(line);

        let x = 0;
        for (let i = 0; i < this._columns.length; i++) {
            const col = this._columns[i];
            const cw = this._colWidths[i];
            const val = rowData[col.key];
            const display = val != null ? String(val) : '';

            const cellText = new PIXI.Text(display, {
                fontSize: SIZE.textSize,
                fill: COLOR.text,
                fontFamily: FONT,
            });
            cellText.x = x + 24;
            cellText.y = (this._rowH - cellText.height) / 2;

            // 截断过长文本
            const maxTextW = cw - 48;
            if (cellText.width > maxTextW) {
                let truncated = display;
                while (truncated.length > 1) {
                    truncated = truncated.slice(0, -1);
                    cellText.text = truncated + '...';
                    if (cellText.width <= maxTextW) break;
                }
            }

            container.addChild(cellText);
            x += cw;
        }

        return container;
    }

    updateData(data) {
        this._data = data;

        if (this._scrollBox) {
            this._scrollBox.destroy();
        }

        const rows = this._data.map((row, i) => this._buildRow(row, i));
        this._scrollBox = new ScrollBox({
            width: this._w,
            height: this._bodyH,
            items: rows,
            gap: 0,
            padding: 0,
            background: COLOR.card,
            radius: 0,
        });
        this._scrollBox.y = this._headerH;
        this.addChild(this._scrollBox);
    }

    destroy(options) {
        if (this._scrollBox) {
            this._scrollBox.destroy();
        }
        super.destroy(options);
    }
}

export default Table;
