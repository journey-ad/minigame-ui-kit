import * as PIXI from '../../libs/pixi.min';
import { Page, COLOR, SIZE, FONT } from '../ui/index';

export default class AboutPage extends Page {
    constructor(w, h) {
        super(w, h);
        this._build();
    }

    _build() {
        const w = this._w;
        let y = 20;

        const title = new PIXI.Text('使用说明', { fontSize: SIZE.textSizeXxl, fill: COLOR.white, fontWeight: 'bold', fontFamily: FONT });
        title.x = SIZE.pad;
        title.y = y;
        this.addChild(title);
        y += 80;

        const contentW = w - SIZE.pad * 2;
        const sections = AboutPage._buildSections(contentW - 60);
        for (const section of sections) {
            section.x = SIZE.pad;
            section.y = y;
            this.addChild(section);
            y += (section._itemH || section.height) + 20;
        }
    }

    static _buildSections(cw) {
        const items = [];

        items.push(AboutPage._secTitle('项目简介'));
        items.push(AboutPage._para(cw,
            '本 Demo 展示了 PixiJS v4 在 Vivo 小游戏环境下的 UI 组件用法。' +
            '所有组件均使用 PIXI.Graphics 绘制，无需加载外部图片资源。'
        ));

        items.push(AboutPage._secTitle('基础组件'));

        items.push(AboutPage._subTitle('Button 按钮'));
        items.push(AboutPage._para(cw,
            '支持多种颜色主题，点击时缩放动画反馈。通过 onTap 回调监听点击。'
        ));
        items.push(AboutPage._code(cw,
            "new Button({\n  text: '按钮', width: 400, height: 90,\n  color: 0x4A90D9,\n  onTap: () => { ... }\n});"
        ));

        items.push(AboutPage._subTitle('Input 输入框'));
        items.push(AboutPage._para(cw,
            '文本输入组件，通过平台适配器拉起键盘。支持 placeholder、' +
            'maxLength、disabled 等属性。'
        ));
        items.push(AboutPage._code(cw,
            "new Input({\n  width: 600, placeholder: '请输入',\n  onChange: (v) => { ... }\n});"
        ));

        items.push(AboutPage._secTitle('选择组件'));

        items.push(AboutPage._subTitle('CheckBox 复选框'));
        items.push(AboutPage._para(cw,
            '点击切换选中/未选中状态，通过 onChange 回调获取状态变化。'
        ));
        items.push(AboutPage._code(cw,
            "new CheckBox({\n  text: '选项', checked: false,\n  onChange: (v) => { ... }\n});"
        ));

        items.push(AboutPage._subTitle('Radio 单选按钮'));
        items.push(AboutPage._para(cw,
            '单选按钮组，渲染多行选项并高亮当前选中项。'
        ));
        items.push(AboutPage._code(cw,
            "new Radio({\n  items: ['选项A', '选项B', '选项C'],\n  value: 0,\n  onChange: (i) => { ... }\n});"
        ));

        items.push(AboutPage._subTitle('Switch 开关'));
        items.push(AboutPage._para(cw,
            '开关切换组件，带滑动动画。支持 disabled 状态。'
        ));
        items.push(AboutPage._code(cw,
            "new Switch({\n  checked: false,\n  onChange: (v) => { ... }\n});"
        ));

        items.push(AboutPage._subTitle('Select 下拉选择'));
        items.push(AboutPage._para(cw,
            '点击展开浮层面板显示选项列表，选择后自动收起。'
        ));
        items.push(AboutPage._code(cw,
            "new Select({\n  width: 400, items: ['A', 'B', 'C'],\n  onChange: (v) => { ... }\n});"
        ));

        items.push(AboutPage._secTitle('展示组件'));

        items.push(AboutPage._subTitle('Slider 滑块'));
        items.push(AboutPage._para(cw,
            '包含轨道、填充、手柄三部分。支持拖拽和点击定位。'
        ));
        items.push(AboutPage._code(cw,
            "new Slider({\n  width: 700, min: 0, max: 100,\n  value: 50,\n  onUpdate: (v) => { ... }\n});"
        ));

        items.push(AboutPage._subTitle('ProgressBar 进度条'));
        items.push(AboutPage._para(cw,
            '通过 progress 属性（0~100）控制进度，超出范围自动 clamp。'
        ));
        items.push(AboutPage._code(cw,
            "const bar = new ProgressBar({\n  width: 700, color: 0x4CAF50\n});\nbar.progress = 65;"
        ));

        items.push(AboutPage._subTitle('Swiper 轮播'));
        items.push(AboutPage._para(cw,
            '轮播图组件，支持循环滚动、自动播放，底部有指示点。'
        ));
        items.push(AboutPage._code(cw,
            "new Swiper({\n  width: 700, height: 300,\n  items: [...],\n  autoplay: true, interval: 3000\n});"
        ));

        items.push(AboutPage._secTitle('容器组件'));

        items.push(AboutPage._subTitle('ScrollBox 滚动容器'));
        items.push(AboutPage._para(cw,
            '支持触摸拖拽滚动，自动遮罩裁剪内容区域。'
        ));
        items.push(AboutPage._code(cw,
            "new ScrollBox({\n  width: w, height: h,\n  items: [...], gap: 12\n});"
        ));

        items.push(AboutPage._subTitle('ListItem 列表项'));
        items.push(AboutPage._para(cw,
            '单行列表项，含左侧圆点、文本和右侧箭头，支持分割线。'
        ));
        items.push(AboutPage._code(cw,
            "new ListItem({\n  width: 700, text: '列表项',\n  showDivider: true,\n  onTap: () => { ... }\n});"
        ));

        items.push(AboutPage._subTitle('TabBar 标签栏'));
        items.push(AboutPage._para(cw,
            '底部标签栏，支持多 tab 切换并高亮当前项。'
        ));
        items.push(AboutPage._code(cw,
            "new TabBar({\n  screenWidth: w,\n  tabs: [{ icon: '⚙', label: '设置' }],\n  onSwitch: (i) => { ... }\n});"
        ));

        items.push(AboutPage._secTitle('反馈组件'));

        items.push(AboutPage._subTitle('Dialog 对话框'));
        items.push(AboutPage._para(cw,
            '静态工具，提供 alert / confirm 两个 Promise 方法。'
        ));
        items.push(AboutPage._code(cw,
            "await Dialog.alert({ title: '提示', message: '内容' });\nconst ok = await Dialog.confirm({ title: '确认?' });"
        ));

        items.push(AboutPage._subTitle('Toast 轻提示'));
        items.push(AboutPage._para(cw,
            '显示带图标的临时消息提示，自动消失。支持 success/error/warning 类型。'
        ));
        items.push(AboutPage._code(cw,
            "Toast.show({ text: '操作成功', type: 'success' });"
        ));

        items.push(AboutPage._subTitle('Loading 加载'));
        items.push(AboutPage._para(cw,
            '全屏遮罩加旋转弧形动画，支持自定义说明文字。'
        ));
        items.push(AboutPage._code(cw,
            "Loading.show('加载中...');\n// 完成后\nLoading.hide();"
        ));

        items.push(AboutPage._subTitle('ActionSheet 操作面板'));
        items.push(AboutPage._para(cw,
            '从底部弹出操作列表，返回 Promise，支持取消按钮。'
        ));
        items.push(AboutPage._code(cw,
            "const i = await ActionSheet.show({\n  actions: [{ name: '编辑' }, { name: '删除' }]\n});"
        ));

        items.push(AboutPage._secTitle('通用工具'));

        items.push(AboutPage._subTitle('Icon 图标'));
        items.push(AboutPage._para(cw,
            '基于 PIXI.Sprite 的图标组件，内置 123 个 Lucide 图标（64x64 白色 PNG）。' +
            '支持通过 tint 动态变色，也支持 path 加载自定义图片。'
        ));
        items.push(AboutPage._code(cw,
            "// 内置图标\nnew Icon({ name: 'home', size: 48, color: 0x4A90D9 });\n\n// 自定义路径\nnew Icon({ path: 'image/logo.png', size: 64 });"
        ));

        items.push(AboutPage._subTitle('Modal 弹窗'));
        items.push(AboutPage._para(cw,
            'Dialog 的底层实现，支持自定义标题、正文、按钮和遮罩关闭。'
        ));

        items.push(AboutPage._subTitle('stage 舞台'));
        items.push(AboutPage._para(cw,
            '全局 stage 引用，供 Dialog/Toast/Loading/ActionSheet 等' +
            '静态组件挂载浮层使用。'
        ));

        items.push(AboutPage._secTitle('技术要点'));
        items.push(AboutPage._para(cw,
            '1. PixiJS v4 Graphics API: beginFill / drawRoundedRect / endFill\n' +
            '2. 交互事件: interactive=true + touchstart/touchend\n' +
            '3. 遮罩裁剪: container.mask = Graphics\n' +
            '4. Vivo 环境通过 qgame-adapter 模拟 BOM/DOM\n' +
            '5. 静态组件通过 stage 引用挂载到全局舞台\n' +
            '6. 统一的 COLOR / SIZE 主题常量管理样式\n' +
            '7. 图标通过 PIXI.Sprite + tint 实现加载与变色'
        ));

        items.push(AboutPage._secTitle('版本信息'));
        items.push(AboutPage._para(cw,
            'PixiJS: v4.8.9\nVivo 快游戏引擎: v1.27+\n组件数量: 17\n内置图标: 123\n构建: @vivo-minigame/cli-service'
        ));

        return items;
    }

