import * as PIXI from '../../libs/pixi.min';
import { Button, Router, Page, ListItem, logger, COLOR, SIZE, FONT } from '../ui/index';

function addViewBg(view, w, h) {
    const bg = new PIXI.Graphics();
    bg.beginFill(COLOR.bg);
    bg.drawRect(0, 0, w, h);
    bg.endFill();
    view.addChildAt(bg, 0);
}

function buildHomeView(w, h, router) {
    const view = new PIXI.Container();
    addViewBg(view, w, h);
    let y = 140;

    const title = new PIXI.Text('Router Demo', { fontSize: SIZE.textSizeXxl, fill: COLOR.white, fontWeight: 'bold', fontFamily: FONT });
    title.x = SIZE.pad;
    title.y = y;
    view.addChild(title);
    y += 80;

    const desc = new PIXI.Text('栈式导航，支持 push / pop / replace / popToRoot', {
        fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT,
        wordWrap: true, wordWrapWidth: w - SIZE.pad * 2,
    });
    desc.x = SIZE.pad;
    desc.y = y;
    view.addChild(desc);
    y += 70;

    let secLabel = new PIXI.Text('基础导航', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
    secLabel.x = SIZE.pad;
    secLabel.y = y;
    view.addChild(secLabel);
    y += 50;

    const btnDetail = new Button({
        text: 'Push 详情页', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.primary,
        onTap: () => router.push('/detail', { title: '来自首页' }),
    });
    btnDetail.x = SIZE.pad;
    btnDetail.y = y;
    view.addChild(btnDetail);

    const btnList = new Button({
        text: 'Push 列表页', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.success,
        onTap: () => router.push('/list'),
    });
    btnList.x = SIZE.pad + SIZE.btnW + 40;
    btnList.y = y;
    view.addChild(btnList);
    y += SIZE.btnH + 40;

    secLabel = new PIXI.Text('参数传递', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
    secLabel.x = SIZE.pad;
    secLabel.y = y;
    view.addChild(secLabel);
    y += 50;

    const btnParam = new Button({
        text: 'Push 带参数', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.warning, textColor: COLOR.textDark,
        onTap: () => router.push('/detail', { title: '带参数的页面', info: 'extra data' }),
    });
    btnParam.x = SIZE.pad;
    btnParam.y = y;
    view.addChild(btnParam);
    y += SIZE.btnH + 40;

    secLabel = new PIXI.Text('路径参数', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
    secLabel.x = SIZE.pad;
    secLabel.y = y;
    view.addChild(secLabel);
    y += 50;

    const btnPathParam = new Button({
        text: 'Push /item/42', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.primary,
        onTap: () => router.push('/item/42'),
    });
    btnPathParam.x = SIZE.pad;
    btnPathParam.y = y;
    view.addChild(btnPathParam);

    const btnPathParam2 = new Button({
        text: 'Push /item/99', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.primaryDark,
        onTap: () => router.push('/item/99'),
    });
    btnPathParam2.x = SIZE.pad + SIZE.btnW + 40;
    btnPathParam2.y = y;
    view.addChild(btnPathParam2);

    return view;
}

function buildDetailView(w, h, router, params) {
    const view = new PIXI.Container();
    addViewBg(view, w, h);
    let y = 140;

    const backBtn = new Button({
        text: '← 返回', width: 200, height: 80, color: COLOR.surface,
        onTap: () => router.pop(),
    });
    backBtn.x = SIZE.pad;
    backBtn.y = y;
    view.addChild(backBtn);
    y += 120;

    const title = new PIXI.Text('详情页', { fontSize: SIZE.textSizeXxl, fill: COLOR.white, fontWeight: 'bold', fontFamily: FONT });
    title.x = SIZE.pad;
    title.y = y;
    view.addChild(title);
    y += 80;

    const paramTitle = params.title || '(无标题参数)';
    const paramText = new PIXI.Text(`title: ${paramTitle}`, {
        fontSize: SIZE.textSize, fill: COLOR.text, fontFamily: FONT,
    });
    paramText.x = SIZE.pad;
    paramText.y = y;
    view.addChild(paramText);
    y += 50;

    if (params.info) {
        const infoText = new PIXI.Text(`info: ${params.info}`, {
            fontSize: SIZE.textSize, fill: COLOR.textSec, fontFamily: FONT,
        });
        infoText.x = SIZE.pad;
        infoText.y = y;
        view.addChild(infoText);
        y += 50;
    }

    if (params.id) {
        const idText = new PIXI.Text(`id: ${params.id}`, {
            fontSize: SIZE.textSize, fill: COLOR.textSec, fontFamily: FONT,
        });
        idText.x = SIZE.pad;
        idText.y = y;
        view.addChild(idText);
        y += 50;
    }

    y += 40;
    const btnPush = new Button({
        text: '继续 Push', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.primary,
        onTap: () => router.push('/detail', { title: `第 ${router.stackDepth} 层` }),
    });
    btnPush.x = SIZE.pad;
    btnPush.y = y;
    view.addChild(btnPush);
    y += SIZE.btnH + 30;

    const btnRoot = new Button({
        text: 'Pop 到根', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.danger,
        onTap: () => router.popToRoot(),
    });
    btnRoot.x = SIZE.pad;
    btnRoot.y = y;
    view.addChild(btnRoot);

    view.onEnter = (p) => logger.info('[DetailView] onEnter', p);
    view.onLeave = () => logger.info('[DetailView] onLeave');

    return view;
}

function buildListView(w, h, router) {
    const view = new PIXI.Container();
    addViewBg(view, w, h);
    let y = 140;

    const backBtn = new Button({
        text: '← 返回', width: 200, height: 80, color: COLOR.surface,
        onTap: () => router.pop(),
    });
    backBtn.x = SIZE.pad;
    backBtn.y = y;
    view.addChild(backBtn);
    y += 120;

    const title = new PIXI.Text('列表页', { fontSize: SIZE.textSizeXxl, fill: COLOR.white, fontWeight: 'bold', fontFamily: FONT });
    title.x = SIZE.pad;
    title.y = y;
    view.addChild(title);
    y += 80;

    const items = ['苹果', '香蕉', '橙子', '葡萄', '西瓜'];
    const itemW = w - SIZE.pad * 2;
    items.forEach((name, i) => {
        const item = new ListItem({
            text: name,
            width: itemW,
            onTap: () => router.push('/detail', { title: name }),
        });
        item.x = SIZE.pad;
        item.y = y;
        view.addChild(item);
        y += item._itemH + 16;
    });

    return view;
}

export default class RouterPage extends Page {
    constructor(w, h) {
        super(w, h);
        this._build();
    }

    _build() {
        const w = this._w;
        const h = this._h;

        const router = new Router({
            width: w,
            height: h,
            // transition: 'fade',
            routes: [
                { path: '/', builder: (_, router) => buildHomeView(w, h, router) },
                { path: '/detail', builder: (params, router) => buildDetailView(w, h, router, params) },
                { path: '/list', builder: (_, router) => buildListView(w, h, router) },
                { path: '/item/:id', builder: (params, router) => buildDetailView(w, h, router, params) },
            ],
        });
        this.addChild(router);

        router.on('navigate', ({ path, action }) => {
            logger.info(`[Router] ${action} → ${path}, depth=${router.stackDepth}`);
        });
    }
}
