# 热门需求页原型图实现说明

对应原型：`前端图片/热门需求.jpg`  
目标路由：建议使用 `/services` 作为“热门需求”页  
当前代码：`apps/web/app/pages/services/index.vue`

## 页面定位

该页面不是传统服务目录，而是“用户最常问的问题集合”。用户不需要先懂分类，只要能从卡片和列表里找到接近的问题，然后点击“去咨询”或“先聊聊”。

## 顶部区域

导航与首页一致，但当前页“热门需求”处于选中态：

- 文字为白色或黄绿色。
- 下方有短黄绿色指示线。

页面标题：

```text
最近大家最常问的，都在这了
```

副标题：

```text
如果你也在折腾 GPT、Google、Claude、API、中转配置这些，可以直接从这里进。
```

标题左对齐，字号约 48-58px。右上角有黄绿色便利贴，文案：

```text
不确定自己属于
哪一类？
直接说问题，
我们来帮你分。 :)
```

## 搜索条

标题下方是一条大搜索框：

- 左侧搜索图标。
- placeholder：“你也可以直接说你想干嘛......”
- 右侧为圆形/方形箭头按钮。
- 宽度约 820px，高度 54px。
- 黑底、细边框、内阴影，聚焦时边框转黄绿。

搜索可先实现为本地过滤，也可以在第一阶段只作为跳转 `/note?prefill=` 的入口。重点是视觉上要鼓励用户直接表达问题。

## 顶部重点需求卡片

搜索下方有 6 张大卡片横向排列：

1. 注册 Google 账号
2. Google Pro / Gemini
3. GPT Pro / API
4. Claude / Claude Code
5. API Key / 中转站 / token
6. 工具安装 / 网络环境

每张卡片包含：

- 彩色图标，尺寸约 52px。
- 标题 18px。
- 两行说明。
- 主小按钮“去咨询 ->”。

卡片视觉：

- 深色卡片，圆角 14-16px。
- 每张可使用不同弱色边框/光晕，与图标呼应。
- 第一张可高亮黄绿边框，表示默认推荐。

## 分类需求面板

主体区是 2 行 3 列布局。每个面板是一个分类，里面有 4 条常见需求。

### 1. GPT / OpenAI 相关

列表：

- ChatGPT Plus 升级：注册 GPT Plus 会员
- OpenAI API 开通：开通 API，获取 Key
- API 使用问题排查：报错 / 配置 / 额度等问题
- GPTs / 插件配置：插件安装与使用指导

### 2. Google / Gemini / 海外工具

列表：

- 注册 Google 账号：解决注册与验证问题
- Google Pro 订阅：开通 Google One / Pro
- Gemini 订阅与使用：Gemini Pro 开通与配置
- YouTube Premium：开通 YouTube Premium

### 3. Claude / Claude Code

列表：

- Claude Pro 订阅：订阅 Claude Pro 账号
- Claude Code 授权：授权 Claude Code
- 使用问题排查：报错 / 限制 / 配置等
- 多账号与团队方案：团队 / 多账号配置支持

### 4. API / 中转 / 模型配置

列表：

- API Key 获取：各大平台 API Key
- 中转站搭建：搭建中转服务 / 代理
- Token 配置：Token 获取与配置
- 模型接入与调用：接入第三方模型服务

### 5. 网络环境 / 安装 / 远程协助

列表：

- 代理 / 科学上网：代理配置 / 节点推荐
- 环境安装配置：软件 / 环境安装配置
- 远程协助：一对一远程协助解决
- 系统与软件问题：系统 / 软件问题处理

### 6. 大家也常问

该面板是 FAQ 样式，不是普通列表：

- 能不能远程？
- 要不要先付款？
- 会不会包售后？

每条为横向折叠项或可点击行，右侧箭头。

## 列表行组件

每条需求行包含：

- 左侧小图标，32-36px。
- 中间标题和描述。
- 右侧按钮：根据需求类型显示“我要咨询”或“先聊聊”。

行高约 58-66px，行与行之间用微弱边框分割。hover 时整行背景略亮。

## 底部 CTA

