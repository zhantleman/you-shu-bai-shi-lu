/**
 * 游蜀笔记侧边栏 — 李白线关键词收集系统
 * 
 * 功能：
 * 1. 在李白线前三幕（act1/2/3）右侧显示固定侧边栏
 * 2. 对话中的 <span class="keyword"> 词可点击收集
 * 3. 收集进度跨幕累计，localStorage持久化
 * 4. 收满8个显示奖励语
 */

// ==================== 关键词数据库 ====================
const NOTEBOOK_CONFIG = {
    storageKey: 'notebook_collected_liBai',
    totalKeywords: 8,
    rewardText: '游蜀笔记·大成！你已是谪仙知音。'
};

const libaiKeywords = [
    {
        id: 'libai_1_1',
        act: 1,
        name: '机甲的光芒',
        detail: 'IFS国际金融中心上空，鲁班七号机甲展的灯光如潮水般漫过夜空。那不是普通的霓虹——每一束光都经过编程，十万行代码铸就的光之诗篇。李白见此景，脱口一句"像不像诗？"，将钢铁与文字瞬间连接。'
    },
    {
        id: 'libai_1_2',
        act: 1,
        name: '春江潮水',
        detail: '春江潮水连海平，海上明月共潮生。机甲展灯光亮起时，光流如春潮般涌动，整座大楼仿佛漂浮在光海之中。李白以《春江花月夜》之意象，将现代科技之光比作千年前的江潮，古今辉映。'
    },
    {
        id: 'libai_1_3',
        act: 1,
        name: '远峰巍峨',
        detail: '灯光映照下的IFS主塔，如远山般耸立入云。李白用"远峰"二字赋予钢筋水泥以山水诗意——城市即山林，大厦即峰峦。此乃谪仙看世界的独特方式：万物皆有诗骨。'
    },
    {
        id: 'libai_2_1',
        act: 2,
        name: '白苇挂满东窗',
        detail: '宽窄巷子深处，老墙斑驳，光影交错处似有芦苇摇曳。"白苇挂满东窗"出自对古巷光影的诗意捕捉：阳光透过缝隙落在老窗上，如白苇低垂，静谧而悠远。'
    },
    {
        id: 'libai_2_2',
        act: 2,
        name: '一局挂一局',
        detail: '鲁班茶肆里，盖碗茶配KPL赛事直播。一局接一局，如同诗歌中的对仗手法——前后呼应，隔而不离。李白以诗家眼光观电竞，竟发现其中暗合格律之美。'
    },
    {
        id: 'libai_3_1',
        act: 3,
        name: '落英',
        detail: '东郊记忆Daji Cafe的粉红装饰，如樱花飘落般铺满视野。粉色即是战场上的落英——看似柔弱，却以唯美姿态占据空间。李白以"落英"喻此景，柔中带刚，别有深意。'
    },
    {
        id: 'libai_3_2',
        act: 3,
        name: '黑骥',
        detail: 'Daji Cafe旁的老厂房，铁骨铮铮，沉默矗立。粉色妲己主题餐厅与黑色工业厂房并置，恰如战场上一匹黑骥——内敛、有力、不喧哗却不可忽视。'
    },
    {
        id: 'libai_3_3',
        act: 3,
        name: '金鞍勒马',
        detail: '狐狸尾座椅造型奇特，如金鞍束缚骏马。李白解读为"看似束缚，实则指引"——规则与创意的关系正如鞍与马，适度的约束反而能激发更大的自由。'
    }
];

