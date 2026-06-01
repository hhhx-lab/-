const orderStatusMap: Record<string, { label: string; tone: string; hint: string }> = {
  submitted: { label: "已提交", tone: "info", hint: "酷里正在判断需求范围和材料是否足够。" },
  clarifying: { label: "待补充", tone: "warn", hint: "还需要你补充材料、截图或验收标准。" },
  quoted: { label: "已报价", tone: "accent", hint: "管理员已给出报价，等待你确认是否继续。" },
  deposit_pending: { label: "待付定金", tone: "warn", hint: "复杂需求需要先确认定金后再开始。" },
  in_progress: { label: "处理中", tone: "accent", hint: "酷里正在处理，过程中可能会继续追问。" },
  review: { label: "待验收", tone: "success", hint: "交付物已提交，请检查结果是否符合约定。" },
  final_payment_pending: { label: "待付尾款", tone: "warn", hint: "验收后需要确认尾款。" },
  completed: { label: "已完成", tone: "muted", hint: "订单已结束，后续新增内容会作为新需求处理。" },
  cancelled: { label: "已取消", tone: "danger", hint: "该订单已取消。" }
};

const intentMap: Record<string, string> = {
  consultation: "先咨询",
  quote_request: "希望报价",
  ready_to_start: "准备开工"
};

const priorityMap: Record<string, string> = {
  low: "低优先级",
  normal: "正常",
  high: "高优先级",
  urgent: "紧急"
};

const paymentKindMap: Record<string, string> = {
  full: "全款",
  deposit: "定金",
  final: "尾款"
};

const paymentStatusMap: Record<string, string> = {
  pending: "待确认",
  received: "已收到",
  cancelled: "已取消"
};

const attachmentStatusMap: Record<string, string> = {
  metadata_only: "已登记",
  pending: "等待解析",
  scanned: "已解析",
  failed: "解析失败",
  skipped: "无需解析"
};

const visibilityMap: Record<string, string> = {
  public: "客户可见",
  internal: "内部备注"
};

export function useDisplayText() {
  function orderStatus(value?: string | null) {
    if (!value) return { label: "未设置", tone: "muted", hint: "状态暂未更新。" };
    return orderStatusMap[value] ?? { label: value.replaceAll("_", " "), tone: "muted", hint: "状态待管理员确认。" };
  }

  function label(map: Record<string, string>, value?: string | null, fallback = "未设置") {
    if (!value) return fallback;
    return map[value] ?? value.replaceAll("_", " ");
  }

  function money(value?: number | null) {
    if (value === null || value === undefined) return "待确认";
    return `¥${new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value)}`;
  }

  function fileSize(bytes?: number | null) {
    if (!bytes) return "大小未知";
    if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function dateTime(value?: string | null) {
    if (!value) return "时间未记录";
    return new Date(value).toLocaleString("zh-CN", { hour12: false });
  }

  function date(value?: string | null) {
    if (!value) return "日期未记录";
    return new Date(value).toLocaleDateString("zh-CN");
  }

  return {
    orderStatus,
    intent: (value?: string | null) => label(intentMap, value, "先咨询"),
    priority: (value?: string | null) => label(priorityMap, value, "正常"),
    paymentKind: (value?: string | null) => label(paymentKindMap, value, "款项"),
    paymentStatus: (value?: string | null) => label(paymentStatusMap, value, "待确认"),
    attachmentStatus: (value?: string | null) => label(attachmentStatusMap, value, "已登记"),
    visibility: (value?: string | null) => label(visibilityMap, value, "客户可见"),
    money,
    fileSize,
    dateTime,
    date
  };
}
