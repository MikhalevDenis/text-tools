(function () {
  const inputEl = document.getElementById('cleanup-input');
  const outputEl = document.getElementById('cleanup-output');

  const runBtn = document.getElementById('cleanup-run');
  const clearBtn = document.getElementById('cleanup-clear');
  const sampleBtn = document.getElementById('cleanup-sample');
  const copyBtn = document.getElementById('cleanup-copy');

  const optHtml = document.getElementById('cleanup-option-html');
  const optSpaces = document.getElementById('cleanup-option-spaces');
  const optEmptyLines = document.getElementById('cleanup-option-empty-lines');

  if (!inputEl || !outputEl) return;

function cleanupText(text) {
  let result = text;

  // 1. Нормализуем переводы строк (Windows/Mac/Linux)
  result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Удаляем HTML-теги (если включено)
  if (optHtml.checked) {
    // удаляем реальные теги вида <...>
    result = result.replace(/<\/?[^>]+>/gi, '');
  }

  // 2.1. Декодируем простые HTML-сущности в текст
  // &lt;HTML&gt; -> <HTML>, &amp; -> &, &quot; -> ", &apos; -> '
  result = result
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'");

  // После декодирования ещё раз убираем возможные «сырые» теги
  if (optHtml.checked) {
    result = result.replace(/<\/?[^>]+>/gi, '');
  }

  // 2.2. Удаляем упоминания HTML рядом со словами "тег", "разметка", "код" и т.п.
  if (optHtml.checked) {
    // Примеры: "HTML теги", "HTML-разметка", "html тегов", "код HTML"
    result = result
      // HTML + тег/теги/тегов...
      .replace(/\bhtml[-\s]*(тег[а-я]*|разметк[а-я]*|код[а-я]*)\b/gi, '$1')
      // "теги HTML", "разметка HTML", "код HTML"
      .replace(/\b(тег[а-я]*|теги|тегов|разметк[а-я]*|код[а-я]*)\s+html\b/gi, '$1');
  }

  // 3. Приводим к списку строк
  let lines = result.split('\n');

  // Обрезаем хвостовые пробелы
  lines = lines.map(line => line.replace(/\s+$/g, ''));

  // 4. Собираем абзацы
  if (optEmptyLines.checked) {
    const paragraphs = [];
    let current = '';

    function pushCurrent() {
      if (current.trim().length > 0) {
        paragraphs.push(current.trim());
      }
      current = '';
    }

    lines.forEach((rawLine, index) => {
      const line = rawLine.trim();
      const prevLine = index > 0 ? lines[index - 1].trim() : '';

      // Пустая строка — явная граница абзаца
      if (line.length === 0) {
        pushCurrent();
        return;
      }

      const startsWithIndent = /^\s/.test(rawLine); // был начальный пробел
      const prevEndsWithPunctuation = /[.!?…»'"]$/.test(prevLine);

      const shouldStartNewParagraph =
        current.trim().length === 0
          ? false
          : (startsWithIndent || (prevEndsWithPunctuation && /^[А-ЯA-ZЁ]/.test(line)));

      if (shouldStartNewParagraph) {
        pushCurrent();
        current = line;
      } else {
        if (current.length === 0) {
          current = line;
        } else {
          current += ' ' + line;
        }
      }
    });

    pushCurrent();

    // Собираем текст обратно: абзацы разделены пустой строкой
    result = paragraphs.join('\n\n');
  } else {
    // Если НЕ удаляем пустые строки — просто подчистим края строк
    result = lines
      .map(line => line.replace(/^\s+|\s+$/g, ''))
      .join('\n');
  }

  // 5. Удаление лишних пробелов (если включено)
  if (optSpaces.checked) {
    // несколько пробелов/табов → один пробел
    result = result.replace(/[ \t]+/g, ' ');
    // убираем пробелы в начале и в конце всего текста
    result = result.trim();
  }

  return result;
}

  function handleRun() {
    const text = inputEl.value || '';
    const cleaned = cleanupText(text);
    outputEl.value = cleaned;
  }

  function handleClear() {
    inputEl.value = '';
    outputEl.value = '';
    inputEl.focus();
  }

  function handleSample() {
    const sample =
      '<p>Это <strong>пример текста</strong>, скопированный из редактора.  ' +
      'В нём могут быть &lt;HTML&gt; теги,   лишние   пробелы   и пустые строки.</p>\n\n' +
      '<div>Используйте онлайн-очистку текста, чтобы удалить форматирование перед публикацией.</div>';
    inputEl.value = sample;
    handleRun();
    inputEl.focus();
  }

  function handleCopy() {
    const text = outputEl.value || '';
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .catch(() => {
        // на случай, если clipboard API недоступно
        outputEl.select();
        document.execCommand('copy');
      });
  }

  // События
  runBtn.addEventListener('click', handleRun);
  clearBtn.addEventListener('click', handleClear);
  sampleBtn.addEventListener('click', handleSample);
  copyBtn.addEventListener('click', handleCopy);

  // При изменении опций сразу перерасчёт, если есть текст
  [optHtml, optSpaces, optEmptyLines].forEach(el => {
    el.addEventListener('change', () => {
      if (inputEl.value.trim().length > 0) {
        handleRun();
      }
    });
  });
})();