页面底部是一条横向 CTA 条：

左侧：

```text
没找到你需要的服务？ 告诉我们你的问题，定制专属解决方案
```

右侧黄绿色按钮：

```text
我也有类似需求 ->
```

按钮链接到 `/note?service=not-sure`。

## 当前实现改造映射

- `apps/web/app/pages/services/index.vue`
  - 删除当前大 hero 的“先拆问题，再决定怎么做”结构，替换为热门需求标题、搜索条、重点需求卡片、分类面板。
  - 现有 `services` API 可继续用于基础分类，但原型中的具体热门条目需要新增前端静态配置或后端 catalog 扩展。
  - 当前 `caseCards`、FAQ、交易规则可以移到服务详情页或首页，不应挤在热门需求页。
- `apps/web/app/layouts/default.vue`
  - `/services` 导航文案改为“热门需求”。

## 数据结构建议

建议前端增加 `popularNeedGroups` 静态配置：

```ts
type PopularNeed = {
  title: string;
  description: string;
  icon: string;
  serviceSlug: string;
  actionLabel: "我要咨询" | "先聊聊";
};

type PopularNeedGroup = {
  title: string;
  tone: "lime" | "blue" | "purple" | "orange" | "green";
  items: PopularNeed[];
};
```

点击需求时跳转：

```text
/note?service={serviceSlug}&topic={encodedTitle}
```

后续 `/note` 可读取 `topic` 自动预填提示。

## 响应式要求

- 1200px 以下：顶部 6 卡可改为 3 列 2 行。
- 900px 以下：分类面板改为单列或 2 列。
- 560px 以下：搜索框全宽；重点卡片单列；分类行按钮缩为图标或“咨询”短文本。

## 组件级实现规格

热门需求页的核心不是“服务详情”，而是“快速找到相似问题”。实现时建议拆成 `PopularNeedsHero`、`NeedSearchBar`、`FeaturedNeedCards`、`NeedGroupBoard`、`NeedGroupPanel`、`NeedRowItem`、`CommonQuestionPanel`、`NeedBottomCta`。

### 1. `PopularNeedsHero`

位置：导航下方。左侧标题和搜索，右侧便利贴。

结构：

- `pageTitle`：最近大家最常问的，都在这了。
- `pageSubtitle`：如果你也在折腾 GPT、Google、Claude、API、中转配置这些，可以直接从这里进。
- `NeedSearchBar`。
- 右侧 `HelpStickyNote`。

视觉规格：

- 标题字号 50-58px，字重 900，行高 1.08。
- 副标题在标题下 10-12px，颜色为次级灰白。
- Hero 区总高度约 190-230px，不要像首页那样占满大屏。
- 便利贴位于右上，距离内容右边缘 80-110px，旋转约 4deg。

### 2. `NeedSearchBar`

用途：让用户直接输入自己的问题。第一阶段可以本地过滤需求；第二阶段可跳转小纸条。

结构：

- 左侧搜索图标，20px。
- 中间输入框，placeholder：“你也可以直接说你想干嘛......”。
- 右侧提交按钮，36x36px，箭头图标。

尺寸：

- 桌面宽度 780-820px，高 54px。
- 圆角 10-12px。
- 内边距左 20px，右 8px。

状态：

- default：边框 `rgba(255,255,255,0.12)`。
- focus：边框黄绿，外发光 `0 0 0 3px rgba(199,255,53,0.10)`。
- typing：右侧按钮变亮。

交互：

- 输入时过滤 `FeaturedNeedCards` 和 `NeedRowItem`。
- 点击箭头：
  - 如果有输入，跳转 `/note?service=not-sure&topic={query}`。
  - 如果为空，聚焦输入框或滚动到分类面板。

### 3. `FeaturedNeedCards`

位置：搜索条下方，6 张重点需求卡。

布局：

- 桌面端 `grid-template-columns: repeat(6, minmax(0, 1fr))`。
- 每张卡高度 170-180px。
- 卡片间距 14-16px。

每张卡结构：

