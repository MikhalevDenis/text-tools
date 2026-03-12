(function () {
  const inputEl = document.getElementById('readability-input');
  const runBtn = document.getElementById('readability-run');
  const clearBtn = document.getElementById('readability-clear');
  const sampleBtn = document.getElementById('readability-sample');

  const sentencesEl = document.getElementById('readability-sentences');
  const wordsEl = document.getElementById('readability-words');
  const avgSentEl = document.getElementById('readability-avg-sent');
  const avgWordEl = document.getElementById('readability-avg-word');
  const longShareEl = document.getElementById('readability-long-share');
  const commentEl = document.getElementById('readability-comment');

  if (!inputEl) return;

  function tokenizeSentences(raw) {
    const text = raw.replace(/\s+/g, ' ').trim();
    if (!text) return [];
    return text
      .split(/[.!?]+/g)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function tokenizeWords(raw) {
    return raw
      .replace(/[0-9]+/g, ' ')
      .replace(/[\u2013\u2014—]/g, ' ')
      .replace(/[.,!?;:"()«»\[\]{}…]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  function calcReadability(rawText) {
    const sentences = tokenizeSentences(rawText);
    const wordsAll = tokenizeWords(rawText);

    const totalSentences = sentences.length;
    const totalWords = wordsAll.length;

    if (totalWords === 0 || totalSentences === 0) {
      return {
        sentences: 0,
        words: 0,
        avgSentLen: 0,
        avgWordLen: 0,
        longSentShare: 0
      };
    }

    const avgSentLen = totalWords / totalSentences;

    const totalLetters = wordsAll.reduce(
      (sum, w) => sum + w.replace(/[^a-zа-яё]/gi, '').length,
      0
    );
    const avgWordLen = totalLetters / totalWords || 0;

    const LONG_SENT_THRESHOLD = 20;
    let longCount = 0;
    sentences.forEach(sentence => {
      const words = tokenizeWords(sentence);
      if (words.length > LONG_SENT_THRESHOLD) longCount++;
    });
    const longSentShare =
      totalSentences > 0 ? (longCount / totalSentences) * 100 : 0;

    return {
      sentences: totalSentences,
      words: totalWords,
      avgSentLen,
      avgWordLen,
      longSentShare
    };
  }

  function buildComment(stats) {
    if (stats.words === 0) {
      return 'Вставьте текст и выполните анализ, чтобы получить общую оценку его читабельности.';
    }

    const parts = [];

    // По длине предложений
    if (stats.avgSentLen <= 15) {
      parts.push('Текст содержит относительно короткие предложения и читается легко.');
    } else if (stats.avgSentLen <= 20) {
      parts.push('Средняя длина предложений близка к комфортному уровню, текст средней сложности.');
    } else {
      parts.push('Средняя длина предложений высокая — текст может восприниматься тяжёлым. Попробуйте разбить длинные фразы на более короткие.');
    }

    // По длине слов
    if (stats.avgWordLen <= 6) {
      parts.push('Средняя длина слова в пределах нормы — язык достаточно понятный.');
    } else if (stats.avgWordLen <= 7) {
      parts.push('В тексте заметно количество длинных слов и терминов, но это допустимо для профессиональной аудитории.');
    } else {
      parts.push('Много длинных слов — текст может казаться перегруженным профессиональной лексикой. Подумайте, что можно упростить.');
    }

    // По доле длинных предложений
    if (stats.longSentShare <= 20) {
      parts.push('Доля очень длинных предложений невысокая — структура текста комфортна для чтения.');
    } else if (stats.longSentShare <= 40) {
      parts.push('Длинных предложений довольно много, читателю может требоваться больше усилий для восприятия.');
    } else {
      parts.push('Высокая доля длинных предложений — текст может быть тяжёлым. Рекомендуется упростить структуру и разбить сложные фразы.');
    }

    return parts.join(' ');
  }

  function runAnalysis() {
    const rawText = inputEl.value || '';

    const stats = calcReadability(rawText);

    sentencesEl.textContent = stats.sentences.toString();
    wordsEl.textContent = stats.words.toString();
    avgSentEl.textContent = stats.avgSentLen.toFixed(2);
    avgWordEl.textContent = stats.avgWordLen.toFixed(2);
    longShareEl.textContent = stats.longSentShare.toFixed(2) + '%';

    commentEl.textContent = buildComment(stats);
  }

  function handleClear() {
    inputEl.value = '';
    runAnalysis();
    inputEl.focus();
  }

  function handleSample() {
    const sample =
      'Хороший текст легко читать. В нём нет слишком длинных предложений и запутанных конструкций. ' +
      'Каждая мысль оформлена в отдельное предложение или абзац. Читатель быстро понимает, о чём идёт речь, ' +
      'и не возвращается к одному и тому же фрагменту несколько раз. Такой текст помогает донести смысл и ' +
      'поддерживает внимание до конца страницы.';
    inputEl.value = sample;
    runAnalysis();
    inputEl.focus();
  }

  runBtn.addEventListener('click', runAnalysis);
  clearBtn.addEventListener('click', handleClear);
  sampleBtn.addEventListener('click', handleSample);

  // Для удобства: считать автоматически при вводе (можно отключить, если покажется тяжёлым)
  inputEl.addEventListener('input', () => {
    if (inputEl.value.trim()) {
      runAnalysis();
    } else {
      runAnalysis();
    }
  });

  // Инициализация
  runAnalysis();
})();
