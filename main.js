/* ===================================================
   WaveLynk — v3 Core JavaScript
   Theme toggle · Animated wave bg · Scroll reveal
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ─── Theme Toggle ─── */
    const themeBtn = document.querySelector('.theme-toggle');
    const saved = localStorage.getItem('wavelynk-theme');

    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    } else {
        // Default dark
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('wavelynk-theme', next);
        });
    }


    /* ─── Mobile Nav Toggle ─── */
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }


    /* ─── Active Nav Link ─── */
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) link.classList.add('active');
    });


    /* ─── Scroll Reveal ─── */
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
        reveals.forEach(el => observer.observe(el));
    }


    /* ─── Smooth page transitions ─── */
    document.querySelectorAll('.nav-links a, .btn[href], a.btn').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
            e.preventDefault();
            const main = document.querySelector('main');
            if (main) {
                main.style.transition = 'opacity .15s ease, transform .15s ease';
                main.style.opacity = '0';
                main.style.transform = 'translateY(-4px)';
            }
            setTimeout(() => { window.location.href = href; }, 130);
        });
    });


    /* ─── Counter animation ─── */
    document.querySelectorAll('[data-counter]').forEach(el => {
        const target = parseInt(el.getAttribute('data-counter'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        let counted = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !counted) {
                    counted = true;
                    let start = 0;
                    const step = Math.ceil(target / 40);
                    const interval = setInterval(() => {
                        start += step;
                        if (start >= target) {
                            start = target;
                            clearInterval(interval);
                        }
                        el.textContent = prefix + start + suffix;
                    }, 25);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.3 });
        observer.observe(el);
    });


    /* ─── Animated Wave Background ─── */
    const waveCanvas = document.getElementById('wave-canvas');
    if (waveCanvas) {
        const ctx = waveCanvas.getContext('2d');
        let w, h, frame = 0;

        function resize() {
            w = waveCanvas.width = window.innerWidth;
            h = waveCanvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        function drawWave(yBase, amplitude, frequency, speed, alpha) {
            ctx.beginPath();
            for (let x = 0; x <= w; x += 2) {
                const y = yBase +
                    Math.sin(x * frequency * 0.001 + frame * speed) * amplitude +
                    Math.sin(x * frequency * 0.0007 + frame * speed * 0.7) * amplitude * 0.6;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            const theme = document.documentElement.getAttribute('data-theme');
            const color = theme === 'light' ? '59, 130, 246' : '96, 165, 250';
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        function animate() {
            ctx.clearRect(0, 0, w, h);
            drawWave(h * 0.25, 30, 3, 0.015, 0.25);
            drawWave(h * 0.4, 25, 2.5, 0.018, 0.15);
            drawWave(h * 0.55, 35, 2, 0.012, 0.2);
            drawWave(h * 0.7, 20, 3.5, 0.02, 0.12);
            drawWave(h * 0.85, 28, 2.2, 0.016, 0.18);
            frame++;
            requestAnimationFrame(animate);
        }
        animate();
    }

});


/* ─── Utility functions for demos ─── */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function fmt(v, d = 2) { return Number(v).toFixed(d); }
