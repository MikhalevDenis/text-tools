(function () {
  const leftEl = document.getElementById('compare-left');
  const rightEl = document.getElementById('compare-right');
  const runBtn = document.getElementById('compare-run');
  const clearBtn = document.getElementById('compare-clear');
  const sampleBtn = document.getElementById('compare-sample');
  const resultEl = document.getElementById('compare-result');

  if (!leftEl || !rightEl || !runBtn || !resultEl) return;

  function getMode() {
    const checked = document.querySelector('input[name="compare-mode"]:checked');
    return checked ? checked.value : 'word';
  }

  // Простейший diff по массивам (LCS-основанный, но упрощённый)
  function diffArrays(a, b) {
    const m = a.length;
    const n = b.length;

    // Матрица LCS
    const dp = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }

    const result = [];
    let i = 0,
      j = 0;
    while (i < m && j < n) {
      if (a[i] === b[j]) {
        result.push({ type: 'equal', value: a[i] });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        result.push({ type: 'removed', value: a[i] });
        i++;
      } else {
        result.push({ type: 'added', value: b[j] });
        j++;
      }
    }

    while (i < m) {
      result.push({ type: 'removed', value: a[i] });
      i++;
    }
    while (j < n) {
      result.push({ type: 'added', value: b[j] });
      j++;
    }

    return result;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderDiffWordMode(leftText, rightText) {
    const leftWords = leftText.trim().length
      ? leftText.split(/\s+/)
      : [];
    const rightWords = rightText.trim().length
      ? rightText.split(/\s+/)
      : [];

    // Если массивы совпадают полностью — тексты идентичны
    if (
      leftWords.length === rightWords.length &&
      leftWords.every((w, i) => w === rightWords[i])
    ) {
      resultEl.innerHTML =
        '<p class="small-text">Тексты не отличаются: содержимое полностью совпадает.</p>';
      return;
    }

    const diff = diffArrays(leftWords, rightWords);

    if (!diff.length) {
      resultEl.innerHTML =
        '<p class="small-text">Тексты не отличаются: содержимое полностью совпадает.</p>';
      return;
    }

    const parts = diff.map(part => {
      const word = escapeHtml(part.value);
      if (part.type === 'equal') {
        return word;
      }
      if (part.type === 'added') {
        return `<span class="diff-added">${word}</span>`;
      }
      if (part.type === 'removed') {
        return `<span class="diff-removed">${word}</span>`;
      }
      return word;
    });

    resultEl.innerHTML = `<p>${parts.join(' ')}</p>`;
  }

  function renderDiffLineMode(leftText, rightText) {
    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');

    // Полное совпадение построчно
    if (
      leftLines.length === rightLines.length &&
      leftLines.every((line, i) => line === rightLines[i])
    ) {
      resultEl.innerHTML =
        '<p class="small-text">Тексты не отличаются: строки полностью совпадают.</p>';
      return;
    }

    const diff = diffArrays(leftLines, rightLines);

    if (!diff.length) {
      resultEl.innerHTML =
        '<p class="small-text">Тексты не отличаются: строки полностью совпадают.</p>';
      return;
    }

    const linesHtml = diff
      .map(part => {
        const line = escapeHtml(part.value);
        if (part.type === 'equal') {
          return `<div>${line}</div>`;
        }
        if (part.type === 'added') {
          return `<div class="diff-added">+ ${line}</div>`;
        }
        if (part.type === 'removed') {
          return `<div class="diff-removed">− ${line}</div>`;
        }
        return `<div>${line}</div>`;
      })
      .join('');

    resultEl.innerHTML = linesHtml;
  }

  function handleCompare() {
    const leftText = leftEl.value || '';
    const rightText = rightEl.value || '';
    const mode = getMode();

    if (!leftText.trim() && !rightText.trim()) {
      resultEl.innerHTML =
        '<p class="small-text">Введите или вставьте два текста для сравнения.</p>';
      return;
    }

    // Полное совпадение исходных строк (без учёта режима)
    if (leftText === rightText) {
      resultEl.innerHTML =
        '<p class="small-text">Тексты не отличаются: содержимое полностью совпадает.</p>';
      return;
    }

    if (mode === 'line') {
      renderDiffLineMode(leftText, rightText);
    } else {
      renderDiffWordMode(leftText, rightText);
    }
  }

  function handleClear() {
    leftEl.value = '';
    rightEl.value = '';
    resultEl.innerHTML =
      '<p class="small-text">Введите два текста слева и нажмите «Сравнить тексты» — отличия появятся здесь.</p>';
    leftEl.focus();
  }

  function handleSample() {
    const original =
      'Осень наступила. Листья на деревьях стали желтыми и красными. ' +
      'Птицы собираются в стаи и готовятся к перелету на юг.';
    const changed =
      'Осень уже наступила. Листья на деревьях стали золотыми и красными. ' +
      'Многие птицы собираются в стаи и готовятся к перелету на юг.';

    leftEl.value = original;
    rightEl.value = changed;
    handleCompare();
  }

  runBtn.addEventListener('click', handleCompare);
  clearBtn.addEventListener('click', handleClear);
  sampleBtn.addEventListener('click', handleSample);

  // Переключение режима сравнения
  document.querySelectorAll('input[name="compare-mode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (leftEl.value.trim() || rightEl.value.trim()) {
        handleCompare();
      }
    });
  });
})();