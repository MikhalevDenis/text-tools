(function () {
  const inputEl = document.getElementById('seo-input');
  const runBtn = document.getElementById('seo-run');
  const clearBtn = document.getElementById('seo-clear');
  const sampleBtn = document.getElementById('seo-sample');

  const optStopwords = document.getElementById('seo-option-stopwords');
  const optLowercase = document.getElementById('seo-option-lowercase');

  const totalWordsEl = document.getElementById('seo-total-words');
  const uniqueWordsEl = document.getElementById('seo-unique-words');
  const classicToshEl = document.getElementById('seo-classic-toshnota');
  const academicToshEl = document.getElementById('seo-academic-toshnota');
  const waterEl = document.getElementById('seo-water');

  const avgSentLenEl = document.getElementById('seo-avg-sent-len');
  const avgWordLenEl = document.getElementById('seo-avg-word-len');
  const longSentShareEl = document.getElementById('seo-long-sent-share');

  const topWordsEl = document.getElementById('seo-top-words');
  const topPhrasesEl = document.getElementById('seo-top-phrases');

  if (!inputEl) return;

  // Простейший список русских стоп-слов (можно расширять)
  const STOP_WORDS = new Set([
    'и','в','во','не','что','он','она','оно','они','как','а','но','или','да',
    'к','ко','от','до','из','за','над','под','при','о','об','обо','про','для',
    'у','по','же','ли','бы','то','есть','нет','на','с','со','так','это',
    'также','тоже','ни','ну','уж','лишь','быть','были','был','будет',
    'там','здесь','этот','эта','эти','того','тех','тот',
    'свой','его','ее','их'
  ]);

  function normalizeText(text) {
    let t = text;

    // Убираем HTML-теги, если случайно остались
    t = t.replace(/<\/?[^>]+>/gi, ' ');

    if (optLowercase.checked) {
      t = t.toLowerCase();
    }
    return t;
  }

  function tokenizeWordsAll(raw) {
    // Все слова, без исключения стоп-слов
    return raw
      .replace(/[0-9]+/g, ' ')
      .replace(/[\u2013\u2014—]/g, ' ')
      .replace(/[.,!?;:"()«»\[\]{}…]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  function tokenizeWordsContent(text) {
    const tokens = tokenizeWordsAll(text);
    if (!optStopwords.checked) return tokens;
    return tokens.filter(w => !STOP_WORDS.has(w));
  }

  function tokenizeSentences(raw) {
    const text = raw.replace(/\s+/g, ' ').trim();
    if (!text) return [];
    return text
      .split(/[.!?]+/g)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function buildFrequencyMap(tokens) {
    const map = new Map();
    tokens.forEach(t => {
      map.set(t, (map.get(t) || 0) + 1);
    });
    return map;
  }

  function buildPhrases(tokens, n) {
    const phrases = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      phrases.push(tokens.slice(i, i + n).join(' '));
    }
    return phrases;
  }

  // ИСХОДНЫЕ ФОРМУЛЫ ЗАСПАМЛЕННОСТИ

  function calcClassicToshnota(freqMap, totalWords) {
    if (totalWords === 0 || freqMap.size === 0) return 0;
    let maxFreq = 0;
    freqMap.forEach(count => {
      if (count > maxFreq) maxFreq = count;
    });
    const t = Math.sqrt(maxFreq);
    return (t / totalWords) * 100;
  }

  function calcAcademicToshnota(freqMap, totalWords) {
    if (totalWords === 0) return 0;
    let sumSquares = 0;
    freqMap.forEach(count => {
      sumSquares += count * count;
    });
    const ratio = Math.sqrt(sumSquares) / totalWords;
    return ratio * 100;
  }

  function calcWater(rawText, contentWordsCount) {
    const rawTokens = tokenizeWordsAll(rawText);
    if (rawTokens.length === 0) return 0;
    const waterWords = rawTokens.length - contentWordsCount;
    const waterPercent = (waterWords / rawTokens.length) * 100;
    return waterPercent;
  }

  // Читабельность по-русски

  function calcReadabilitySimple(rawText) {
    const sentences = tokenizeSentences(rawText);
    const wordsAll = tokenizeWordsAll(rawText);

    const totalSentences = sentences.length;
    const totalWords = wordsAll.length;

    if (totalWords === 0 || totalSentences === 0) {
      return {
        avgSentLen: 0,
        avgWordLen: 0,
        longSentShare: 0
      };
    }

    // Средняя длина предложения (слов на предложение)
    const avgSentLen = totalWords / totalSentences;

    // Средняя длина слова (букв)
    const totalLetters = wordsAll.reduce(
      (sum, w) => sum + w.replace(/[^a-zа-яё]/gi, '').length,
      0
    );
    const avgWordLen = totalLetters / totalWords || 0;

    // Доля длинных предложений (>20 слов)
    const LONG_SENT_THRESHOLD = 20;
    let longCount = 0;
    sentences.forEach(sentence => {
      const words = tokenizeWordsAll(sentence);
      if (words.length > LONG_SENT_THRESHOLD) longCount++;
    });
    const longSentShare =
      totalSentences > 0 ? (longCount / totalSentences) * 100 : 0;

    return {
      avgSentLen,
      avgWordLen,
      longSentShare
    };
  }

  function renderTableFromMap(map, totalWords, limit = 30) {
    const entries = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    if (entries.length === 0) {
      return '<p class="small-text">Недостаточно данных для анализа. Введите больше текста.</p>';
    }

    const rows = entries
      .map(([token, count], index) => {
        const percent = totalWords ? (count / totalWords) * 100 : 0;
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${token}</td>
            <td>${count}</td>
            <td>${percent.toFixed(2)}%</td>
          </tr>
        `;
      })
      .join('');

    return `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Слово / фраза</th>
            <th>Повторений</th>
            <th>Доля в тексте</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  function runAnalysis() {
    const rawText = inputEl.value || '';

    if (!rawText.trim()) {
      totalWordsEl.textContent = '0';
      uniqueWordsEl.textContent = '0';
      classicToshEl.textContent = '0%';
      academicToshEl.textContent = '0%';
      waterEl.textContent = '0%';
      avgSentLenEl.textContent = '0';
      avgWordLenEl.textContent = '0';
      longSentShareEl.textContent = '0%';
      topWordsEl.innerHTML =
        '<p class="small-text">Введите текст, чтобы увидеть частотность слов.</p>';
      topPhrasesEl.innerHTML =
        '<p class="small-text">Введите текст, чтобы увидеть частотность фраз.</p>';
      return;
    }

    const normalized = normalizeText(rawText);

    // Все слова — для общего количества
    const tokensAll = tokenizeWordsAll(normalized);
    const totalWordsAll = tokensAll.length;

    // Содержательные слова — для частот и воды
    const tokensContent = tokenizeWordsContent(normalized);
    const totalWordsContent = tokensContent.length;

    const freqMap = buildFrequencyMap(tokensContent);
    const uniqueWords = freqMap.size;

    const classicT = calcClassicToshnota(freqMap, totalWordsContent || 1);
    const academicT = calcAcademicToshnota(freqMap, totalWordsContent || 1);
    const water = calcWater(rawText, totalWordsContent);

    const readability = calcReadabilitySimple(rawText);

    totalWordsEl.textContent = totalWordsAll.toString();
    uniqueWordsEl.textContent = uniqueWords.toString();
    classicToshEl.textContent = classicT.toFixed(2) + '%';
    academicToshEl.textContent = academicT.toFixed(2) + '%';
    waterEl.textContent = water.toFixed(2) + '%';

    avgSentLenEl.textContent = readability.avgSentLen.toFixed(2);
    avgWordLenEl.textContent = readability.avgWordLen.toFixed(2);
    longSentShareEl.textContent = readability.longSentShare.toFixed(2) + '%';

    // Топ слов
    topWordsEl.innerHTML = renderTableFromMap(freqMap, totalWordsContent);

    // Топ фраз (2–3 слова)
    const phrases2 = buildPhrases(tokensContent, 2);
    const phrases3 = buildPhrases(tokensContent, 3);
    const phraseTokens = phrases2.concat(phrases3);
    const phraseMap = buildFrequencyMap(phraseTokens);

    topPhrasesEl.innerHTML = renderTableFromMap(phraseMap, phraseTokens.length);
  }

  function handleClear() {
    inputEl.value = '';
    runAnalysis();
    inputEl.focus();
  }

  function handleSample() {
    const sample =
      'SEO-анализ текста помогает понять, насколько естественно в нем используются ключевые слова. ' +
      'Хороший SEO-текст остается читабельным для людей и одновременно понятным для поисковых систем. ' +
      'Он не должен быть перенасыщен одинаковыми фразами и лишними словами. ' +
      'Используйте SEO-анализ онлайн, чтобы проверить частоту слов, уровень заспамленности и количество «воды» ' +
      'в тексте перед публикацией на сайте или в блоге.';
    inputEl.value = sample;
    runAnalysis();
    inputEl.focus();
  }

  runBtn.addEventListener('click', runAnalysis);
  clearBtn.addEventListener('click', handleClear);
  sampleBtn.addEventListener('click', handleSample);

  optStopwords.addEventListener('change', () => {
    if (inputEl.value.trim()) runAnalysis();
  });
  optLowercase.addEventListener('change', () => {
    if (inputEl.value.trim()) runAnalysis();
  });
})();