- `iconBox`：52x52px，圆角 14px。
- `title`：两行以内。
- `description`：2 行，颜色次级。
- `consultButton`：黄绿小按钮，高 34px，文字“去咨询 ->”。

数据：

```ts
type FeaturedNeedCard = {
  id: string;
  title: string;
  description: string;
  serviceSlug: string;
  icon: string;
  accent: "google" | "blue" | "green" | "orange" | "purple";
};
```

样式细节：

- 每张卡可以有不同 `accent` 边框，但亮度必须克制。
- 第一张卡边框可为黄绿，表示当前焦点。
- 图标背景色要与卡片边框呼应，但不要整卡变成彩色。

交互：

- 点击卡片或按钮跳转 `/note?service={serviceSlug}&topic={title}`。
- hover 时卡片 `transform: translateY(-2px)`，但移动端禁用位移。

### 4. `NeedGroupBoard`

位置：页面主体。2 行 3 列的分类面板容器。

布局：

- 桌面端 3 列，每列面板高度约 276-310px。
- 行间距 16px，列间距 16px。
- 第 6 个面板为 FAQ 样式，但仍占一个网格单元。

实现：

```ts
const needGroups: NeedGroup[] = [
  { number: 1, title: "GPT / OpenAI 相关", tone: "lime", items: [...] },
  { number: 2, title: "Google / Gemini / 海外工具", tone: "blue", items: [...] },
  { number: 3, title: "Claude / Claude Code", tone: "purple", items: [...] },
  { number: 4, title: "API / 中转 / 模型配置", tone: "blue", items: [...] },
  { number: 5, title: "网络环境 / 安装 / 远程协助", tone: "green", items: [...] }
];
```

### 5. `NeedGroupPanel`

面板结构：

- `panelHeader`
  - 左侧编号圆点，30px。
  - 标题。
  - 右侧链接“查看全部 ->”。
- `needList`
  - 4 个 `NeedRowItem`。

样式：

- 背景 `rgba(10,11,11,0.88)`。
- 边框默认灰白透明；根据 `tone` 加顶部或外边框弱色。
- 圆角 14-16px。
- 内边距 14-16px。

标题字号：

- 编号 15px，圆点内居中。
- 标题 17-18px，字重 750。
- “查看全部” 13px，颜色灰白，hover 黄绿。

### 6. `NeedRowItem`

这是页面最关键的中间组件。每个需求条目都要像“可下单的小问题”，不是普通文本列表。

结构：

- 左侧图标：34x34px，圆角 9px。
- 中间文本：
  - 标题：15px，单行省略。
  - 描述：12-13px，单行省略。
- 右侧按钮：
  - “我要咨询”或“先聊聊”。
  - 高 32px，宽 74-86px。

字段：

```ts
type NeedRow = {
  title: string;
  description: string;
  serviceSlug: string;
  topic: string;
  actionLabel: "我要咨询" | "先聊聊";
  icon: string;
};
```

交互：

- 整行 hover 背景略亮。
- 点击行或按钮均跳转 `/note?service={serviceSlug}&topic={topic}`。
- 键盘 focus 轮廓黄绿。

边界：

- 标题和描述必须 `min-width: 0`，防止中文长词撑破。
- 右侧按钮不得被挤压小于 68px。

### 7. `CommonQuestionPanel`

第 6 个面板，标题为“大家也常问”，左侧火焰图标，右侧“更多问题 ->”。

内容为 3 条 FAQ 行：

- 能不能远程？
- 要不要先付款？
- 会不会包售后？

行结构：

- 标题 15px。
- 描述 12-13px。
- 右侧箭头。

交互：

- 第一阶段点击跳转 `/help?doc=faq`。
- 后续可做 accordion 展开。

### 8. `NeedBottomCta`

位置：页面底部，横向大提示条。

结构：

- 左侧星光图标。
- 文案：“没找到你需要的服务？ 告诉我们你的问题，定制专属解决方案”。
- 右侧主按钮：“我也有类似需求 ->”。

样式：

- 高度 68-76px。
- 边框黄绿弱光。
- 按钮宽 190-220px，高 46px。

响应式：

- 640px 以下文案和按钮竖排，按钮全宽。
