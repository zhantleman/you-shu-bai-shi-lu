/**
 * 游蜀笔记侧边栏 — 赵云线关键词收集系统
 * 
 * 功能：
 * 1. 在赵云线前三幕（act1/2/3）右侧显示固定侧边栏
 * 2. 对话中的 <span class="keyword"> 词可点击收集
 * 3. 收集进度跨幕累计，localStorage持久化
 * 4. 收满9个显示奖励语
 */

// ==================== 关键词数据库 ====================
const NOTEBOOK_CONFIG = {
    storageKey: 'notebook_collected_zhaoyun',
    totalKeywords: 9,
    rewardText: '游蜀笔记·大成！常山之勇，已铸君魂。'
};

const zhaoyunKeywords = [
    // ========== 第一幕 · 武侯祠守卫战 ==========
    {
        id: 'zhao_1_1',
        act: 1,
        name: '智能监控与人工巡查双轨制',
        detail: '武侯祠安保采用"技术覆盖+人脑决策"的双轨模式。赵云长坂坡七进七出，靠的不是蛮力，而是对战场局势的判断力。技术是眼睛，人是持枪的手——再精密的系统，也需要勇者按下那个决定性的按钮。'
    },
    {
        id: 'zhao_1_2',
        act: 1,
        name: '3分钟内响应到位',
        detail: '武侯祠安保要求危急时刻3分钟到场。赵云救阿斗，每一秒都是生死时速。守护不是"守在门口"，而是"在你需要的时候，我刚好出现"。这3分钟，是训练、预案与勇气的总和。'
    },
    {
        id: 'zhao_1_3',
        act: 1,
        name: 'AR还原三国战场',
        detail: '武侯祠用AR技术让游客"亲历"三国战场。赵云一生征战，若能看到千年后的人们用光影重现他的故事，或许会说：真正的勇者，从不畏惧被时代重新讲述——只要那份忠义还在。'
    },
    // ========== 第二幕 · 锦江突围 ==========
    {
        id: 'zhao_2_1',
        act: 2,
        name: 'AED除颤仪与救援站',
        detail: '锦江每艘游船配备AED，沿岸每500米设救援站。赵云冲锋陷阵时，身上也带着金疮药与绷带——真正的勇者从不讳言"万一"。最好的守护，是把"万一"算进每一份预案里。'
    },
    {
        id: 'zhao_2_2',
        act: 2,
        name: '90秒内救援到达',
        detail: '锦江落水救援的黄金时间被压缩到90秒。赵云在长坂坡杀个来回，靠的就是"快"。守护与进攻，在"速度"面前殊途同归——迟到的守护不是守护，是追悼。'
    },
    {
        id: 'zhao_2_3',
        act: 2,
        name: '沉浸式安全',
        detail: '将安全提示融入灯光秀和剧情讲解，游客在不知不觉中完成安全培训。赵云守护阿斗，不会一直喊"我在保护你"，而是默默杀退每一个敌人。真正的守护，让人感觉不到它的存在，但它一直都在。'
    },
    // ========== 第三幕 · 青城试炼 ==========
    {
        id: 'zhao_3_1',
        act: 3,
        name: '分级挑战',
        detail: '青城山户外运动从初级索道到高级攀岩，每级都有严格的装备标准。赵云初上战场也是从士卒做起。"分级挑战"不是束缚，而是给勇气画一条跑道——让每个人都能在自己的极限边界上，再多迈出半步。'
    },
    {
        id: 'zhao_3_2',
        act: 3,
        name: '道法自然',
        detail: '青城的冒险哲学不是征服自然，而是与自然对话。赵云一生骁勇，却从不轻视任何对手。"道法自然"在冒险中翻译过来就是：尊重山的脾气，敬畏风的方向。勇者不是莽夫，知险而行为勇。'
    },
    {
        id: 'zhao_3_3',
        act: 3,
        name: '不冒不必要的险',
        detail: '道教"无为"在青城冒险中变成了"不冒不必要的险"。赵云七进七出，每一次冲锋都有明确的目的——救阿斗，不是逞匹夫之勇。真正的勇者会问自己：这一剑，值不值得拔。'
    }
];

// ==================== 存储层 ====================
function getCollectedIds() {
    try {
        const raw = localStorage.getItem(NOTEBOOK_CONFIG.storageKey);
        if (!raw) return [];
        let ids = JSON.parse(raw);
        // 防护：去重 + 只保留合法ID + 截断到总数上限
        const validIds = zhaoyunKeywords.map(k => k.id);
        ids = [...new Set(ids)].filter(id => validIds.includes(id)).slice(0, NOTEBOOK_CONFIG.totalKeywords);
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
    if (ids.includes(id)) return false;
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

    const byAct = { 1: [], 2: [], 3: [] };
    zhaoyunKeywords.forEach(kw => {
        byAct[kw.act].push(kw);
    });

    const actNames = { 1: '第一幕 · 武侯祠守卫战', 2: '第二幕 · 锦江突围', 3: '第三幕 · 青城试炼' };

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

    if (count >= total) {
        html += `<div class="nb-reward">${NOTEBOOK_CONFIG.rewardText}</div>`;
    }

    sidebar.innerHTML = html;

    sidebar.querySelectorAll('.nb-keyword-item.collected').forEach(item => {
        item.addEventListener('click', () => {
            const kwId = item.getAttribute('data-kwid');
            showKeywordDetail(kwId);
        });
    });
}

function showKeywordDetail(id) {
    const kw = zhaoyunKeywords.find(k => k.id === id);
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
    renderNotebook();

    document.addEventListener('click', function(e) {
        const kwSpan = e.target.closest('.keyword');
        if (!kwSpan) return;

        const id = kwSpan.getAttribute('data-id');
        if (!id) return;

        if (isKeywordCollected(id)) {
            showKeywordDetail(id);
            const sidebarItem = document.querySelector(`.nb-keyword-item[data-kwid="${id}"]`);
            if (sidebarItem) sidebarItem.classList.add('nb-highlight');
            setTimeout(() => sidebarItem && sidebarItem.classList.remove('nb-highlight'), 1200);
            return;
        }

        const success = collectKeyword(id);
        if (success) {
            kwSpan.classList.add('collected');
            renderNotebook();
            showKeywordDetail(id);
            const sidebarItem = document.querySelector(`.nb-keyword-item[data-kwid="${id}"]`);
            if (sidebarItem) {
                sidebarItem.classList.add('nb-highlight');
                setTimeout(() => sidebarItem && sidebarItem.classList.remove('nb-highlight'), 1200);
            }
        }
    });

    refreshKeywordSpans();
}

function refreshKeywordSpans() {
    const collected = getCollectedIds();
    document.querySelectorAll('.keyword').forEach(span => {
        const id = span.getAttribute('data-id');
        if (id && collected.includes(id)) {
            span.classList.add('collected');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotebook);
} else {
    initNotebook();
}
