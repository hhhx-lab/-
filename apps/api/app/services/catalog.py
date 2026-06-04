import json


def _service(
    slug: str,
    title: str,
    tag: str,
    summary: str,
    audience: list[str],
    common_needs: list[str],
    deliverables: list[str],
    required_materials: list[str],
    risks: list[str],
) -> dict[str, str]:
    details = {
        "slug": slug,
        "title": title,
        "tag": tag,
        "summary": summary,
        "audience": audience,
        "commonNeeds": common_needs,
        "deliverables": deliverables,
        "requiredMaterials": required_materials,
        "priceRange": "先免费判断，确认可做后报价",
        "timeline": "小问题当天，复杂需求按阶段估",
        "risks": risks,
        "cases": [{"title": common_needs[0], "description": f"酷里会先判断「{common_needs[0]}」的材料、风险和交付边界。"}],
        "faq": [
            {"question": "可以先问问吗？", "answer": "可以。先写小纸条，酷里会先判断是否适合做，不会一上来就收费。"},
            {"question": "需要准备什么？", "answer": "最好提供截图、源文件、目标效果、截止时间和预算区间。"},
        ],
    }
    body = "\n".join(
        [
            f"{title}：{summary}",
            "适合人群：" + "、".join(audience),
            "常见需求：" + "、".join(common_needs),
            "交付物：" + "、".join(deliverables),
            "需要材料：" + "、".join(required_materials),
            f"价格/周期：{details['priceRange']}；{details['timeline']}",
            "风险边界：" + "、".join(risks),
            "FAQ：" + "；".join(f"{item['question']}：{item['answer']}" for item in details["faq"]),
        ]
    )
    return {
        "slug": slug,
        "title": title,
        "tag": tag,
        "summary": summary,
        "json": json.dumps(details, ensure_ascii=False),
        "knowledge_body": body,
        "tags": json.dumps([tag, slug], ensure_ascii=False),
    }


SERVICE_CATALOG = [
    _service(
        "ai-tools",
        "AI 工具与海外服务配置",
        "AI 工具",
        "帮你理顺 ChatGPT、Gemini、Claude、Grok、Telegram、Claude Code、Cursor、Codex、Antigravity、API 和中转配置的使用路径。",
        ["想用海外 AI 工具但卡在账号或支付的人", "需要 API Key / 中转配置的人"],
        [
            "账号注册与订阅路径判断",
            "API Key / SDK / 中转站接入",
            "Claude Code / Cursor / Codex / Antigravity 配置",
            "模型选择和费用路径比较"
        ],
        ["可执行配置步骤", "最小可运行示例", "使用说明和常见问题", "账号与环境边界说明"],
        ["所在地区和付款方式", "报错截图", "目标平台或模型", "预算和用途", "现有账号或工具状态"],
        ["第三方平台风控可能变化", "不承诺绕过平台审核", "不接盗号、破解、批量滥用"],
    ),
    _service(
        "document-processing",
        "万能文档处理",
        "文档处理",
        "处理 PPT、Word、论文、PDF、扫描件、图片转文字、格式修复、排版规范和文档转换。",
        ["急着交材料但格式乱的人", "需要图片或扫描件转 Word 的人"],
        ["PPT 制作与优化", "Word/PDF/Excel 格式修复", "论文格式规范", "OCR / 扫描件整理"],
        ["处理后的文档文件", "转换前后说明", "修改建议和边界提示"],
        ["原始文件", "目标格式或语言", "截止时间", "样例或格式要求", "学校或公司模板"],
        ["扫描件和复杂公式可能无法完美还原", "低质量源文件会影响效果"],
    ),
    _service(
        "tool-development",
        "小工具开发与全栈代做",
        "小工具开发",
        "把一句想法做成能跑的网页、小程序、脚本、后台、数据库或 AI Agent。",
        ["需要 demo 或成品的人", "想把重复工作自动化的人"],
        ["网页与后台", "小程序与轻应用", "爬虫与脚本", "AI Agent 与内部工具"],
        ["可运行源码或静态页面", "本地运行说明", "核心截图或演示链接", "部署建议"],
        ["核心功能", "参考图或草稿", "数据样例", "截止时间和交付格式", "是否需要数据库或后台"],
        ["第一版优先可演示", "部署上线和长期维护需另拆范围"],
    ),
    _service(
        "deployment-config",
        "部署配置与服务器运维",
        "部署配置",
        "处理服务器、域名、数据库、环境变量、VPN、堡垒机、云算力、代理网络和远程排查。",
        ["上线前环境卡住的人", "本地能跑但线上挂掉的人"],
        ["服务器部署", "域名与证书", "数据库和环境变量", "反向代理与构建失败排查"],
        ["部署结果或排查结论", "关键配置记录", "回滚/重启建议", "安全和备份建议"],
        ["服务器或平台信息", "项目源码", "域名/数据库信息", "错误日志截图", "访问权限说明"],
        ["账号权限和费用由客户确认", "不默认长期托管", "敏感凭证需临时授权并及时更换"],
    ),
    _service(
        "api-token",
        "API Key / token",
        "API",
        "围绕 OpenAI、Claude、模型中转站、低价 token 和 SDK 调用做配置咨询。",
        ["有 key 但不会接入的人", "想比较模型渠道的人"],
        ["API Key 配置", "中转站接入", "SDK 最小示例", "调用报错排查"],
        ["可运行最小调用示例", "配置路径说明", "渠道风险提示"],
        ["目标模型或平台", "现有 key 或渠道", "报错日志", "预算和稳定性要求"],
        ["渠道稳定性不由酷里保证", "费用和合规由客户确认", "不接滥用平台的需求"],
    ),
    _service(
        "not-sure",
        "不知道怎么分",
        "先聊聊",
        "说不清也可以，直接截图、描述卡住的地方，酷里会帮你继续拆问题。",
        ["不知道需求属于哪类的人", "只有截图或一句想法的人"],
        ["需求判断", "范围拆解", "初步报价", "下一步建议"],
        ["问题归类", "可行路径", "材料清单", "是否进入正式订单的建议"],
        ["截图", "想达到的效果", "截止时间", "预算区间", "相关文件或报错"],
        ["描述越模糊越需要追问", "无法判断风险时不会直接开工", "违法违规需求不会接"],
    ),
]


def catalog_item(slug: str) -> dict[str, object] | None:
    for item in SERVICE_CATALOG:
        if item["slug"] == slug:
            return json.loads(item["json"])
    return None
