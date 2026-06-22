/* ============================================
   timeline.js — 时间线横向滚动逻辑
   支持拖拽 / 滚轮 / 吸附 / 年份导航
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const track = document.getElementById('timelineTrack');
  const cards = track.querySelectorAll('.tl-card');
  const navBtns = document.querySelectorAll('.tl-year');
  const progressFill = document.getElementById('tlProgress');
  const arrowLeft = document.getElementById('tlArrowLeft');
  const arrowRight = document.getElementById('tlArrowRight');

  if (!track || !cards.length) return;

  let isDragging = false;
  let startX = 0;
  let scrollLeftStart = 0;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;
  let animFrameId = null;

  // 卡片宽度（含 gap）
  function getCardWidth() {
    if (window.innerWidth < 768) {
      return cards[0].offsetWidth + 24; // 85vw + gap
    } else if (window.innerWidth <= 1023) {
      return 280 + 24;
    }
    return 320 + 24;
  }

  // ---- 更新卡片虚实状态 ----
  function updateCardStates() {
    const trackRect = track.getBoundingClientRect();
    const centerX = trackRect.left + trackRect.width / 2;

    cards.forEach(card => {
      const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < 150) {
        card.classList.add('centered');
      } else {
        card.classList.remove('centered');
      }
    });
  }

  // ---- 更新进度条 & 年份高亮 ----
  function updateProgress() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) return;
    const ratio = Math.min(1, Math.max(0, track.scrollLeft / maxScroll));
    progressFill.style.width = (ratio * 100) + '%';

    // 高亮当前年份
    let activeYear = null;
    navBtns.forEach(btn => {
      btn.classList.remove('active', 'past', 'future');
    });

    // 找到最接近视口中心的卡片年份
    const trackRect = track.getBoundingClientRect();
    const viewCenter = trackRect.left + trackRect.width / 2;
    let closestCard = null;
    let minDist = Infinity;

    cards.forEach(card => {
      const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - viewCenter);
      if (dist < minDist) {
        minDist = dist;
        closestCard = card;
      }
    });

    if (closestCard) {
      activeYear = closestCard.dataset.year;
    }

    navBtns.forEach(btn => {
      const year = parseInt(btn.dataset.year, 10);
      const activeYr = parseInt(activeYear, 10);
      if (year === activeYr) {
        btn.classList.add('active');
      } else if (year < activeYr) {
        btn.classList.add('past');
      } else {
        btn.classList.add('future');
      }
    });

    // 箭头显示/隐藏
    const showArrows = window.innerWidth < 1024 || true; // 始终在时间线区域显示
    arrowLeft.classList.toggle('visible', track.scrollLeft > 20);
    arrowRight.classList.toggle('visible', track.scrollLeft < maxScroll - 20);
  }

  // ---- 拖拽支持 ----
  track.addEventListener('mousedown', (e) => {
    if (e.target.closest('.tl-card')) {
      isDragging = true;
      startX = e.pageX;
      scrollLeftStart = track.scrollLeft;
      lastX = e.pageX;
      lastTime = performance.now();
      velocity = 0;
      track.classList.add('dragging');
      e.preventDefault();
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.pageX - startX;
    track.scrollLeft = scrollLeftStart - dx;

    // 计算速度用于惯性
    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 0) {
      velocity = (e.pageX - lastX) / dt * 16; // 归一化到每帧
    }
    lastX = e.pageX;
    lastTime = now;

    updateCardStates();
    updateProgress();
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');

    // 惯性衰减
    if (Math.abs(velocity) > 0.5) {
      inertiaScroll(velocity);
    } else {
      snapToNearest();
    }
  });

  // 惯性滚动
  function inertiaScroll(v) {
    const decay = 0.95;
    function step() {
      if (Math.abs(v) < 0.3) {
        snapToNearest();
        return;
      }
      track.scrollLeft += v;
      v *= decay;
      updateCardStates();
      updateProgress();
      animFrameId = requestAnimationFrame(step);
    }
    cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(step);
  }

  // 吸附到最近卡片
  function snapToNearest() {
    const cw = getCardWidth();
    const targetIndex = Math.round(track.scrollLeft / cw);
    const targetScroll = targetIndex * cw;
    animateScrollTo(targetScroll, 600);
  }

  // 平滑滚动动画
  function animateScrollTo(target, duration) {
    const start = track.scrollLeft;
    const diff = target - start;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      track.scrollLeft = start + diff * eased;
      updateCardStates();
      updateProgress();

      if (progress < 1) {
        animFrameId = requestAnimationFrame(step);
      }
    }
    cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(step);
  }

  // ---- 滚轮转横向 ----
  track.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      track.scrollLeft += e.deltaY;
      updateCardStates();
      updateProgress();

      // 滚轮停止后吸附
      clearTimeout(track._wheelTimer);
      track._wheelTimer = setTimeout(() => {
        snapToNearest();
      }, 120);
    }
  }, { passive: false });

  // ---- 箭头按钮 ----
  arrowLeft.addEventListener('click', () => {
    const cw = getCardWidth();
    const target = Math.max(0, track.scrollLeft - cw);
    animateScrollTo(target, 500);
  });

  arrowRight.addEventListener('click', () => {
    const cw = getCardWidth();
    const maxScroll = track.scrollWidth - track.clientWidth;
    const target = Math.min(maxScroll, track.scrollLeft + cw);
    animateScrollTo(target, 500);
  });

  // ---- 年份导航点击 ----
  navBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const cw = getCardWidth();
      const target = idx * cw;
      animateScrollTo(target, 600);
    });
  });

  // ---- 滚动监听更新状态 ----
  track.addEventListener('scroll', () => {
    updateCardStates();
    updateProgress();
  }, { passive: true });

  // 初始化
  updateCardStates();
  updateProgress();

  // 触摸设备支持
  let touchStartX = 0;
  let touchScrollStart = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchScrollStart = track.scrollLeft;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    const dx = touchStartX - e.touches[0].clientX;
    track.scrollLeft = touchScrollStart + dx;
    updateCardStates();
    updateProgress();
  }, { passive: true });

  track.addEventListener('touchend', () => {
    snapToNearest();
  });

});