    static _secTitle(text) {
        const t = new PIXI.Text(text, { fontSize: SIZE.textSizeXl, fill: COLOR.primary, fontWeight: 'bold', fontFamily: FONT });
        t._itemH = t.height;
        return t;
    }

    static _subTitle(text) {
        const t = new PIXI.Text(`  ${text}`, { fontSize: SIZE.textSize, fill: COLOR.warning, fontWeight: 'bold', fontFamily: FONT });
        t._itemH = t.height;
        return t;
    }

    static _para(w, text) {
        const t = new PIXI.Text(text, {
            fontSize: SIZE.textSizeSm, fill: COLOR.text, fontFamily: FONT,
            wordWrap: true, wordWrapWidth: w, lineHeight: SIZE.textSizeSm * 1.6,
        });
        t._itemH = t.height;
        return t;
    }

    static _code(w, code) {
        const c = new PIXI.Container();
        const t = new PIXI.Text(code, {
            fontSize: SIZE.textSizeXs, fill: 0x79C0FF, fontFamily: 'Courier New',
            wordWrap: true, wordWrapWidth: w - 40, lineHeight: 32,
        });
        t.x = 16;
        t.y = 12;

        const bg = new PIXI.Graphics();
        bg.beginFill(0x0D1117);
        bg.drawRoundedRect(0, 0, w, t.height + 24, 8);
        bg.endFill();
        c.addChild(bg);
        c.addChild(t);
        c._itemH = t.height + 24;
        return c;
    }
}
