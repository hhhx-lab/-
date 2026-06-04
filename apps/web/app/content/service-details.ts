export type ServiceTone = "lime" | "blue" | "purple" | "orange" | "green" | "yellow" | "neutral";

export type ServiceDetailCard = {
  title: string;
  description: string;
  brand?: string;
  icon?: string;
  tone?: ServiceTone;
  tileClass?: string;
  note?: string;
};

export type ServiceDetailPanel = {
  eyebrow: string;
  title: string;
  items: string[];
};

export type ServiceDetailStep = {
  title: string;
  description: string;
};

export type ServiceDetailFaq = {
  question: string;
  answer: string;
};

export type ServiceDetailPage = {
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  intro: string;
  highlights: string[];
  primaryActionLabel: string;
  primaryActionTo: string;
  secondaryActionLabel: string;
  secondaryActionTo: string;
  asideLabel: string;
  asideQuote: string;
  asideDescription: string;
  heroPoints: Array<{ title: string; description: string }>;
  capabilitiesTitle: string;
  capabilitiesLead: string;
  capabilities: ServiceDetailCard[];
  panelsTitle: string;
  panelsLead: string;
  panels: ServiceDetailPanel[];
  processTitle: string;
  processLead: string;
  process: ServiceDetailStep[];
  faqTitle: string;
  faqLead: string;
  faq: ServiceDetailFaq[];
  ctaTitle: string;
  ctaLead: string;
  ctaActionLabel: string;
  seoDescription: string;
};

