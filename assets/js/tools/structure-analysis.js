(function () {
  const inputEl = document.getElementById('structure-input');
  const runBtn = document.getElementById('structure-run');
  const clearBtn = document.getElementById('structure-clear');
  const sampleBtn = document.getElementById('structure-sample');

  const paragraphsEl = document.getElementById('structure-paragraphs');
  const avgParagraphEl = document.getElementById('structure-avg-paragraph');
  const longParagraphsEl = document.getElementById('structure-long-paragraphs');
  const headingsEl = document.getElementById('structure-headings');
  const listsEl = document.getElementById('structure-lists');
  const commentEl = document.getElementById('structure-comment');

  if (!inputEl) return;

  function splitParagraphs(text) {
    // Нормализуем переводы строк
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // делим по двум и более переводам строки — abзацы
    const blocks = normalized
      .split(/\n{2,}/)
      .map(b => b.trim())
      .filter(Boolean);

    if (blocks.length === 0 && normalized.trim().length > 0) {
      // если нет пустых строк — считаем всё одним абзацем
      return [normalized.trim()];
    }

    return blocks;
  }

  function tokenizeWords(raw) {
    return raw
      .replace(/[0-9]+/g, ' ')
      .replace(/[\u2013\u2014—]/g, ' ')
      .replace(/[.,!?;:"()«»\[\]{}…]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  function analyzeStructure(rawText) {
    const text = rawText || '';

    const paragraphs = splitParagraphs(text);
    const paragraphCount = paragraphs.length;

    let totalWordsInParagraphs = 0;
    let longParagraphs = 0;
    const LONG_PARAGRAPH_THRESHOLD = 150;

    paragraphs.forEach(p => {
      const words = tokenizeWords(p);
      const count = words.length;
      totalWordsInParagraphs += count;
      if (count > LONG_PARAGRAPH_THRESHOLD) longParagraphs++;
    });

    const avgParagraphWords =
      paragraphCount > 0 ? totalWordsInParagraphs / paragraphCount : 0;
    const longParagraphShare =
      paragraphCount > 0 ? (longParagraphs / paragraphCount) * 100 : 0;

    // Анализ строк для заголовков и списков
    const lines = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    let headingLike = 0;
    let listLike = 0;

    lines.forEach(line => {
      // Строки, похожие на списки: начинаются с -, •, * или цифры + точка/скобка
      if (/^[-*•]\s+/.test(line) || /^[0-9]+\s*[\.\)]\s+/.test(line)) {
        listLike++;
      }

      // Заголовки: короткие строки ИЛИ строки в верхнем регистре
      const words = tokenizeWords(line);
      const isShort = words.length > 0 && words.length <= 8;
      const isUpper = line === line.toUpperCase() && /[A-ZА-ЯЁ]/.test(line);

      if (isShort || isUpper) {
        headingLike++;
      }
    });

    return {
      paragraphCount,
      avgParagraphWords,
      longParagraphShare,
      headingLike,
      listLike
    };
  }

  function buildComment(stats) {
    if (stats.paragraphCount === 0) {
      return 'Вставьте текст и выполните анализ, чтобы получить рекомендации по его структуре.';
    }

    const parts = [];

    // Абзацы
    if (stats.avgParagraphWords <= 120) {
      parts.push('Средняя длина абзаца в комфортных пределах — текст не выглядит «сплошным полотном».');
    } else if (stats.avgParagraphWords <= 180) {
      parts.push('Абзацы получаются довольно длинными. Возможно, стоит разбить некоторые из них на более короткие фрагменты.');
    } else {
      parts.push('Абзацы очень длинные — текст может быть тяжёлым для восприятия. Рекомендуется разделить большие блоки на несколько абзацев.');
    }

    // Доля длинных абзацев
    if (stats.longParagraphShare <= 20) {
      parts.push('Доля слишком длинных абзацев невысока — структура в целом сбалансирована.');
    } else if (stats.longParagraphShare <= 40) {
      parts.push('Длинных абзацев довольно много, часть читателей может уставать при чтении.');
    } else {
      parts.push('Высокая доля длинных абзацев — текст может восприниматься как «стена текста». Разбейте крупные фрагменты на более мелкие.');
    }

    // Заголовки
    if (stats.headingLike === 0) {
      parts.push('В тексте не обнаружено строк, похожих на заголовки. Подумайте о том, чтобы добавить подзаголовки для логических блоков.');
    } else if (stats.headingLike <= 3) {
      parts.push('Заголовков немного. Возможно, стоит добавить ещё несколько подзаголовков для крупных фрагментов текста.');
    } else {
      parts.push('В тексте достаточно строк, похожих на заголовки — структура хорошо разбита на смысловые блоки.');
    }

    // Списки
    if (stats.listLike === 0) {
      parts.push('Перечисления лучше оформлять в виде списков — так их проще воспринимать и «сканировать» взглядом.');
    } else {
      parts.push('В тексте есть строки, похожие на списки — это улучшает структуру и облегчает восприятие перечислений.');
    }

    return parts.join(' ');
  }

  function runAnalysis() {
    const rawText = inputEl.value || '';

    const stats = analyzeStructure(rawText);

    paragraphsEl.textContent = stats.paragraphCount.toString();
    avgParagraphEl.textContent = stats.avgParagraphWords.toFixed(2);
    longParagraphsEl.textContent = stats.longParagraphShare.toFixed(2) + '%';
    headingsEl.textContent = stats.headingLike.toString();
    listsEl.textContent = stats.listLike.toString();

    commentEl.textContent = buildComment(stats);
  }

  function handleClear() {
    inputEl.value = '';
    runAnalysis();
    inputEl.focus();
  }

  function handleSample() {
    const sample =
      'Заголовок первого уровня\n\n' +
      'Этот текст демонстрирует структуру статьи. Первый абзац вводит читателя в тему и кратко описывает, о чём пойдёт речь дальше. ' +
      'Он не слишком длинный и позволяет быстро понять общий контекст.\n\n' +
      'Подзаголовок раздела\n\n' +
      'Во втором абзаце можно подробнее раскрыть основной тезис. Если информации много, имеет смысл разделить её на несколько абзацев, ' +
      'чтобы текст не превращался в сплошное полотно. Так читателю легче следить за ходом мысли.\n\n' +
      'Список преимуществ:\n' +
      '- текст легче читать;\n' +
      '- информация воспринимается быстрее;\n' +
      '- важные моменты проще заметить.\n\n' +
      'Заключительный абзац подводит итог и повторяет главную мысль. Он может содержать призыв к действию или ссылку на дополнительные материалы.';
    inputEl.value = sample;
    runAnalysis();
    inputEl.focus();
  }

  runBtn.addEventListener('click', runAnalysis);
  clearBtn.addEventListener('click', handleClear);
  sampleBtn.addEventListener('click', handleSample);

  // Можно обновлять структуру по мере ввода
  inputEl.addEventListener('input', () => {
    if (inputEl.value.trim()) {
      runAnalysis();
    } else {
      runAnalysis();
    }
  });

  // Стартовая инициализация
  runAnalysis();
})();
