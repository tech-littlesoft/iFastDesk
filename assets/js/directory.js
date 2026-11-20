'use strict';

const search = document.querySelector('#directory-query');
const groups = [...document.querySelectorAll('.directory-screen')];
const cards = [...document.querySelectorAll('.directory-card')];
const feedback = document.querySelector('#directory-feedback');

search.closest('.directory-filter').hidden = false;

search.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  let count = 0;

  document.body.classList.toggle('directory-filtering', Boolean(query));
  for (const card of cards) {
    const category = card.querySelector('h3').textContent.toLowerCase();
    const links = [...card.querySelectorAll('a')];
    for (const link of links) {
      link.hidden = !category.includes(query) && !link.textContent.toLowerCase().includes(query);
      if (!link.hidden) count++;
    }
    card.hidden = links.every(link => link.hidden);
  }
  for (const group of groups) {
    group.hidden = group.id !== 'start' && !group.querySelector('.directory-card:not([hidden])');
  }
  feedback.textContent = query ? (count ? `找到 ${count} 个入口` : '没有匹配的网址') : '';
});

document.querySelector('.directory-index').addEventListener('click', event => {
  if (event.target.closest('a') && search.value) {
    search.value = '';
    search.dispatchEvent(new Event('input'));
  }
});
