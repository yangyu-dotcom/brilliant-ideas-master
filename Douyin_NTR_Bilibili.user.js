// ==UserScript==
// @name         抖音，一键三连！
// @namespace    yangyu-dotcom
// @version      1.0
// @description  给抖音也加上一键三连XD
// @author       萤火FyrGlow
// @homepage     https://space.bilibili.com/266986139
// @match        https://www.douyin.com/
// @match        https://www.douyin.com/?recommend=1
// @require      https://github.com/yangyu-dotcom/brilliant-ideas-master/blob/main/KV.js
// @icon         https://p-pc-weboff.byteimg.com/tos-cn-i-9r5gewecjs/favicon.png
// @run-at       document-start
// @grant        none
// @license      CC BY-NC
// ==/UserScript==

(function () {
    "use strict";

    if (location.href === "https://www.douyin.com/") {
        location.replace("https://www.douyin.com/?recommend=1");
        return;
    }
    if (location.href !== "https://www.douyin.com/?recommend=1") return;

    const LocalKV = {
        putVid: (vid) => {
            if (!vid) return;
            const list = JSON.parse(localStorage.getItem("saved_vids") || "[]");
            if (!list.includes(vid)) {
                list.push(vid);
                localStorage.setItem("saved_vids", JSON.stringify(list));
            }
        },
        getVid: (vid) => {
            if (!vid) return false;
            const list = JSON.parse(localStorage.getItem("saved_vids") || "[]");
            return list.includes(vid);
        }
    };

    const App = {
        MARK: "data-myinsert",
        lottieReady: false,
        queue: [],

        init() {
            this.injectStyles();
            this.loadLottie(() => {
                this.observeMutations();
                this.initHeartShake();
            });
        },

        injectStyles() {
            document.head.insertAdjacentHTML(
                "beforeend",
                `<style>
                    .my-hide { visibility:hidden!important;opacity:0!important; }
                    .my-show { visibility:visible!important;opacity:1!important;transition:opacity .12s; }
                </style>`
            );
        },

        loadLottie(cb) {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.10.2/lottie.min.js";
            s.onload = () => {
                this.lottieReady = true;
                this.queue.forEach(fn => fn());
                this.queue = [];
                cb?.();
            };
            document.head.appendChild(s);
        },

        ensureLottie(fn) {
            this.lottieReady ? fn() : this.queue.push(fn);
        },

        setupLottie(div) {
            const c = document.createElement("div");
            c.className = div.className;
            c.style.cssText = `width:${div.offsetWidth}px;height:${div.offsetHeight}px;display:inline-block;vertical-align:middle;`;
            div.parentNode.replaceChild(c, div);

            const anim = lottie.loadAnimation({
                container: c,
                renderer: "svg",
                loop: false,
                autoplay: false,
                path: "https://lottie.host/84f92271-57fd-4fce-b1d4-d37f4d38262c/II0ilwCHUM.json",
                rendererSettings: { preserveAspectRatio: "xMidYMid meet" }
            });

            anim.goToAndStop(0, true);

            const playAnimation = () => {
                if (c.dataset.played) return;
                c.dataset.played = 1;
                anim.setSpeed(0.8);
                anim.goToAndPlay(0, true);
                anim.addEventListener("complete", () => {
                    anim.goToAndStop(anim.totalFrames - 1, true);
                }, { once: true });
            };

            c.addEventListener("click", async (e) => {
                if (c.dataset.played) return;

                const isSimulated = e?.detail?.simulated || false;

                const playAnimation = () => {
                    c.dataset.played = 1;
                    anim.setSpeed(0.8);
                    anim.goToAndPlay(0, true);
                    anim.addEventListener("complete", () => {
                        anim.goToAndStop(anim.totalFrames - 1, true);
                    }, { once: true });
                };

                if (!isSimulated) {
                    this.showConfirm(async () => {
                        const parentWithVid = c.closest('[data-e2e-vid]');
                        const vid = parentWithVid?.getAttribute('data-e2e-vid') || null;
                        if (!vid) return;

                        try {
                            const putResult = await KV.putKV(`id=${vid}`);
                            if (putResult) {
                                LocalKV.putVid(vid);
                                console.log('投币:', LocalKV.getVid(vid));
                                playAnimation();
                            } else {
                                console.warn('投币失败，请稍后再试！\n（每 10s 只能投币 2 次！）');
                                alert('投币失败，请稍后再试！\n（每 10s 只能投币 2 次！）');
                            }
                        } catch (err) {
                            console.error('KV.putKV error:', err);
                            alert('投币失败，请稍后再试！\n（每 10s 只能投币 2 次！）');
                        }
                    });
                } else {
                    playAnimation();
                }
            });

            anim.addEventListener("DOMLoaded", () => {
                const svg = c.querySelector("svg");
                const g = svg?.querySelector("g");
                if (svg && g) {
                    svg.style.overflow = "visible";
                    g.setAttribute("transform", "scale(4.5)");
                    g.setAttribute("transform-origin", "center center");
                }

                const box = c.closest(".I6U7FiE8.immersive-player-switch-on-hide-interaction-area");
                if (box) box.classList.replace("my-hide", "my-show");
            });
            return playAnimation;
        },

        async insertCoin(box) {
            if (box.querySelector(`[${this.MARK}="1"]`)) {
                box.classList.replace("my-hide", "my-show");
                return;
            }

            box.classList.add("my-hide");
            const target = box.querySelector('.PRYmKwbE.eu1prwNn[data-e2e="video-play-more"]');
            if (!target) return;

            const parentWithVid = box.closest('[data-e2e-vid]');
            const vid = parentWithVid?.getAttribute('data-e2e-vid') || null;
            console.log('data-e2e-vid:', vid);

            target.insertAdjacentHTML(
                "beforebegin",
                `<div ${this.MARK}="1" tabindex="0" style="position:relative;display:inline-block;">
                    <div class="fR9ZbClg JBKVqbn_">
                        <span class="semi-icon semi-icon-default">
                            <div class="WSVpNrSk tTdmBhY8 TOUBI"></div>
                        </span>
                        <div class="rWZP7wQY">投币</div>
                    </div>
                </div>`
            );

            const newDiv = target.previousElementSibling.querySelector(".WSVpNrSk.tTdmBhY8.TOUBI");
            if (!newDiv) return;

            let playAnimationFn;
            this.ensureLottie(() => {
                playAnimationFn = this.setupLottie(newDiv);
            });

            if (!vid) return;

            const triggerAnimation = () => {
                if (playAnimationFn) playAnimationFn();
            };

            if (LocalKV.getVid(vid)) {
                console.log("检测到B友精选！");
                triggerAnimation();
            } else {
                try {
                    const getResult = await KV.getKV(`id=${vid}`);
                    if (getResult == 1) {
                        console.log("检测到B友精选！");
                        triggerAnimation();
                    }
                } catch (err) {
                    console.error('KV.getKV error:', err);
                }
            }
        },

        showConfirm(ok) {
            const wrap = document.createElement("div");
            wrap.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;`;

            wrap.innerHTML = `
                <div style="background:#252632;color:#ccc;border-radius:12px;box-shadow:0 0 20px #0007;padding:24px;min-width:300px;max-width:90%;text-align:center;font-family:sans-serif;">
                    <h2 style="margin:0 0 12px;font-size:20px;color:#eee;">你确定要投币吗?<span style="font-size:12px;color:#666;margin-left:4px;">(不可撤销)</span></h2>
                    <p style="margin:0 0 24px;font-size:14px;">如果投币的话所有人都可以看到这个硬币</p>
                    <div style="display:flex;justify-content:center;gap:16px;">
                        <button data-ok style="background:#FE2C55;border:none;color:#fff;padding:10px 30px;border-radius:8px;cursor:pointer;font-size:14px;">确认</button>
                        <button data-cancel style="background:#FE2C55;border:none;color:#fff;padding:10px 30px;border-radius:8px;cursor:pointer;font-size:14px;">取消</button>
                    </div>
                </div>`;

            wrap.querySelector("[data-ok]").onclick = () => (document.body.removeChild(wrap), ok());
            wrap.querySelector("[data-cancel]").onclick = () => document.body.removeChild(wrap);
            document.body.appendChild(wrap);
        },

        observeMutations() {
            new MutationObserver(m => {
                for (const x of m) {
                    for (const n of x.addedNodes) {
                        if (!(n instanceof HTMLElement)) continue;
                        const box = n.matches?.(".I6U7FiE8.immersive-player-switch-on-hide-interaction-area")
                        ? n
                        : n.querySelector?.(".I6U7FiE8.immersive-player-switch-on-hide-interaction-area");
                        if (box) this.insertCoin(box);
                    }
                }
            }).observe(document.documentElement, { childList: true, subtree: true });
        },

        initHeartShake() {
            const maxX = 0.5, maxY = 0.5, speed = 20;

            const getGroup = h => {
                const p = h.closest('.WU6dkKao');
                return p ? [...p.querySelectorAll('.bHdnyhh0'), ...p.querySelectorAll('.WSVpNrSk.tTdmBhY8.TOUBI')] : [];
            };

            const shake = (el, x, y) => {
                el.style.transform = el.style.transform.replace(/translate\([^)]+\)/, "");
                el.style.transform += ` translate(${x}px,${y}px)`;
            };

            const init = () => {
                document.querySelectorAll('.UIQajZAR').forEach(h => {
                    if (h.dataset.init) return;
                    h.dataset.init = 1;

                    let timer, interval, shaking = false, sup = false;

                    const start = () => {
                        if (shaking) return;
                        sup = true;
                        const group = getGroup(h);

                        interval = setInterval(() => {
                            shake(h, rand(maxX), rand(maxY));
                            group.forEach(e => shake(e, rand(maxX), rand(maxY)));
                        }, speed);
                        shaking = true;
                    };

                    const stop = () => {
                        if (!shaking) return;
                        clearInterval(interval);
                        interval = null;
                        reset(h);
                        getGroup(h).forEach(reset);
                        shaking = false;
                        setTimeout(() => (sup = false));
                    };

                    const rand = m => Math.floor(Math.random() * (2 * m + 1)) - m;
                    const reset = e => (e.style.transform = e.style.transform.replace(/translate\([^)]+\)/, ""));

                    h.addEventListener('pointerdown', e => {
                        e.preventDefault();
                        timer = setTimeout(start, 1000);
                    });

                    h.addEventListener('pointerup', e => {
                        clearTimeout(timer);
                        stop();
                        if (!sup) return;
                        e.preventDefault();

                        const digg = h.closest('[data-e2e="video-player-digg"]');
                        const state = digg?.getAttribute('data-e2e-state');
                        let list = [];

                        if (state === "video-player-no-digged") {
                            list.push(h);
                            const p = h.closest('.WU6dkKao');
                            if (p) {
                                const col = p.querySelector('[data-e2e="video-player-collect"]');
                                const collected = col && col.getAttribute('data-e2e-state') === 'video-player-is-collected';
                                if (!collected) list.push(...p.querySelectorAll('.bHdnyhh0'));
                                list.push(...p.querySelectorAll('.WSVpNrSk.tTdmBhY8.TOUBI'));
                            }
                        } else if (state === "video-player-is-digged") {
                            const p = h.closest('.WU6dkKao');
                            if (p) list.push(...p.querySelectorAll('.WSVpNrSk.tTdmBhY8.TOUBI'));
                        }

                        list.forEach(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
                    });

                    h.addEventListener('pointerleave', () => (clearTimeout(timer), stop()));

                    h.addEventListener('click', e => {
                        if (sup && e.isTrusted) {
                            e.stopImmediatePropagation();
                            e.preventDefault();
                        }
                    });
                });
            };

            new MutationObserver(init).observe(document.body, {
                childList: true,
                subtree: true
            });

            init();
        }
    };

    App.init();
})();