export const serviceDetailPages: Record<string, ServiceDetailPage> = {
  "document-processing": {
    slug: "document-processing",
    eyebrow: "万能文档处理",
    title: "文档处理，把乱掉的材料重新收拾成能交的版本",
    summary: "PPT、Word、论文、PDF、图片转 Word、扫描件 OCR、格式修复和排版规范，都可以先发来。",
    intro:
      "文档最烦的地方，通常不是写不出来，而是卡在格式、分页、目录、页码、引用、图表、公式、扫描件和导出这些细碎环节。酷里会先判断它属于排版、转换、润色、重做还是规范修复，再决定用哪条路最快把它做顺。",
    highlights: ["PPT 制作", "论文格式规范", "图片转 Word", "PDF / Word / PPT 互转"],
    primaryActionLabel: "开始处理文档",
    primaryActionTo: "/note?service=document-processing",
    secondaryActionLabel: "先看常见问题",
    secondaryActionTo: "/services/document-processing#detail-faq",
    asideLabel: "先判断，再交付",
    asideQuote: "先看材料，再定格式；先做能交的版本，再做更好看的版本。",
    asideDescription:
      "你不用先判断它到底是排版、转换、OCR、重写还是润色，把文件和目标效果发来就行。",
    heroPoints: [
      { title: "PPT", description: "答辩、汇报、路演、项目展示都能做" },
      { title: "Word", description: "排版、目录、页码、样式和模板统一" },
      { title: "PDF / OCR", description: "扫描件、图片、PDF 转成可编辑版本" }
    ],
    capabilitiesTitle: "我们可以试着处理的文档问题",
    capabilitiesLead: "不只改格式，也能做转换、整理、重写和版式修复。",
    capabilities: [
      {
        title: "PPT 制作与优化",
        description: "根据论文、提纲、报告或资料包做演示稿，也可以把现有 PPT 美化成更像样的版本。",
        icon: "▤",
        tone: "lime"
      },
      {
        title: "Word 排版与格式调整",
        description: "标题层级、页边距、行距、页眉页脚、页码、目录和参考文献都能统一。",
        icon: "▦",
        tone: "blue"
      },
      {
        title: "论文与学术格式规范",
        description: "按学校或期刊要求调整论文结构、图表编号、脚注尾注和参考文献格式。",
        icon: "∑",
        tone: "purple"
      },
      {
        title: "图片 / 扫描件 / PDF 转 Word",
        description: "把截图、照片、扫描件或 PDF 尽量转成可编辑内容，保留原版式和表格结构。",
        icon: "◧",
        tone: "orange"
      },
      {
        title: "内容整理与文档重写",
        description: "把聊天记录、资料包、录音转写稿整理成正式文档，也能润色表达和统一术语。",
        icon: "✎",
        tone: "green"
      },
      {
        title: "表格、图表与数据文档",
        description: "Excel 清洗、图表制作、数据结果整理成 Word 或 PPT，方便提交和汇报。",
        icon: "▣",
        tone: "neutral"
      }
    ],
    panelsTitle: "先把这三件事说清楚",
    panelsLead: "材料、结果和边界先讲明白，后面处理起来才快。",
    panels: [
      {
        eyebrow: "你需要准备",
        title: "把原文件和目标效果先发来",
        items: ["原始文件、截图、扫描件或资料包", "目标格式，比如 Word、PPT、PDF、Excel", "学校模板、公司要求或参考样例", "截止时间和最终用途"]
      },
      {
        eyebrow: "最终能拿到",
        title: "交付物会尽量给到可继续编辑的版本",
        items: ["可编辑 Word 文档", "可演示 PPT", "可提交 PDF", "OCR 后的文字稿、表格稿或结构化资料"]
      },
      {
        eyebrow: "边界说明",
        title: "复杂源文件会先告诉你难点在哪里",
        items: ["低清扫描件和复杂公式不一定能 100% 还原", "表格、图片和版式转换时可能需要二次确认", "如果模板要求很严格，会先确认是否适合当前材料"]
      }
    ],
    processTitle: "我们通常怎么处理",
    processLead: "先把文档拆成能落地的步骤，再开始做。",
    process: [
      { title: "发材料", description: "把文件、截图、样例和你的目标效果一起发来。" },
      { title: "判断路径", description: "看它更适合排版、转换、OCR、整理还是重做。" },
      { title: "正式处理", description: "做格式统一、内容整理、图表修复和导出。" },
      { title: "交付微调", description: "把最终稿交给你，必要时再补几轮调整。" }
    ],
    faqTitle: "文档处理常见问题",
    faqLead: "先把大家最常问的几件事讲透。",
    faq: [
      {
        question: "PDF 能直接转成可编辑 Word 吗？",
        answer: "可以试，效果取决于原文件清晰度、排版复杂度和表格比例。能还原的会尽量还原，不能完美还原的地方会提前说明。"
      },
      {
        question: "论文格式能按学校模板改吗？",
        answer: "可以，常见的标题层级、目录、页码、图表编号、参考文献和附录格式都能一起处理。"
      },
      {
        question: "图片、截图或扫描件也能做吗？",
        answer: "可以，通常会先做 OCR，再根据目标格式重新整理排版。"
      }
    ],
    ctaTitle: "把文件发来，酷里先帮你拆问题",
    ctaLead: "你不用先会 Word、PPT、PDF、OCR 或排版术语，把材料和目标效果直接发过来就行。",
    ctaActionLabel: "开始处理文档",
    seoDescription:
      "酷里可以处理 PPT 制作、Word 排版、论文格式规范、图片转 Word、PDF / 扫描件 OCR、表格整理、内容重写和文档转换。"
  },

  "ai-tools": {
    slug: "ai-tools",
    eyebrow: "AI 工具与海外服务配置",
    title: "把 ChatGPT、Gemini、Claude、Grok 和整套工具链配到能用",
    summary: "账号、订阅、API、中转站、Claude Code、Codex、Cursor、Antigravity、Telegram 等，都可以先来问。",
    intro:
      "AI 工具本身不难，难的是前面那一长串：账号注册、验证、支付、地区限制、订阅升级、API Key、环境变量、客户端安装、模型选择和中转接入。酷里会先帮你解释这些工具分别是什么，再按你的用途、设备和预算，协助把能用的那套环境搭起来。",
    highlights: ["账号 / 订阅", "API / 中转站", "编程工具", "海外服务"],
    primaryActionLabel: "配置 AI 工具",
    primaryActionTo: "/note?service=ai-tools",
    secondaryActionLabel: "先看常见问题",
    secondaryActionTo: "/services/ai-tools#detail-faq",
    asideLabel: "先认识工具，再决定怎么配",
    asideQuote: "先说你想做什么，再决定要注册、订阅、装客户端、接 API 还是搭中转。",
    asideDescription:
      "我们会先讲清楚每个工具是什么、强在哪、适合做什么，再告诉你可以怎么接到你的日常使用里。",
    heroPoints: [
      { title: "账号 / 订阅", description: "注册、升级套餐、支付和验证路径一起看" },
      { title: "API / 中转", description: "Key、环境变量、代理、SDK 和调用方式都能配" },
      { title: "编程工具", description: "Claude Code、Codex、Cursor、Antigravity 也能配" }
    ],
    capabilitiesTitle: "这些 AI 和海外工具，我们可以先帮你理顺",
    capabilitiesLead: "有些是账号和订阅，有些是本地工具，有些是开发接入。",
    capabilities: [
      {
        title: "ChatGPT / OpenAI",
        description: "通用 AI 助手，适合写作、翻译、学习、代码和日常办公，也可以协助 API 和 GPT 相关配置。",
        brand: "openai",
        tone: "green"
      },
      {
        title: "Gemini / Google",
        description: "Google 的 AI 体系，适合长文阅读、资料处理和 Google 生态联动，也可以协助注册与订阅。",
        brand: "gemini",
        tone: "blue"
      },
      {
        title: "Claude / Anthropic",
        description: "长上下文、写作和编程都很强，也能协助 Claude Pro、Team 和 API 配置。",
        brand: "claude",
        tone: "orange"
      },
      {
        title: "Grok / xAI",
        description: "更偏实时信息、社交内容和通用问答场景，也可以一起看账号和使用问题。",
        brand: "grok",
        tileClass: "brand-icon-wide",
        tone: "purple"
      },
      {
        title: "Telegram",
        description: "海外常用通讯工具，适合 Bot、频道通知、群组协作和自动化提醒。",
        brand: "telegram",
        tone: "blue"
      },
      {
        title: "Claude Code",
        description: "命令行里的 AI 编程助手，适合在真实代码仓库里读文件、改代码、跑测试。",
        brand: "claude",
        tone: "orange"
      },
      {
        title: "Cursor",
        description: "AI 代码编辑器，适合在项目里快速理解结构、生成组件、定位问题和推进开发。",
        brand: "cursor",
        tone: "neutral"
      },
      {
        title: "Codex",
        description: "面向代码任务的 AI 协作环境，适合写代码、改 bug、补测试和整理仓库。",
        brand: "codex",
        tone: "green"
      },
      {
        title: "Antigravity",
        description: "更偏 Agent / 协作式开发的工具形态，适合把 AI 放进更完整的工作流里。",
        brand: "antigravity",
        tileClass: "brand-icon-wide",
        tone: "yellow"
      },
      {
        title: "API Key / 中转站 / SDK",
        description: "各类模型 API、Key、代理、中转站和 SDK 接入都能一起看，尽量配到能跑。",
        icon: "⚙",
        tone: "neutral"
      }
    ],
    panelsTitle: "先把这三件事讲透",
    panelsLead: "这样我们能更快判断：先注册、先订阅、先装工具，还是先配 API。",
    panels: [
      {
        eyebrow: "你需要准备",
        title: "把目标工具和当前状态发来",
        items: ["你想用的工具名称和用途", "设备系统、浏览器、网络环境和报错截图", "是否已有账号、订阅、API Key 或项目代码", "预算、使用频率和是否需要团队协作"]
      },
      {
        eyebrow: "最终能拿到",
        title: "我们会尽量把环境配到你能继续用",
        items: ["可登录、可使用的账号与工具环境", "已配置好的客户端、命令行工具或 IDE", "可调用的 API Key、中转地址和测试示例", "使用说明、配置说明和常见问题排查清单"]
      },
      {
        eyebrow: "边界说明",
        title: "账号、订阅和网络问题会先讲清限制",
        items: ["平台风控可能变化", "不保证绕过平台审核或限制", "必须在用户授权和平台规则范围内处理", "如果预算或地区限制很强，会先给替代方案"]
      }
    ],
    processTitle: "AI 工具通常这样处理",
    processLead: "先解释是什么，再看怎么接入你现在的环境。",
    process: [
      { title: "先讲清楚", description: "说明这个工具是什么、强在哪、适合什么场景。" },
      { title: "再分类处理", description: "判断是账号、订阅、API、客户端还是中转配置。" },
      { title: "落到环境里", description: "帮你把工具装好、配好、连上能跑的路径。" },
      { title: "留一份说明", description: "把关键设置、入口和常见问题整理给你。" }
    ],
    faqTitle: "AI 工具常见问题",
    faqLead: "你大概率会先问这几个。",
    faq: [
      {
        question: "账号、订阅、API 和客户端可以一起看吗？",
        answer: "可以，很多时候它们本来就是一套问题，会一起判断、一起配置。"
      },
      {
        question: "Claude Code、Cursor、Codex、Antigravity 怎么选？",
        answer: "可以先按你的目标来分：是想写代码、看仓库、做 Agent 还是做编辑器内协作，我们会先帮你挑最合适的。"
      },
      {
        question: "Telegram、Google 账号也能一起处理吗？",
        answer: "可以，相关账号注册、验证、登录和基础配置都能一起看。"
      }
    ],
    ctaTitle: "把你想用的 AI 工具发来，酷里帮你配到能用",
    ctaLead: "先说目标，再说预算和设备，剩下的我们来帮你拼路径。",
    ctaActionLabel: "配置 AI 工具",
    seoDescription:
      "酷里可以协助 ChatGPT、Gemini、Claude、Grok、Telegram、Claude Code、Codex、Cursor、Antigravity 的账号、订阅、API、中转站和环境配置。"
  },

  "tool-development": {
    slug: "tool-development",
    eyebrow: "小工具开发与全栈代做",
    title: "把想法做成能跑的网页、小程序、脚本或软件",
    summary: "网站、小程序、爬虫、数据看板、数据库、AI Agent、自动化工具，从 demo 到成品都可以做。",
    intro:
      "很多想法其实不用先组完整团队，也不用先写成厚厚的需求文档。你可能只是想要一个页面、一个小程序、一个自动抓数据的脚本、一个内部管理后台、一个 AI 助手，或者一个能拿去演示的 demo。酷里可以把这些想法拆开、做出来、接起来，再继续迭代。",
    highlights: ["网页 / 小程序", "脚本 / 爬虫", "数据库 / 后台", "demo 到成品"],
    primaryActionLabel: "开始做小工具",
    primaryActionTo: "/note?service=tool-development",
    secondaryActionLabel: "先看常见问题",
    secondaryActionTo: "/services/tool-development#detail-faq",
    asideLabel: "先做能跑的版本",
    asideQuote: "先把最小可用版本跑通，再把想要的细节一点点补上。",
    asideDescription: "你负责讲场景和目标，我们负责把需求拆成页面、接口、数据和交付。",
    heroPoints: [
      { title: "网站 / 小程序", description: "从展示页到带后台的完整应用都能做" },
      { title: "脚本 / 爬虫", description: "重复劳动、采集、批处理和定时任务都能自动化" },
      { title: "数据库 / AI", description: "数据、权限、AI Agent 和工作流一起接起来" }
    ],
    capabilitiesTitle: "这些开发类工作，我们都可以先试着做",
    capabilitiesLead: "可以是 demo，也可以是后续能接着长大的成品。",
    capabilities: [
      {
        title: "网站与网页应用",
        description: "企业官网、个人主页、产品页、后台系统、数据看板、表单系统都可以做。",
        icon: "</>",
        tone: "blue"
      },
      {
        title: "小程序与轻应用",
        description: "微信小程序、H5 小应用、活动报名、预约系统和查询工具都能做。",
        icon: "◫",
        tone: "green"
      },
      {
        title: "爬虫与数据采集",
        description: "公开数据抓取、清洗、去重、导出和定时采集都可以配好。",
        icon: "⌘",
        tone: "purple"
      },
      {
        title: "自动化脚本",
        description: "批量处理文件、图片、表格、报告、通知和重复任务都可以自动化。",
        icon: "⚙",
        tone: "neutral"
      },
      {
        title: "AI Agent 与智能助手",
        description: "做问答助手、资料库助手、客服助手或者带工具调用的 Agent 都可以。",
        icon: "AI",
        tone: "lime"
      },
      {
        title: "软件与内部工具",
        description: "桌面工具、命令行工具、浏览器插件或面向内部使用的小软件都能做。",
        icon: "▦",
        tone: "orange"
      },
      {
        title: "数据库与后端系统",
        description: "表结构、权限、API、任务队列、上传下载和看板逻辑都能一起配。",
        icon: "⬢",
        tone: "green"
      },
      {
        title: "设计系统与原型",
        description: "页面结构、组件、视觉风格和可点击原型都可以先搭出来。",
        icon: "✧",
        tone: "yellow"
      }
    ],
    panelsTitle: "先把需求讲透，后面就好做了",
    panelsLead: "同样是开发，先做 demo 还是直接做成品，路径会很不一样。",
    panels: [
      {
        eyebrow: "你需要准备",
        title: "把场景、目标和限制先讲清楚",
        items: ["你想解决的问题和最终使用方式", "参考网站、草图、截图或竞品", "必须有的功能和可以后做的功能", "是否需要登录、支付、后台、数据库、AI 或通知"]
      },
      {
        eyebrow: "最终能拿到",
        title: "从原型到成品都可以交付",
        items: ["可访问的网站或 H5 页面", "可运行的小程序、脚本、爬虫或后台", "前后端代码、数据库结构和部署脚本", "使用说明、页面说明和后续迭代建议"]
      },
      {
        eyebrow: "边界说明",
        title: "如果想法很散，我们会先帮你拆成能做的部分",
        items: ["复杂项目会先拆最小可用版本", "旧项目、半成品也可以接手，但会先看代码状态", "如果要长期维护，会先把边界和节奏讲清楚"]
      }
    ],
    processTitle: "小工具开发通常怎么走",
    processLead: "先跑通核心流程，再决定要不要继续往成品长。",
    process: [
      { title: "先定目标", description: "把你想让工具帮你完成的事情讲出来。" },
      { title: "拆成模块", description: "拆成页面、接口、数据、权限和交互。" },
      { title: "先做 demo", description: "先把最小版本跑起来，验证方向对不对。" },
      { title: "继续迭代", description: "再补功能、优化界面、接数据库和部署上线。" }
    ],
    faqTitle: "小工具开发常见问题",
    faqLead: "开工前最常问的几件事。",
    faq: [
      {
        question: "可以先做 demo 吗？",
        answer: "可以，很多项目先做一个能跑的版本，再慢慢完善成品。"
      },
      {
        question: "能接手半成品或别人写了一半的项目吗？",
        answer: "可以，先看代码结构、依赖和报错，再判断接手方式。"
      },
      {
        question: "前端、后端、数据库和部署都能一起做吗？",
        answer: "可以，默认就是按完整链路来考虑，不只停在页面。"
      }
    ],
    ctaTitle: "把想法发来，酷里帮你拆成能做的产品",
    ctaLead: "你不需要先会技术，只要告诉我们你想让它做什么。",
    ctaActionLabel: "开始做小工具",
    seoDescription:
      "酷里可以做网站、小程序、爬虫、自动化脚本、AI Agent、后台系统、数据库和设计原型，从 demo 到成品都能协助。"
  },

  "deployment-config": {
    slug: "deployment-config",
    eyebrow: "部署配置与服务器运维",
    title: "把服务器、域名、数据库和上线环境一次理顺",
    summary: "服务器部署、网站上线、VPN、堡垒机、母子网、云算力、域名申请和 DNS，都可以先问。",
    intro:
      "项目做出来以后，真正让人头疼的往往是上线和配置：服务器怎么买、域名怎么注册、DNS 怎么配、HTTPS 怎么开、数据库怎么连、端口为什么不通、反向代理怎么写、后台服务怎么守护、VPN 怎么部署、远程连接怎么更安全。酷里可以把这些基础设施问题拆开处理。",
    highlights: ["服务器 / 域名", "HTTPS / 反代", "VPN / 堡垒机", "云算力 / 数据库"],
    primaryActionLabel: "开始部署排查",
    primaryActionTo: "/note?service=deployment-config",
    secondaryActionLabel: "先看常见问题",
    secondaryActionTo: "/services/deployment-config#detail-faq",
    asideLabel: "先把环境跑稳",
    asideQuote: "能上线只是开始，能稳定跑、能查错、能维护，才算真的配好。",
    asideDescription:
      "我们会把服务器、域名、证书、数据库、网络、安全、日志和备份一起看，不只帮你敲几条命令。",
    heroPoints: [
      { title: "服务器 / 域名", description: "购买、解析、证书、Nginx 和上线流程一起看" },
      { title: "HTTPS / 反代", description: "反向代理、网关、CORS 和访问路径都能配" },
      { title: "VPN / 堡垒机", description: "远程访问、内网互联和安全管理可以一起做" }
    ],
    capabilitiesTitle: "部署配置里，我们通常会处理这些事",
    capabilitiesLead: "从上线、网络到安全和备份，尽量都一起考虑。",
    capabilities: [
      {
        title: "网站与应用部署",
        description: "前端、后端、API、静态站和全栈项目都可以按生产方式上线。",
        icon: "▦",
        tone: "green"
      },
      {
        title: "服务器购买与管理",
        description: "云服务器选型、初始化、SSH、权限、防火墙和基础安全加固都能看。",
        icon: "◫",
        tone: "blue"
      },
      {
        title: "域名申请与 DNS",
        description: "域名注册、解析、子域名、SSL 证书和绑定配置可以一起处理。",
        icon: "◎",
        tone: "purple"
      },
      {
        title: "VPN 与远程访问",
        description: "合规场景下的远程连接、设备互联和访问控制方案可以协助配置。",
        icon: "⇄",
        tone: "orange"
      },
      {
        title: "母子网 / 内网 / 堡垒机",
        description: "VPC、子网、路由、安全组、跳板机和内网访问方案可以一起看。",
        icon: "⌁",
        tone: "yellow"
      },
      {
        title: "数据库与存储部署",
        description: "PostgreSQL、MySQL、Redis、对象存储、备份和恢复都能一起配。",
        icon: "⬢",
        tone: "green"
      },
      {
        title: "云算力与 AI 环境",
        description: "GPU 云服务器、Python、CUDA、PyTorch、Jupyter 和远程开发环境都可以配。",
        icon: "AI",
        tone: "lime"
      },
      {
        title: "反向代理 / 网关 / 中转",
        description: "Nginx、Caddy、HTTPS、负载均衡、路径转发和 CORS 问题都能排查。",
        icon: "▧",
        tone: "blue"
      },
      {
        title: "运维排查与安全加固",
        description: "启动失败、端口冲突、日志定位、备份恢复和基础安全加固都可以处理。",
        icon: "⚙",
        tone: "neutral"
      }
    ],
    panelsTitle: "上线前，最好先把这三件事确认一下",
    panelsLead: "现状、目标和限制先理顺，部署才不会来回返工。",
    panels: [
      {
        eyebrow: "你需要准备",
        title: "把项目和环境信息先发来",
        items: ["项目代码、技术栈和启动方式", "服务器、云厂商、系统版本和登录方式", "域名、数据库、证书、对象存储等现有资源", "报错截图、日志、终端输出和当前配置"]
      },
      {
        eyebrow: "最终能拿到",
        title: "尽量交付成能稳定运行的环境",
        items: ["可访问的网站、后台、API 或应用服务", "已配置好的服务器、数据库、域名和 HTTPS", "VPN、远程访问、堡垒机或内网方案", "部署脚本、运维文档和排查清单"]
      },
      {
        eyebrow: "边界说明",
        title: "有些问题需要先明确权限和安全边界",
        items: ["账号权限和费用由客户确认", "不默认长期托管和持续代运维", "涉及敏感凭证时只做临时授权并及时更换", "合规场景下的 VPN / 远程访问才会继续往下配"]
      }
    ],
    processTitle: "部署配置通常这样推进",
    processLead: "先把现状和目标讲清楚，再决定配置顺序。",
    process: [
      { title: "说明现状", description: "告诉我们你现在有什么、卡在哪里、想达到什么效果。" },
      { title: "选方案", description: "先定服务器、网络、数据库、证书和访问方式。" },
      { title: "上线排查", description: "把服务跑起来，顺手排查日志、端口和代理问题。" },
      { title: "留文档", description: "把关键配置、账号和排查方式整理给你。" }
    ],
    faqTitle: "部署配置常见问题",
    faqLead: "上线和运维里最常被问到的事。",
    faq: [
      {
        question: "能不能只帮我排查服务器问题？",
        answer: "可以，服务起不来、端口不通、数据库连不上、证书报错这些都能先看。"
      },
      {
        question: "域名和 HTTPS 也可以一起配吗？",
        answer: "可以，域名注册、DNS、证书和反向代理通常本来就要一起处理。"
      },
      {
        question: "VPN、堡垒机和内网互联有什么区别？",
        answer: "它们解决的是不同层次的访问问题，我们会先按你的场景选合适的方案。"
      }
    ],
    ctaTitle: "把服务器、域名或报错截图发来，酷里帮你部署排查",
    ctaLead: "你只要把现状发来，我们来帮你把环境梳理清楚。",
    ctaActionLabel: "开始部署排查",
    seoDescription:
      "酷里可以协助服务器部署、网站上线、域名注册、DNS、HTTPS、VPN、堡垒机、数据库、云算力、反向代理和运维排查。"
  }
};

