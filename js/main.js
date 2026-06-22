/* ============================================
   main.js — GSAP + ScrollTrigger 总控
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- 注册 GSAP 插件 ----
  gsap.registerPlugin(ScrollTrigger);

  // ---- 导航栏滚动收缩 + Section 高亮 ----
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section[id]');
  const backToTop = document.getElementById('backToTop');
  const scrollHint = document.getElementById('scrollHint');

  // 滚动监听：导航栏状态切换
  function onScroll() {
    const sy = window.scrollY;

    // 导航栏收缩
    if (sy > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // 回到顶部按钮
    if (sy > window.innerHeight * 0.5) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // 滚动提示隐藏
    if (sy > 100) {
      scrollHint.classList.add('hidden');
    } else {
      scrollHint.classList.remove('hidden');
    }

    // 当前 section 高亮
    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (sy >= top) currentId = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === currentId);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 初始调用

  // 回到顶部点击
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 滚动提示点击 -> 跳转 Section 2
  scrollHint.addEventListener('click', () => {
    document.getElementById('stats').scrollIntoView({ behavior: 'smooth' });
  });

  // ---- 移动端汉堡菜单 ----
  const hamburger = document.getElementById('navHamburger');
  const navMenu = document.getElementById('navMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  // 点击菜单项后关闭移动端菜单
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });


  // ============================================
  // Section 1: 首屏英雄区动画
  // ============================================
  const heroTl = gsap.timeline({ delay: 0.6 });
  heroTl.to('#heroTitle', { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' })
          .to('#heroSubtitle', { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.7');

  // Ken Burns 背景缩放
  gsap.to('#heroBg', {
    scale: 1.08,
    duration: 8,
    ease: 'none',
  });


  // ============================================
  // Section 2: 数据亮点条 — 数字滚动
  // ============================================
  const statCards = document.querySelectorAll('.stat-card');
  const statDescs = document.querySelectorAll('.stat-desc');

  statCards.forEach((card, i) => {
    const valEl = card.querySelector('.stat-value');
    const target = parseInt(card.dataset.target, 10);
    const suffixEl = card.querySelector('.stat-suffix');
    if (suffixEl && card.dataset.suffix) suffixEl.textContent = card.dataset.suffix;

    ScrollTrigger.create({
      trigger: '#stats',
      start: 'top 60%',
      once: true,
      onEnter: () => {
        // 卡片依次弹入
        gsap.fromTo(card,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.4)', delay: i * 0.15 }
        );

        // 数字从 0 滚动到目标值
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          delay: i * 0.15,
          onUpdate: () => {
            valEl.textContent = Math.round(obj.val).toLocaleString();
          },
          onComplete: () => {
            // 数字完成后描述文字上浮淡入
            gsap.to(statDescs[i], { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
          }
        });
      }
    });
  });


  // ============================================
  // Section 4: 技术实力 — 视差 + 逐行弹入
  // ============================================
  const techItems = document.querySelectorAll('.tech-item');

  techItems.forEach(item => {
    const imgWrap = item.querySelector('.tech-img-wrap');
    const icon = item.querySelector('.tech-icon');
    const title = item.querySelector('.tech-title');
    const desc = item.querySelector('.tech-desc');
    const tags = item.querySelectorAll('.tech-tag');

    ScrollTrigger.create({
      trigger: item,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        // 图片视差（y 偏移量比文字大 2 倍）
        gsap.fromTo(imgWrap,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
        );

        // 图标微旋转弹入
        gsap.fromTo(icon,
          { rotation: -10, opacity: 0, scale: 0.8 },
          { rotation: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)' }
        );

        // 标题、描述逐行 stagger 弹入
        gsap.fromTo([title, desc],
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.15 }
        );

        // 标签延迟弹入
        gsap.fromTo(tags,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.4 }
        );
      }
    });
  });


  // ============================================
  // Section 5: 产品卡片入场动画
  // ============================================
  const productCards = document.querySelectorAll('.product-card');

  ScrollTrigger.create({
    trigger: '#products',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.fromTo(productCards,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.12, ease: 'power3.out' }
      );
    }
  });


  // ============================================
  // Section 6: 团队风采动画
  // ============================================

  // A区：合影
  ScrollTrigger.create({
    trigger: '.team-photo',
    start: 'top 75%',
    once: true,
    onEnter: () => {
      gsap.fromTo('.team-photo',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  });

  // B区：核心成员弹入
  const memberCards = document.querySelectorAll('.member-card');
  ScrollTrigger.create({
    trigger: '.team-members',
    start: 'top 75%',
    once: true,
    onEnter: () => {
      gsap.fromTo(memberCards,
        { scale: 0, rotation: -15, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.7)' }
      );
    }
  });

  // C区：Masonry 照片墙独立触发
  const masonryItems = document.querySelectorAll('.masonry-item');
  masonryItems.forEach((item, idx) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(item,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: (idx % 4) * 0.08 }
        );
      }
    });
  });


  // ============================================
  // Section 7: 联系区域动画
  // ============================================

  // 表单输入框左滑入
  const cfInputs = document.querySelectorAll('.cf-input');
  cfInputs.forEach((input, i) => {
    ScrollTrigger.create({
      trigger: '#contact',
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.fromTo(input,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.45, stagger: 0.1, ease: 'power2.out', delay: i * 0.1 }
        );
      }
    });
  });

  // 提交按钮
  const cfSubmit = document.querySelector('.cf-submit');
  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.fromTo(cfSubmit,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45, ease: 'power2.out', delay: cfInputs.length * 0.1 }
      );
    }
  });

  // 联系信息淡入
  const ciItems = document.querySelectorAll('.ci-item');
  ciItems.forEach((item, i) => {
    ScrollTrigger.create({
      trigger: '.contact-info-wrap',
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.fromTo(item,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, delay: i * 0.15, ease: 'power2.out' }
        );
      }
    });
  });


  // ============================================
  // 留言表单提交
  // ============================================
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // 模拟提交
    contactForm.style.display = 'none';
    formSuccess.style.display = 'block';
    // 重置动画
    formSuccess.querySelector('.success-checkmark').style.animation = 'none';
    void formSuccess.querySelector('.success-checkmark').offsetWidth; // reflow
    formSuccess.querySelector('.success-checkmark').style.animation = '';
  });

});
