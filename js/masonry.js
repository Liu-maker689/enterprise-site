/* ============================================
   masonry.js — 照片墙灯箱
   点击放大 / 左右切换 / 键盘导航
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const gallery = document.getElementById('masonryGallery');
  const items = gallery ? gallery.querySelectorAll('.masonry-item') : [];
  const overlay = document.getElementById('lightboxOverlay');
  const lbImg = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');
  const lbCounter = document.getElementById('lightboxCounter');

  if (!items.length || !overlay) return;

  let currentIndex = 0;

  // ---- 打开灯箱 ----
  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  // ---- 更新图片 & 计数器 ----
  function updateLightbox(animate = true) {
    const item = items[currentIndex];
    if (!item) return;

    const bgStyle = item.style.background;

    if (animate) {
      // 交叉淡入淡出
      gsap.fromTo(lbImg,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }

    lbImg.style.background = bgStyle;
    lbCounter.textContent = `${currentIndex + 1} / ${items.length}`;
  }

  // ---- 切换 ----
  function goPrev() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateLightbox(true);
  }

  function goNext() {
    currentIndex = (currentIndex + 1) % items.length;
    updateLightbox(true);
  }

  // ---- 绑定事件 ----

  // 点击图片打开
  items.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  // 关闭
  lbClose.addEventListener('click', closeLightbox);

  // 遮罩点击关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  // 箭头
  lbPrev.addEventListener('click', goPrev);
  lbNext.addEventListener('click', goNext);

  // 键盘导航
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('show')) return;
    switch (e.key) {
      case 'ArrowLeft': goPrev(); break;
      case 'ArrowRight': goNext(); break;
      case 'Escape': closeLightbox(); break;
    }
  });

});
