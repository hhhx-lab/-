<template>
  <main class="handwriting-product">
    <section class="handwriting-hero shell">
      <div class="handwriting-copy">
        <p class="plain-label">子产品 / 文档转手写字体</p>
        <h1>把整理好的文档变成可预览、可导出的手写风格稿</h1>
        <p class="lead">
          适合把作业、讲义、笔记、Markdown、Word 或 PDF 内容转换成更像手写稿的页面。先抽取和整理内容，再选择字体、纸张、行距、墨色和页边距，最后生成 PDF 或 Word 交付稿。
        </p>
        <div class="hero-actions">
          <a class="button" href="/handwriting/">打开手写工作台</a>
          <NuxtLink class="button secondary" to="/note?service=document-processing">需要代处理</NuxtLink>
        </div>
      </div>

      <div class="handwriting-preview" aria-label="文档转手写字体预览">
        <div class="preview-paper">
          <span class="paper-hole" />
          <span class="paper-hole" />
          <span class="paper-hole" />
          <p>概率论作业整理</p>
          <strong>1. 先把题面转成 Markdown</strong>
          <strong>2. 再统一公式、编号和段落</strong>
          <strong>3. 最后生成手写 PDF</strong>
          <div class="paper-formula">E(X) = Σ x p(x)</div>
        </div>
      </div>
    </section>

    <section class="shell section handwriting-flow">
      <div class="section-head">
        <div>
          <p class="plain-label">工作流</p>
          <h2 class="page-title">不是简单换字体，而是从文档到手写稿的一整条链路</h2>
        </div>
      </div>

      <div class="handwriting-steps">
        <article v-for="step in steps" :key="step.title">
          <span>{{ step.index }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </article>
      </div>
    </section>

    <section class="shell section handwriting-grid">
      <article class="handwriting-panel">
        <p class="plain-label">可以处理</p>
        <h2>输入内容</h2>
        <ul>
          <li>直接粘贴文字、Markdown 或题目草稿</li>
          <li>上传 Word、PDF、TXT、RTF 等文档</li>
          <li>保留常见公式、编号、段落和表述结构</li>
          <li>先生成可编辑 Word 草稿，再确认最终效果</li>
        </ul>
      </article>

      <article class="handwriting-panel ink">
        <p class="plain-label">可以调整</p>
        <h2>手写效果</h2>
        <ul>
          <li>选择不同手写字体和字号</li>
          <li>调整纸张、边距、行距、墨色和随机抖动</li>
          <li>支持整页预览，不只看第一页</li>
          <li>导出 PDF 或 Word，方便继续检查和交付</li>
        </ul>
      </article>
    </section>

    <section class="shell handwriting-notice">
      <div>
        <p class="plain-label">当前说明</p>
        <h2>PDF 抽取依赖 MinerU</h2>
      </div>
      <p>
        这个工具的 PDF 识别链路需要 MinerU 服务。服务器第一版会先接入产品入口和工具部署路径，如果 MinerU 暂时不可达，PDF 抽取可能不能使用；后续切到云 MinerU 后再恢复完整能力。粘贴文本、Markdown、Word 草稿和非 PDF 流程仍可以继续作为优先验证方向。
      </p>
    </section>

    <section class="shell handwriting-cta">
      <div>
        <p class="plain-label">开始使用</p>
        <h2>先打开工作台试一份材料</h2>
      </div>
      <a class="button" href="/handwriting/">进入文档转手写字体</a>
    </section>
  </main>
</template>

<script setup lang="ts">
const steps = [
  {
    index: "01",
    title: "放入材料",
    description: "粘贴文本，或上传 PDF、Word、Markdown、TXT、RTF 等文档，让工具先抽取出可处理内容"
  },
  {
    index: "02",
    title: "整理内容",
    description: "把公式、编号、段落和 Markdown 结构先整理到更稳定的状态，必要时生成 Word 草稿检查"
  },
  {
    index: "03",
    title: "调整手写",
    description: "选择字体、纸张、边距、行距、墨色和随机效果，让页面更接近自然手写稿"
  },
  {
    index: "04",
    title: "预览导出",
    description: "先翻看整份预览，再导出 PDF 或 Word，减少只看第一页导致的排版翻车"
  }
];

useKuliSeo({
  title: "文档转手写字体 | 酷里子产品",
  description: "酷里文档转手写字体子产品支持文本、Markdown、Word、PDF 等材料整理为手写风格稿件，可调整字体、纸张、行距、墨色并导出 PDF 或 Word。",
  path: "/products/handwriting"
});
</script>

<style scoped>
.handwriting-product {
  display: grid;
  gap: clamp(18px, 4vw, 42px);
}

.handwriting-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.98fr) minmax(320px, 0.72fr);
  gap: clamp(28px, 6vw, 76px);
  align-items: center;
  min-height: min(640px, calc(100vh - 110px));
  padding: clamp(34px, 6vw, 76px) 0 clamp(22px, 5vw, 54px);
}

