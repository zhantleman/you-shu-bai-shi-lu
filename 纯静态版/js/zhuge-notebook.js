/**
 * 游蜀笔记侧边栏 — 诸葛亮线关键词收集系统
 * 
 * 功能：
 * 1. 在诸葛亮线前三幕（act1/2/3）右侧显示固定侧边栏
 * 2. 对话中的 <span class="keyword"> 词可点击收集
 * 3. 收集进度跨幕累计，localStorage持久化
 * 4. 收满9个显示奖励语
 */

// ==================== 关键词数据库 ====================
const NOTEBOOK_CONFIG = {
    storageKey: 'notebook_collected_zhugeliang',
    totalKeywords: 9,
    rewardText: '游蜀笔记·大成！卧龙之智，已入君心。'
};

const zhugeKeywords = [
    // ========== 第一幕 · 西部智谷AG主场 ==========
    {
        id: 'zhuge_1_1',
        act: 1,
        name: '5G双路专线',
        detail: '成都AG超玩会主场部署的5G专线，将赛事直播延迟压缩至毫秒级。诸葛亮观星测风，靠的是肉眼与经验；现代电竞靠的是数据洪流中的毫秒博弈。古人云"兵贵神速"，今日"速"已化为比特与光纤的跃迁。'
    },
    {
        id: 'zhuge_1_2',
        act: 1,
        name: '产业生态闭环',
        detail: 'AG主场选址于成都高新产业园区，周边数十万从业者步行可达。诸葛亮治蜀，讲究"因天时就地利"；今日电竞与科技产业共生，正是古老的"地利"智慧在数字经济时代的回响——人群即疆域，动线即粮道。'
    },
    {
        id: 'zhuge_1_3',
        act: 1,
        name: '用户获取成本',
        detail: '诸葛亮北伐，最重粮草辎重的"损耗率"。现代商业中"用户获取成本"就是数字时代的粮草账。将主场嵌入产业园，本质上是以最小代价"征召"最精准的用户，此谓"不战而屈人之兵"。'
    },
    // ========== 第二幕 · 峡谷·盛宴餐厅 ==========
    {
        id: 'zhuge_2_1',
        act: 2,
        name: '骨灰版与小白版',
        detail: '餐厅菜单分"骨灰玩家版"（含梗密集）和"小白版"（通俗引导）。诸葛亮写《出师表》，对刘禅循循善诱，对朝臣则严词切切——同一件事，对不同的人说不同的话，此乃"因材施教"的运营哲学。'
    },
    {
        id: 'zhuge_2_2',
        act: 2,
        name: '段位折扣',
        detail: '游戏段位越高，餐厅折扣越大。诸葛亮论功行赏，"校变以计，明赏罚之宜"。将虚拟世界的成就兑换为现实权益，本质上是把"段位"变成一种可流通的"军功"，让高段位玩家在现实中享受"爵位红利"。'
    },
    {
        id: 'zhuge_2_3',
        act: 2,
        name: '用户终身价值',
        detail: '一个玩家从入坑到退游，能为生态贡献多少价值？诸葛亮"鞠躬尽瘁"是个人层面的终身价值；商业层面的"用户终身价值"则要求运营者像诸葛亮治蜀一样，既要着眼当下粮草，更要算计十年之后的民心归属。'
    },
    // ========== 第三幕 · 武侯祠 ==========
    {
        id: 'zhuge_3_1',
        act: 3,
        name: '攻心联',
        detail: '武侯祠名联"能攻心则反侧自消，从古知兵非好战"。诸葛亮七擒孟获，不以杀服而以心服。今日电竞战队管理选手心态、运营粉丝社群，本质皆是"攻心"——技术差距可一夜追平，人心向背则需日积月累。'
    },
    {
        id: 'zhuge_3_2',
        act: 3,
        name: '文化校准',
        detail: '电竞从业者常来武侯祠，不是求签问卜，而是在历史中定位自身。诸葛亮自称"臣本布衣，躬耕于南阳"，始终不忘出处。在一个瞬息万变的行业里，"文化校准"就是提醒自己：数据之上，还有道义；算法之外，还有人心。'
    },
    {
        id: 'zhuge_3_3',
        act: 3,
        name: '元计算',
        detail: '诸葛亮"隆中对"未出茅庐而知天下三分，这是最高层级的"计算"——计算的是大势，而非一城一池。电竞决策者来武侯祠，做的正是"元计算"：在历史的纵深中测算当下决策的重量，避免成为数据洪流中没有方向的浮萍。'
    }
];

// ==================== 存储层 ====================
function getCollectedIds() {
    try {
        const raw = localStorage.getItem(NOTEBOOK_CONFIG.storageKey);
        if (!raw) return [];
        let ids = JSON.parse(raw);
        // 防护：去重 + 只保留合法ID + 截断到总数上限
        const validIds = zhugeKeywords.map(k => k.id);
        ids = [...new Set(ids)].filter(id => validIds.includes(id)).slice(0, NOTEBOOK_CONFIG.totalKeywords);
        // 回写清洗后的数据，覆盖脏数据
        saveCollectedIds(ids);
        return ids;
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
    zhugeKeywords.forEach(kw => {
        byAct[kw.act].push(kw);
    });

    const actNames = { 1: '第一幕 · 西部智谷AG主场', 2: '第二幕 · 峡谷·盛宴餐厅', 3: '第三幕 · 武侯祠' };

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
    const kw = zhugeKeywords.find(k => k.id === id);
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
