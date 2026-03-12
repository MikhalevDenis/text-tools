// Общие скрипты для сайта

(function () {
  // Выпадающие меню в шапке (Инструменты)
  const dropdowns = document.querySelectorAll('[data-dropdown]');

  function closeAllDropdowns(except) {
    dropdowns.forEach(dropdown => {
      if (dropdown !== except) {
        dropdown.classList.remove('is-open');
      }
    });
  }

  dropdowns.forEach(dropdown => {
    const toggleBtn = dropdown.querySelector('[data-dropdown-toggle]');
    const menu = dropdown.querySelector('[data-dropdown-menu]');

    if (!toggleBtn || !menu) return;

    // Клик по кнопке "Инструменты"
    toggleBtn.addEventListener('click', event => {
      event.stopPropagation();
      const isOpen = dropdown.classList.contains('is-open');
      if (isOpen) {
        dropdown.classList.remove('is-open');
      } else {
        closeAllDropdowns(dropdown);
        dropdown.classList.add('is-open');
      }
    });

    // Клик внутри меню — не закрываем до выбора пункта
    menu.addEventListener('click', event => {
      // Если клик по ссылке — после перехода меню всё равно закроется при смене страницы
      event.stopPropagation();
    });
  });

  // Клик вне меню — закрыть всё
  document.addEventListener('click', () => {
    closeAllDropdowns();
  });

  // Закрытие по Esc
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
  });
})();