.handwriting-copy h1 {
  max-width: 860px;
  margin: 0 0 18px;
  font-family: var(--font-body);
  font-size: clamp(38px, 5.5vw, 74px);
  font-weight: 900;
  line-height: 1.04;
  text-wrap: balance;
}

.handwriting-preview {
  display: grid;
  min-height: 420px;
  place-items: center;
  border: 1px solid rgba(103, 154, 255, 0.34);
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(77, 136, 255, 0.26), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025));
  box-shadow: rgba(77, 136, 255, 0.16) 0 26px 90px;
}

.preview-paper {
  position: relative;
  display: grid;
  width: min(360px, 88%);
  gap: 16px;
  padding: 48px 34px 34px 54px;
  color: #16305d;
  border-radius: 6px 20px 20px 6px;
  background:
    repeating-linear-gradient(#fbfbf6 0 33px, #d4e1ff 34px 35px),
    #fbfbf6;
  box-shadow: rgba(0, 0, 0, 0.28) 0 30px 80px;
  transform: rotate(-2deg);
}

.preview-paper::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 36px;
  width: 2px;
  background: rgba(255, 99, 132, 0.42);
  content: "";
}

.paper-hole {
  position: absolute;
  left: 14px;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #d7d9d2;
  box-shadow: inset rgba(0, 0, 0, 0.22) 0 2px 6px;
}

.paper-hole:nth-child(1) {
  top: 70px;
}

.paper-hole:nth-child(2) {
  top: 170px;
}

.paper-hole:nth-child(3) {
  top: 270px;
}

.preview-paper p {
  margin: 0;
  color: #5771a2;
  font-size: 15px;
  font-weight: 800;
}

.preview-paper strong,
.paper-formula {
  font-family: "Songti SC", "STSong", "Noto Serif CJK SC", serif;
  font-size: clamp(19px, 2vw, 25px);
  font-weight: 700;
  line-height: 1.45;
}

.paper-formula {
  color: #0b63ce;
}

.handwriting-flow,
.handwriting-grid {
  padding-top: clamp(12px, 3vw, 28px);
}

.handwriting-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.handwriting-steps article,
.handwriting-panel,
.handwriting-notice,
.handwriting-cta {
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--surface);
}

.handwriting-steps article {
  display: grid;
  gap: 14px;
  align-content: start;
  padding: clamp(18px, 2.5vw, 26px);
}

.handwriting-steps span {
  color: var(--accent-2);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 900;
}

.handwriting-steps h3,
.handwriting-panel h2,
.handwriting-notice h2,
.handwriting-cta h2 {
  margin: 0;
  font-size: clamp(22px, 2.6vw, 34px);
  line-height: 1.14;
}

.handwriting-steps p,
.handwriting-notice p {
  margin: 0;
  color: var(--muted);
}

.handwriting-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.handwriting-panel {
  padding: clamp(20px, 3vw, 34px);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), transparent 70%),
    var(--surface);
}

.handwriting-panel.ink {
  border-color: rgba(77, 136, 255, 0.34);
}

.handwriting-panel ul {
  display: grid;
  gap: 12px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
  color: var(--muted);
}

.handwriting-panel li {
  padding-left: 18px;
  border-left: 2px solid var(--accent-2);
}

.handwriting-notice,
.handwriting-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(18px, 4vw, 46px);
  padding: clamp(20px, 3vw, 34px);
}

.handwriting-notice p {
  max-width: 760px;
}

@media (max-width: 980px) {
  .handwriting-hero,
  .handwriting-grid {
    grid-template-columns: 1fr;
  }

  .handwriting-steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .handwriting-notice,
  .handwriting-cta {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .handwriting-steps {
    grid-template-columns: 1fr;
  }

  .handwriting-preview {
    min-height: 340px;
  }

  .preview-paper {
    padding-right: 24px;
    padding-left: 48px;
  }

  .handwriting-cta .button,
  .handwriting-copy .button {
    width: 100%;
  }
}
</style>
