# 酷里前端原型图实现说明总览

## 目的

本目录把 `前端图片/` 下的 4 张前端原型图拆成可执行的前端设计修改说明。它不是营销文案稿，而是给后续 Nuxt/Vue 页面改造使用的设计合同：页面结构、组件层级、视觉规则、交互状态和当前代码映射都要能直接指导实现。

当前原型图：

- `前端图片/主页.jpg` -> `01-homepage.md`
- `前端图片/热门需求.jpg` -> `02-popular-needs.md`
- `前端图片/写张小纸条.jpg` -> `03-note-intake.md`
- `前端图片/我的订单.jpg` -> `04-orders-workbench.md`

## 全局视觉方向

四张图共享同一套“黑色小窗口工作室”视觉语言。整体应该保留酷里轻松、机灵、可咨询的气质，但页面密度和组件秩序要比当前实现更成熟。

### 画布和布局

- 背景：接近纯黑的深色底，建议使用 `#030404` 到 `#080908`，局部用微弱径向暗绿/暗蓝光晕，但不能出现大面积渐变装饰。
- 页面宽度：桌面端主内容约 1360px 居中，左右留 36-56px。原型尺寸为 1448x1086，内容基本占满首屏。
- 顶部导航：固定在顶部视觉层，黑底，底部细分割线；高度约 64px。页面主体从导航下方开始，不使用厚重 hero 顶部留白。
- 页脚：黑色横栏，左侧品牌，右侧联系图标或 CTA。页脚高度约 72-92px。
- 组件密度：整体是高密度但不拥挤。卡片之间间距 14-18px，大区块之间 20-28px。

### 品牌和颜色

- 主强调色：荧光黄绿，建议 `#c8ff2e` 或 `#c7ff35`，用于主 CTA、选中状态、步骤编号、重点词。
- 文本：主标题近白 `#f3f3ef`；正文灰白 `#b7b7b0`；次级信息 `#7c7d78`。
- 边框：默认 `rgba(255,255,255,0.12)`；强调卡片边框使用 `rgba(199,255,53,0.65)`。
- 状态色：
  - 确认/完成：绿色
  - 需求确认/等待：橙色
  - 试跑/开发：蓝紫色
  - 待验收/时间：黄色
  - 信息/工具：蓝色
- 便利贴：蓝色和黄绿色两类，带轻微旋转、胶带/图钉装饰；它们是页面的情绪点，不应过多。

### 字体和排版

- 中文主标题要有厚重手感，字重 800-900，视觉接近海报标题。
- 标题不使用负字距；字号可大，但必须适配移动端，不得溢出。
- 正文默认字重 400-500，避免全站粗体。
- 页面标题：
  - 首页首屏 H1：56-68px 桌面，移动端 34-42px。
  - 内页 H1：46-58px 桌面，移动端 30-38px。
  - 卡片标题：16-22px。
- 高亮词只用主强调色，避免同一行出现多种强调色。

### 组件语言

- 卡片：深色半透明面板，1px 细边框，10-16px 圆角。卡片内可有弱内阴影和顶部高光线。
- 图标：彩色方形图标容器，尺寸 42-52px。后续实现优先用已有 icon library 或静态映射，不使用纯文字占位。
- 按钮：主按钮为荧光黄绿填充，黑字，带铅笔/纸飞机/箭头图标。次按钮为黑底描边，白字。
- 标签/选项：胶囊按钮，选中时黄绿边框或填充。
- 流程线：订单和首页流程使用横向虚线/实线连接；移动端改为竖向。
- 聊天窗口：黑色窗口面板，带红黄绿窗口控制点，消息气泡带左右错位。

## 全局导航要求

原型导航项固定为：

1. 热门需求
2. 文档处理
3. AI 工具
4. 小工具开发
5. 部署配置
6. 我的订单

右侧主 CTA 固定为“写张小纸条”。当前代码里的“能做什么 / 产品 / 文档说明”需要在改版时重新映射：

- `热门需求` -> `/services` 或新的热门需求页。
- `文档处理` -> `/services/document-processing`。
- `AI 工具` -> `/services/ai-tools`。
- `小工具开发` -> `/services/tool-development`。
- `部署配置` -> `/services/deployment-config`。
- `我的订单` -> `/orders`。
- `写张小纸条` -> `/note`。

桌面端导航应横向展开；移动端可换成两行可换行导航或抽屉，但不能完全隐藏核心入口。

## 实现边界

- 这些文档描述目标体验，不要求一次性全部完成。
- 优先改造四个页面对应的路由：`/`、`/services`、`/note`、`/orders`。
- 原型图中的静态示例内容可以先硬编码为展示数据；涉及真实订单和用户数据的页面必须保留现有 API 数据驱动能力。
- 不要为了复刻装饰而破坏可用性。便利贴、星形线稿、箭头涂鸦可以用 CSS 或简单图标实现，但不能遮挡内容。
- 每次实现后都要用桌面和移动端验证无横向溢出、无 500、导航可见、主 CTA 可点击。

## 组件规格阅读顺序

实现前建议按以下顺序阅读和拆组件：

1. 先读本总览，确定全局导航、颜色、卡片、按钮、字体和便利贴语言。
2. 再读具体页面文档的“页面定位”和“页面结构”，确认路由目标和信息层级。
3. 最后读每份文档末尾的“组件级实现规格”，按组件逐个实现。

四个页面都有组件级拆解：

- `01-homepage.md`：`HomeHero`、`HeroChatWindow`、`StickyNoteCluster`、`NeedShortcutStrip`、`CapabilityGrid`、`HomeProcessRail`、`HomeNoticeBar`、`HomeFooterCta`。
- `02-popular-needs.md`：`PopularNeedsHero`、`NeedSearchBar`、`FeaturedNeedCards`、`NeedGroupBoard`、`NeedGroupPanel`、`NeedRowItem`、`CommonQuestionPanel`、`NeedBottomCta`。
- `03-note-intake.md`：`NotePageHero`、`NoteIntakeLayout`、`NoteFormPanel`、`NoteStepBlock`、`SegmentedChoiceGroup`、`DropzoneUpload`、`ContactMethodInput`、`NoteExampleAside`。
- `04-orders-workbench.md`：`OrdersPageHeader`、`OrderStatsGrid`、`OrderListPanel`、`OrderListItem`、`OrderDetailPreview`、`OrderProgressRail`、`ConversationCard`、`AttachmentStrip`、`QuotePaymentCard`、`OrderActionBar`。

## 建议优先抽出的复用组件

这些组件跨多页复用，建议优先放到 `apps/web/app/components/` 下：

- `KuliPrimaryButton` / `KuliSecondaryButton`：统一黄绿主按钮和描边按钮。
- `KuliIconTile`：统一彩色图标方块。
- `KuliPanel`：统一深色面板、边框、圆角和内阴影。
- `KuliStickyNote`：统一蓝色/黄绿色便利贴、胶带、图钉、旋转角度。
- `KuliSectionTitle`：统一带图标的小节标题。
- `SegmentedChoiceGroup`：小纸条分类、时间、预算、远程、联系方式共用。
- `StatusPill`：订单状态和需求状态共用。
- `FilePreviewItem`：上传文件和订单附件共用。

复用组件必须支持 `class` 透传或 slot，避免为了复用牺牲页面的具体布局。
