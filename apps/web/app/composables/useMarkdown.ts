function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value: string) {
  const ascii = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return ascii || `section-${Math.abs(hashCode(value))}`;
}

function hashCode(value: string) {
  let hash = 0;
  for (const char of value) hash = (hash << 5) - hash + char.charCodeAt(0);
  return hash % 10000;
}

function inlineMarkdown(value: string) {
  let html = escapeHtml(value);
  html = html.replace(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return html;
}

export function useMarkdown() {
  function render(markdown: string) {
    const lines = markdown.split("\n");
    const html: string[] = [];
    let listType: "ul" | "ol" | null = null;
    let inCode = false;
    let codeLang = "";
    let codeLines: string[] = [];

    function closeList() {
      if (listType) {
        html.push(`</${listType}>`);
        listType = null;
      }
    }

    function flushCode() {
      html.push(`<pre><code data-lang="${escapeHtml(codeLang)}">${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      codeLang = "";
      codeLines = [];
    }

    function renderTable(startIndex: number) {
      const tableLines: string[] = [];
      let index = startIndex;
      while (index < lines.length && lines[index]?.includes("|")) {
        const raw = lines[index]?.trim() ?? "";
        if (!raw) break;
        tableLines.push(raw);
        index += 1;
      }
      if (tableLines.length < 2 || !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(tableLines[1] ?? "")) return null;
      const rows = tableLines
        .filter((_, rowIndex) => rowIndex !== 1)
        .map((line) => line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
      const [head, ...body] = rows;
      const headHtml = `<thead><tr>${(head ?? []).map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead>`;
      const bodyHtml = `<tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
      return { html: `<table>${headHtml}${bodyHtml}</table>`, nextIndex: index };
    }

    for (let index = 0; index < lines.length; index += 1) {
      const rawLine = lines[index] ?? "";
      const line = rawLine.trim();

      if (line.startsWith("```")) {
        closeList();
        if (inCode) {
          flushCode();
          inCode = false;
        } else {
          inCode = true;
          codeLang = line.slice(3).trim();
        }
        continue;
      }

      if (inCode) {
        codeLines.push(rawLine);
        continue;
      }

      if (!line) {
        closeList();
        continue;
      }

      const heading = line.match(/^(#{1,4})\s+(.+?)(?:\s+\{#([a-z0-9-]+)\})?$/);
      if (heading) {
        closeList();
        const level = Math.min(4, heading[1]?.length ?? 2);
        const title = heading[2] ?? "";
        const id = heading[3] ?? slugify(title);
        html.push(`<h${level} id="${escapeHtml(id)}">${inlineMarkdown(title)}</h${level}>`);
        continue;
      }

      const table = renderTable(index);
      if (table) {
        closeList();
        html.push(table.html);
        index = table.nextIndex - 1;
        continue;
      }

      if (line.startsWith("> ")) {
        closeList();
        html.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`);
        continue;
      }

      const unordered = line.match(/^[-*]\s+(.+)$/);
      if (unordered) {
        if (listType !== "ul") {
          closeList();
          listType = "ul";
          html.push("<ul>");
        }
        html.push(`<li>${inlineMarkdown(unordered[1] ?? "")}</li>`);
        continue;
      }

      const ordered = line.match(/^\d+\.\s+(.+)$/);
      if (ordered) {
        if (listType !== "ol") {
          closeList();
          listType = "ol";
          html.push("<ol>");
        }
        html.push(`<li>${inlineMarkdown(ordered[1] ?? "")}</li>`);
        continue;
      }

      closeList();
      html.push(`<p>${inlineMarkdown(line)}</p>`);
    }

    closeList();
    if (inCode) flushCode();
    return html.join("");
  }

  return { render };
}
