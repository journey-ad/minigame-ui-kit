import * as PIXI from '../common/pixi';
import { isTap } from '../common/utils';
import { COLOR, SIZE, FONT } from '../common/styles';
import Icon from './Icon';
import { ALL_ICONS } from '../icons/index';
import logger from '../common/logger';

export class TabBar extends PIXI.Container {
    constructor({ screenWidth, tabs, onSwitch } = {}) {
        super();
        this._screenWidth = screenWidth;
        this._tabs = [];
        this._active = 0;

        const tabW = screenWidth / tabs.length;

        const bgG = new PIXI.Graphics();
        bgG.beginFill(COLOR.surface);
        bgG.drawRect(0, 0, screenWidth, SIZE.tabH);
        bgG.endFill();
        bgG.beginFill(COLOR.border);
        bgG.drawRect(0, 0, screenWidth, 2);
        bgG.endFill();
        this.addChild(bgG);

        if (onSwitch) {
            this.on('switch', onSwitch);
        }

        tabs.forEach((tabData, idx) => {
            const tab = new PIXI.Container();
            tab.interactive = true;
            tab.hitArea = new PIXI.Rectangle(0, 0, tabW, SIZE.tabH);
            tab.x = tabW * idx;
            tab._startY = 0;

            const tbg = new PIXI.Graphics();
            tab.addChild(tbg);

            const iconSize = Math.round(SIZE.tabH * 0.32);
            const iconY = Math.round(SIZE.tabH * 0.16);
            const labelY = Math.round(SIZE.tabH * 0.67);

            let iconDisplay;
            if (ALL_ICONS.includes(tabData.icon)) {
                iconDisplay = new Icon({ name: tabData.icon, size: iconSize, color: idx === 0 ? COLOR.white : COLOR.textSec });
                iconDisplay.x = tabW / 2 - iconSize / 2;
                iconDisplay.y = iconY;
            } else {
                iconDisplay = new PIXI.Text(tabData.icon, { fontSize: iconSize, fontFamily: FONT });
                iconDisplay.anchor.set(0.5);
                iconDisplay.x = tabW / 2;
                iconDisplay.y = iconY + iconSize / 2;
            }
            tab.addChild(iconDisplay);

            const label = new PIXI.Text(tabData.label, {
                fontSize: SIZE.textSizeSm, fill: idx === 0 ? COLOR.white : COLOR.textSec, fontFamily: FONT,
            });
            label.anchor.set(0.5);
            label.x = tabW / 2;
            label.y = labelY;
            tab.addChild(label);

            this._tabs.push({ container: tab, bg: tbg, label, icon: iconDisplay });
            this.addChild(tab);

            tab.on('touchstart', (e) => {
                tab._startY = e.data.global.y;
            });

            const onTabEnd = (e) => {
                if (isTap(tab._startY, e.data.global.y)) {
                    this.setActive(idx);
                }
            };
            tab.on('touchend', onTabEnd);
            tab.on('touchendoutside', onTabEnd);
        });

        this._drawTabs();
    }

    setActive(index) {
        if (this._active === index) return;
        logger.debug(`[TabBar] switch ${this._active} → ${index}`);
        this._active = index;
        this._drawTabs();
        this.emit('switch', index);
    }

    _drawTabs() {
        const tabW = this._screenWidth / this._tabs.length;
        this._tabs.forEach((t, j) => {
            t.bg.clear();
            t.bg.beginFill(j === this._active ? COLOR.tabActive : COLOR.tabInactive);
            t.bg.drawRect(0, 0, tabW, SIZE.tabH);
            t.bg.endFill();
            t.label.style.fill = j === this._active ? COLOR.white : COLOR.textSec;
            if (t.icon instanceof Icon) {
                t.icon.setColor(j === this._active ? COLOR.white : COLOR.textSec);
            }
        });
    }
}

export default TabBar