// ==================== 存储层 ====================
function getCollectedIds() {
    try {
        const raw = localStorage.getItem(NOTEBOOK_CONFIG.storageKey);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveCollectedIds(ids) {
    localStorage.setItem(NOTEBOOK_CONFIG.storageKey, JSON.stringify(ids));
}

function isKeywordCollected(id) {
    return getCollectedIds().includes(id);
}

function collectKeyword(id) {
    const ids = getCollectedIds();
    if (ids.includes(id)) return false; // 已收集
    ids.push(id);
    saveCollectedIds(ids);
    return true;
}

// ==================== UI渲染 ====================
function renderNotebook() {
    const sidebar = document.getElementById('notebook-sidebar');
    if (!sidebar) return;

    const collected = getCollectedIds();
    const count = collected.length;
    const total = NOTEBOOK_CONFIG.totalKeywords;
    const pct = Math.round((count / total) * 100);

    // 按幕分组
    const byAct = { 1: [], 2: [], 3: [] };
    libaiKeywords.forEach(kw => {
        byAct[kw.act].push(kw);
    });

    const actNames = { 1: '第一幕 · IFS机甲', 2: '第二幕 · 宽窄巷子', 3: '第三幕 · 东郊记忆' };

    let html = `
    <div class="nb-header">
        <div class="nb-title-row">
            <span class="nb-icon">◈</span>
            <span class="nb-title">游蜀笔记</span>
        </div>
        <div class="nb-progress-info">${count} / ${total}</div>
    </div>
    <div class="nb-progress-bar-outer">
        <div class="nb-progress-bar-inner" style="width: ${pct}%;"></div>
    </div>
    <div class="nb-keyword-list">
    `;

    for (let act = 1; act <= 3; act++) {
        html += `<div class="nb-act-group"><div class="nb-act-title">${actNames[act]}</div>`;
        byAct[act].forEach(kw => {
            const done = collected.includes(kw.id);
            html += `
                <div class="nb-keyword-item ${done ? 'collected' : 'pending'}" data-kwid="${kw.id}">
                    <span class="nb-kw-status">${done ? '◆' : '·'}</span>
                    <span class="nb-kw-name">${done ? kw.name : '·· · ·'}</span>
                </div>`;
        });
        html += '</div>';
    }

    html += `</div><div class="nb-detail" id="nb-detail-area"><div class="nb-detail-placeholder">— 点击已收录词条 —</div></div>`;

    // 收满奖励
    if (count >= total) {
        html += `<div class="nb-reward">${NOTEBOOK_CONFIG.rewardText}</div>`;
    }

    sidebar.innerHTML = html;

    // 绑定列表点击事件（显示详情）
    sidebar.querySelectorAll('.nb-keyword-item.collected').forEach(item => {
        item.addEventListener('click', () => {
            const kwId = item.getAttribute('data-kwid');
            showKeywordDetail(kwId);
        });
    });
}

function showKeywordDetail(id) {
    const kw = libaiKeywords.find(k => k.id === id);
    if (!kw) return;
    const area = document.getElementById('nb-detail-area');
    if (!area) return;
    area.innerHTML = `
        <div class="nb-detail-name">${kw.name}</div>
        <div class="nb-detail-text">${kw.detail}</div>
    `;
}

// ==================== 初始化 & 事件委托 ====================
function initNotebook() {
    // 渲染侧边栏
    renderNotebook();

    // 事件委托：点击对话区内的 .keyword 触发收集
    document.addEventListener('click', function(e) {
        const kwSpan = e.target.closest('.keyword');
        if (!kwSpan) return;
        
        const id = kwSpan.getAttribute('data-id');
        if (!id) return;

        if (isKeywordCollected(id)) {
            // 已收集 → 显示详情
            showKeywordDetail(id);
            // 高亮侧边栏对应项
            const sidebarItem = document.querySelector(`.nb-keyword-item[data-kwid="${id}"]`);
            if (sidebarItem) sidebarItem.classList.add('nb-highlight');
            setTimeout(() => sidebarItem && sidebarItem.classList.remove('nb-highlight'), 1200);
            return;
        }

        // 未收集 → 执行收集
        const success = collectKeyword(id);
        if (success) {
            // 标记该span为已收集状态
            kwSpan.classList.add('collected');
            
            // 刷新侧边栏
            renderNotebook();
            
            // 显示刚收集的词条详情
            showKeywordDetail(id);

            // 高亮侧边栏对应项
            const sidebarItem = document.querySelector(`.nb-keyword-item[data-kwid="${id}"]`);
            if (sidebarItem) {
                sidebarItem.classList.add('nb-highlight');
                setTimeout(() => sidebarItem.classList.remove('nb-highlight'), 1200);
            }
        }
    });

    // 页面加载后，标记已收集的关键词视觉状态
    refreshKeywordSpans();
}

// 标记对话区内已有的 keyword span 状态
function refreshKeywordSpans() {
    const collected = getCollectedIds();
    document.querySelectorAll('.keyword').forEach(span => {
        const id = span.getAttribute('data-id');
        if (id && collected.includes(id)) {
            span.classList.add('collected');
        }
    });
}

// DOMReady时自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotebook);
} else {
    initNotebook();
}
