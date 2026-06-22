/* ============================================
   gallery.js — 产品分类筛选 + 详情弹窗
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const filterBtns = document.querySelectorAll('.pf-btn');
  const productCards = document.querySelectorAll('.product-card');
  const modalOverlay = document.getElementById('productModal');
  const modalBox = document.getElementById('productModalBox');
  const modalClose = document.getElementById('modalClose');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const mtabBtns = document.querySelectorAll('.mtab-btn');

  if (!filterBtns.length) return;

  let currentFilter = 'all';

  // ---- 分类筛选 ----
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      currentFilter = filter;

      // 更新按钮状态
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 卡片过滤动画
      productCards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.classList.remove('filtered-out');
          gsap.fromTo(card,
            { scale: 0.92, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }
          );
        } else {
          card.classList.add('filtered-out');
        }
      });
    });
  });

  // ---- 产品详情弹窗 ----
  function openModal(card) {
    const name = card.querySelector('.product-name').textContent;
    const imgStyle = card.querySelector('.product-img').style.background;

    modalTitle.textContent = name;
    modalImg.style.background = imgStyle;

    modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // 重置 tab 到第一个
    switchTab('params');
  }

  function closeModal() {
    modalOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  // 点击卡片打开弹窗
  productCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // 避免在已过滤的卡片上触发
      if (card.classList.contains('filtered-out')) return;
      openModal(card);
    });
  });

  // 关闭按钮
  modalClose.addEventListener('click', closeModal);

  // 点击遮罩关闭
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // ESC 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ---- Tab 切换 ----
  function switchTab(tabId) {
    mtabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(tc => {
      tc.classList.add('hidden');
    });
    const target = document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
    if (target) target.classList.remove('hidden');
  }

  mtabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

});
