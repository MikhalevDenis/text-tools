(function () {
  const textarea = document.getElementById('count-words-input');
  const clearBtn = document.getElementById('count-words-clear');
  const sampleBtn = document.getElementById('count-words-sample');

  const statCharsAll = document.getElementById('stat-characters-all');
  const statCharsNoSpace = document.getElementById('stat-characters-no-space');
  const statWords = document.getElementById('stat-words');
  const statSentences = document.getElementById('stat-sentences');
  const statReadingTime = document.getElementById('stat-reading-time');

  if (!textarea) return; // страховка, если скрипт случайно подключится не там

  function getTextStats(text) {
    const trimmed = text.trim();

    // Символы
    const charactersAll = text.length;
    const charactersNoSpace = text.replace(/\s/g, '').length;

    // Слова: убираем лишние пробелы, считаем по разделителям
    let words = 0;
    if (trimmed.length > 0) {
      const wordMatches = trimmed
        .replace(/[\n\r]+/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
      words = wordMatches.length;
    }

    // Предложения: простейший подсчет по . ? !
    let sentences = 0;
    if (trimmed.length > 0) {
      const sentenceMatches = trimmed
        .split(/[.!?]+/g)
        .map(s => s.trim())
        .filter(Boolean);
      sentences = sentenceMatches.length;
    }

    // Время чтения
    const wordsPerMinute = 190; // средняя скорость
    let readingTimeText = '0 сек.';
    if (words > 0) {
      const minutes = words / wordsPerMinute;
      const totalSeconds = Math.round(minutes * 60);
      if (totalSeconds < 60) {
        readingTimeText = `${totalSeconds} сек.`;
      } else {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        readingTimeText =
          s === 0 ? `${m} мин.` : `${m} мин. ${s} сек.`;
      }
    }

    return {
      charactersAll,
      charactersNoSpace,
      words,
      sentences,
      readingTimeText
    };
  }

  function updateStats() {
    const text = textarea.value || '';
    const stats = getTextStats(text);

    statCharsAll.textContent = stats.charactersAll.toString();
    statCharsNoSpace.textContent = stats.charactersNoSpace.toString();
    statWords.textContent = stats.words.toString();
    statSentences.textContent = stats.sentences.toString();
    statReadingTime.textContent = stats.readingTimeText;
  }

  // Очистка текста
  clearBtn.addEventListener('click', () => {
    textarea.value = '';
    updateStats();
    textarea.focus();
  });

  // Пример текста
  sampleBtn.addEventListener('click', () => {
    const sampleText =
      'Этот пример текста показывает, как работает онлайн-счетчик символов и слов. ' +
      'Вставьте сюда свой текст, чтобы узнать его объем, количество предложений и примерное время чтения.';
    textarea.value = sampleText;
    updateStats();
    textarea.focus();
  });

  // Обновляем статистику при вводе
  textarea.addEventListener('input', updateStats);

  // Инициализация
  updateStats();
})();
