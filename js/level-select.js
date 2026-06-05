/**
 * 选关系统 - LevelSelect 管理模块
 * 支持两种界面：
 *   A) 关卡入口页 (libai/index.html) — 全屏卡片式
 *   B) 幕内悬浮选关面板 — Modal弹窗式
 *
 * 依赖：common.js 中的 heroActs / getProgress / saveProgress / goToAct
 */
const LevelSelect = {
    /** 当前英雄ID，由 initPage 或 initPanel 设置 */
    _heroId: null,
    /** 当前所在幕号（仅面板模式用），null 表示入口页 */
    _currentAct: null,

    /**
     * 初始化关卡入口页（全屏卡片式）
     * @param {string} heroId - 英雄标识，如 'liBai'
     */
    initPage(heroId) {
        this._heroId = heroId;
        this._currentAct = null;
        this._renderEntryPage();
    },

    /**
     * 初始化幕内悬浮选关面板（Modal弹窗式）
     * 在每个游戏页面的 corner-nav 中注入"选关"按钮 + 弹窗HTML
     * @param {string} heroId - 英雄标识
     * @param {number} currentAct - 当前幕号（用于高亮标记）
     */
    initPanel(heroId, currentAct) {
        this._heroId = heroId;
        this._currentAct = currentAct;
        this._injectLevelButton();
        this._injectPanelHTML();
        this._bindPanelEvents();
        this._renderPanelList();
    },

    // ==================== 入口页（全屏卡片式）====================

    /** 渲染入口页的完整内容 */
    _renderEntryPage() {
        const heroId = this._heroId;
        const acts = window.heroActs[heroId];
        if (!acts) return;

        const hero = window.heroes[heroId];
        const maxProgress = window.getProgress(heroId);

        // 构建关卡列表 HTML
        let listHTML = '';
        acts.forEach((act, idx) => {
            const unlocked = act.id === 1 || act.id <= maxProgress;
            const statusClass = unlocked ? 'level-entry-card unlocked' : 'level-entry-card locked';
            const lockIcon = unlocked ? '' : '<div class="entry-lock-icon">🔒</div>';
            const numCn = ['一', '二', '三', '四', '五'][idx] || act.id;

            listHTML += `
                <a href="${unlocked ? '#' : 'javascript:void(0)'}"
                   class="${statusClass}"
                   data-act-id="${act.id}"
                   ${unlocked ? '' : 'onclick="return false;"'}>
                    <div class="entry-card-inner">
                        <div class="entry-act-num">${numCn}</div>
                        <div class="entry-act-name">${act.name.replace(/^第[一二三四五六七八九十]幕·/, '')}</div>
                        <div class="entry-act-full">${act.name}</div>
                        ${lockIcon}
                    </div>
                </a>`;
        });

        // 写入页面容器
        const container = document.getElementById('level-entry-container');
        if (container) {
            container.innerHTML = `
                <div class="entry-hero-banner">
                    <span class="entry-hero-icon">${hero.icon}</span>
                    <h1 class="entry-hero-name">${hero.name}</h1>
                    <p class="entry-hero-title">${hero.title}</p>
                </div>
                <div class="entry-hint-bar">
                    <span class="hint-icon">⚡</span>
                    <span class="hint-text">前序章节中积累的属性值，将直接影响后续挑战的初始状态与难度 —— 每一次选择都在塑造你的命运。</span>
                </div>
                <div class="entry-level-grid">
                    ${listHTML}
                </div>
                <div class="entry-footer">
                    <a href="../index.html" class="entry-back-link">← 返回导师选择</a>
                </div>
            `;

            // 绑定点击事件
            container.querySelectorAll('.level-entry-card.unlocked').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const actId = parseInt(card.dataset.actId);
                    window.goToAct(heroId, actId);
                });
            });
        }
    },

    // ==================== 幕内面板（Modal弹窗式）====================

    /** 在 corner-nav 中注入选关按钮 */
    _injectLevelButton() {
        const nav = document.getElementById('corner-nav');
        if (!nav || document.getElementById('corner-level')) return;

        const btn = document.createElement('button');
        btn.className = 'corner-btn';
        btn.id = 'corner-level';
        btn.title = '选择章节';
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>`;

        // 插入到设置按钮前面
        const settingsBtn = document.getElementById('corner-settings');
        if (settingsBtn) {
            nav.insertBefore(btn, settingsBtn);
        } else {
            nav.appendChild(btn);
        }
    },

    /** 注入选关面板HTML */
    _injectPanelHTML() {
        // 避免重复注入
        if (document.getElementById('level-select-panel')) return;

        const panel = document.createElement('div');
        panel.className = 'modal-overlay';
        panel.id = 'level-select-panel';
        panel.style.cssText = 'opacity:0;pointer-events:none;';

        const hero = window.heroes[this._heroId];
        const maxProgress = window.getProgress(this._heroId);

        panel.innerHTML = `
            <div class="modal-content level-modal-content">
                <button class="modal-close-btn" id="level-panel-close">&times;</button>
                <div class="level-panel-header">
                    <h2>${hero.icon} 选择章节</h2>
                    <p class="level-progress-hint">当前：第${this._currentAct || '?'}幕 | 已解锁至第${maxProgress}幕</p>
                </div>
                <div class="level-hint-bar panel-hint-bar">
                    <span class="hint-icon">⚡</span>
                    <span class="hint-text">前序章节中积累的属性值，将直接影响后续挑战的初始状态与难度 —— 每一次选择都在塑造你的命运。</span>
                </div>
                <div class="level-list" id="level-panel-list"></div>
                <div class="level-panel-footer">
                    <a href="../index.html" class="btn-back-home-modal">&larr; 返回首页</a>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    },

    /** 绑定面板事件 */
    _bindPanelEvents() {
        // 打开面板：选关按钮点击
        const levelBtn = document.getElementById('corner-level');
        const panel = document.getElementById('level-select-panel');

        if (levelBtn && panel) {
            levelBtn.addEventListener('click', () => this.showPanel());
        }

        // 关闭面板：X按钮
        const closeBtn = document.getElementById('level-panel-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePanel());
        }

        // 点击遮罩层关闭
        if (panel) {
            panel.addEventListener('click', (e) => {
                if (e.target === panel) this.hidePanel();
            });
        }

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel && panel.style.opacity !== '0') {
                this.hidePanel();
            }
        });
    },

    /** 渲染面板内的关卡列表 */
    _renderPanelList() {
        const listEl = document.getElementById('level-panel-list');
        if (!listEl) return;

        const acts = window.heroActs[this._heroId];
        if (!acts) return;

        const maxProgress = window.getProgress(this._heroId);

        let html = '';
        acts.forEach((act, idx) => {
            const isCurrent = act.id === this._currentAct;
            const unlocked = act.id === 1 || act.id <= maxProgress;
            let statusClass = 'level-item';
            if (isCurrent) statusClass += ' current';
            else if (!unlocked) statusClass += ' locked';

            html += `
                <div class="${statusClass}" data-act-id="${act.id}">
                    <div class="level-item-left">
                        <span class="level-item-num">${String(act.id).padStart(2, '0')}</span>
                    </div>
                    <div class="level-item-center">
                        <div class="level-item-name">${act.name}</div>
                    </div>
                    <div class="level-item-right">
                        ${isCurrent ? '<span class="level-badge current-badge">当前</span>' :
                          (!unlocked ? '<span class="level-badge locked-badge">🔒</span>' :
                          '<span class="level-badge enter-badge">进入 &rarr;</span>')}
                    </div>
                </div>`;
        });

        listEl.innerHTML = html;

        // 绑定可点击项的事件
        listEl.querySelectorAll('.level-item:not(.locked):not(.current)').forEach(item => {
            item.addEventListener('click', () => {
                const actId = parseInt(item.dataset.actId);
                this.hidePanel();
                // 延迟跳转，等关闭动画完成
                setTimeout(() => window.goToAct(this._heroId, actId), 320);
            });
        });
    },

    /** 显示选关面板 */
    showPanel() {
        const panel = document.getElementById('level-select-panel');
        if (!panel) return;

        // 每次打开时刷新列表（进度可能变化）
        this._renderPanelList();

        // 更新当前幕显示
        const hint = panel.querySelector('.level-progress-hint');
        if (hint) {
            const maxProgress = window.getProgress(this._heroId);
            hint.textContent = `当前：第${this._currentAct || '?'}幕 | 已解锁至第${maxProgress}幕`;
        }

        requestAnimationFrame(() => {
            panel.style.opacity = '1';
            panel.style.pointerEvents = 'auto';
            const content = panel.querySelector('.level-modal-content');
            if (content) {
                content.style.opacity = '1';
                content.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        });
    },

    /** 隐藏选关面板 */
    hidePanel() {
        const panel = document.getElementById('level-select-panel');
        if (!panel) return;

        panel.style.opacity = '0';
        panel.style.pointerEvents = 'none';
        const content = panel.querySelector('.level-modal-content');
        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translate(-50%, -50%) scale(0.9)';
        }
    }
};

// 导出到全局
window.LevelSelect = LevelSelect;
