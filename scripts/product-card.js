(() => {
  const ADDED_TIMEOUT = 2000;

  const priceFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // 349.2 → «349,20 ₽», 1432 → «1 432 ₽»: копейки показываем только если они есть
  function formatPrice(value) {
    const hasKopecks = !Number.isInteger(value);
    return priceFormatter
      .formatToParts(value)
      .map(({ type, value: part }) => (type === 'fraction' && hasKopecks ? part.padEnd(2, '0') : part))
      .join('');
  }

  function initProductCard(card) {
    const form = card.querySelector('[data-product-form]');
    const sku = card.querySelector('[data-product-sku]');
    const price = card.querySelector('[data-product-price]');
    const oldPrice = card.querySelector('[data-product-old-price]');
    const discount = card.querySelector('[data-product-discount]');
    const cartButton = card.querySelector('[data-product-cart]');
    const cartText = card.querySelector('[data-product-cart-text]');
    let addedTimer = null;

    function render(input) {
      const current = Number(input.dataset.price);
      const old = Number(input.dataset.oldPrice);
      const hasDiscount = old > current;

      sku.textContent = input.dataset.sku;
      price.textContent = formatPrice(current);

      oldPrice.hidden = !hasDiscount;
      discount.hidden = !hasDiscount;
      if (hasDiscount) {
        oldPrice.textContent = formatPrice(old);
        discount.textContent = `−${Math.round((1 - current / old) * 100)}%`;
      }
    }

    form.addEventListener('change', (event) => {
      if (event.target.name === 'pack') {
        render(event.target);
      }
    });

    // Реальной корзины нет — показываем, что товар «добавлен»
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      cartButton.classList.add('button--done');
      cartText.textContent = 'Добавлено';

      clearTimeout(addedTimer);
      addedTimer = setTimeout(() => {
        cartButton.classList.remove('button--done');
        cartText.textContent = 'В корзину';
      }, ADDED_TIMEOUT);
    });

    render(form.querySelector('input[name="pack"]:checked'));
  }

  document.querySelectorAll('[data-product-card]').forEach(initProductCard);
})();
