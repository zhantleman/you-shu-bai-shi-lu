/* 游蜀拜师录 - 公共JavaScript文件 */
/* 包含所有页面通用的函数和状态管理 */

// 全局游戏状态
const gameState = {
    // 当前选中的英雄
    currentHero: null,
    
    // 基础属性
    stats: {
        poem: 5,          // 诗心（李白）
        wine: 3,          // 酒意（李白）
        intelligence: 4,  // 智谋（诸葛亮）
        efficiency: 6,    // 效率（诸葛亮）
        courage: 7,       // 勇气（赵云）
        guard: 4          // 守护（赵云）
    },
    
    // 全局成就状态
    achievements: [],
    
    // 对话历史
    dialogueHistory: [],
    
    // 用户设置
    settings: {
        musicVolume: 0.5,
        soundVolume: 0.7,
        textSpeed: 'medium', // fast, medium, slow
        theme: 'dark'       // dark, light
    }
};

// 英雄数据
const heroes = {
    liBai: {
        name: '李白',
        title: '青莲剑仙 · 诗酒剑意',
        description: '诗心与酒意的融合，创造无限可能。',
        color: '#60E0FF',
        icon: '🍷'
    },
    zhugeLiang: {
        name: '诸葛亮',
        title: '绝代智谋 · 一步三算',
        description: '智谋与效率的结合，规划完美战略。',
        color: '#0066CC',
        icon: '🎯'
    },
    zhaoYun: {
        name: '赵云',
        title: '苍天翔龙 · 勇者之誓',
        description: '勇气与守护的融合，成就无敌战神。',
        color: '#C8C8D7',
        icon: '⚔️'
    }
};

// 获取网站根目录（解决子目录下的相对路径问题）
function getRootPath() {
    const path = window.location.pathname;
    // 计算当前文件所在目录的深度
    const parts = path.split('/').filter(p => p && !p.endsWith('.html') && !p.endsWith('.htm'));
    if (parts.length <= 1) return './';
    return '../'.repeat(parts.length - 1);
}

// ==================== 本地存储工具函数 ====================

// 保存游戏状态到localStorage
function saveGameState() {
    try {
        localStorage.setItem('gameState', JSON.stringify(gameState));
        console.log('游戏状态已保存');
    } catch (error) {
        console.error('保存游戏状态失败:', error);
    }
}

// 加载游戏状态从localStorage
function loadGameState() {
    try {
        const saved = localStorage.getItem('gameState');
        if (saved) {
            const parsed = JSON.parse(saved);
            
            // 合并保存的状态（保持默认值作为后备）
            Object.assign(gameState.stats, parsed.stats || {});
            gameState.achievements = parsed.achievements || [];
            gameState.dialogueHistory = parsed.dialogueHistory || [];
            
            // 加载设置
            if (parsed.settings) {
                Object.assign(gameState.settings, parsed.settings);
            }
            
            console.log('游戏状态已加载');
            return true;
        }
    } catch (error) {
        console.error('加载游戏状态失败:', error);
    }
    return false;
}

// 重置游戏数据
function resetGameData() {
    if (confirm('确定要重置所有游戏数据吗？这将清除所有进度和成就。')) {
        try {
            localStorage.clear();
            location.reload(); // 重新加载页面以应用重置
        } catch (error) {
            console.error('重置游戏数据失败:', error);
            alert('重置失败，请刷新页面重试。');
        }
    }
}

// ==================== 进度保存系统 ====================

// 各英雄线路的幕定义
const heroActs = {
    liBai: [
        { id: 1, name: '第一幕·IFS国金中心', file: 'libai/li_bai_act1_ifs.html' },
        { id: 2, name: '第二幕·宽窄巷子', file: 'libai/li_bai_act2_kuanzhai.html' },
        { id: 3, name: '第三幕·东郊记忆', file: 'libai/li_bai_act3_dongjiao.html' },
        { id: 4, name: '第四幕·诗词问答', file: 'libai/li_bai_act4_quiz.html' },
        { id: 5, name: '第五幕·蜀地解谜', file: 'libai/li_bai_act5_puzzle.html' }
    ],
    zhugeLiang: [
        { id: 1, name: '第一幕·初到成都', file: 'zhuge/zhuge_act1.html' },
        { id: 2, name: '第二幕·太古里探秘', file: 'zhuge/zhuge_act2.html' },
        { id: 3, name: '第三幕·锦里寻踪', file: 'zhuge/zhuge_act3.html' },
        { id: 4, name: '第四幕·策略博弈', file: 'zhuge/zhuge_act4_game.html' },
        { id: 5, name: '第五幕·智谋问答', file: 'zhuge/zhuge_act5_quiz.html' }
    ],
    zhaoYun: [
        { id: 1, name: '第一幕·武侯祠守卫战', file: 'zhaoyun/zhao_yun_act1.html' },
        { id: 2, name: '第二幕·锦江突围', file: 'zhaoyun/zhao_yun_act2.html' },
        { id: 3, name: '第三幕·青城试炼', file: 'zhaoyun/zhao_yun_act3.html' },
        { id: 4, name: '第四幕·长坂反应', file: 'zhaoyun/zhao_yun_act4_game.html' },
        { id: 5, name: '第五幕·勇者问答', file: 'zhaoyun/zhao_yun_act5_quiz.html' }
    ]
};

// 保存进度：记录某英雄已到达的最高幕数
function saveProgress(heroId, actId) {
    try {
        const progress = JSON.parse(localStorage.getItem('heroProgress') || '{}');
        const currentMax = progress[heroId] || 0;
        // 只保存更高的幕数
        if (actId > currentMax) {
            progress[heroId] = actId;
            localStorage.setItem('heroProgress', JSON.stringify(progress));
            console.log(`进度已保存：${heroId} 第${actId}幕`);
        }
    } catch (error) {
        console.error('保存进度失败:', error);
    }
}

// 获取进度：某英雄已到达的最高幕数（0=未开始）
function getProgress(heroId) {
    try {
        const progress = JSON.parse(localStorage.getItem('heroProgress') || '{}');
        return progress[heroId] || 0;
    } catch (error) {
        console.error('读取进度失败:', error);
        return 0;
    }
}

// 获取所有英雄进度
function getAllProgress() {
    try {
        return JSON.parse(localStorage.getItem('heroProgress') || '{}');
    } catch (error) {
        return {};
    }
}

// 清除某英雄进度
function clearProgress(heroId) {
    try {
        const progress = JSON.parse(localStorage.getItem('heroProgress') || '{}');
        delete progress[heroId];
        localStorage.setItem('heroProgress', JSON.stringify(progress));
    } catch (error) {
        console.error('清除进度失败:', error);
    }
}

// 清除所有进度
function clearAllProgress() {
    try {
        localStorage.removeItem('heroProgress');
    } catch (error) {
        console.error('清除所有进度失败:', error);
    }
}

// 跳转到某英雄的指定幕
function goToAct(heroId, actId) {
    const acts = heroActs[heroId];
    if (!acts) return;
    const act = acts.find(a => a.id === actId);
    if (act) {
        // 添加 fresh 参数，让目标页面知道需要从头开始对话
        window.location.href = act.file + '?fresh=1';
    }
}

// 检查当前页面是否从续玩/选择进入（需要重置状态从头开始）
function isFreshEntry() {
    const params = new URLSearchParams(window.location.search);
    return params.get('fresh') === '1';
}

// 当fresh=1时，清除该幕对应的localStorage状态数据，让对话从头开始
// 并清除URL中的fresh参数，避免刷新时重复触发
function clearActStateOnFreshEntry(stateKey) {
    if (isFreshEntry()) {
        // 清除该幕的状态数据，这样loadState就不会恢复旧的currentStep
        localStorage.removeItem(stateKey);
        
        // 清除与该线路相关的独立状态key（游戏统计等），但保留跨幕累计属性
        const keysToClean = {
            'liBaiState': ['liBai_gameStats', 'liBai_quizScore'],
            'zhugeState': ['zhuge_strategyCount', 'zhuge_efficiencyCount'],
            'zhaoState': ['zhao_courage', 'zhao_guard']
        };
        if (keysToClean[stateKey]) {
            keysToClean[stateKey].forEach(key => localStorage.removeItem(key));
        }
        
        // 清除URL中的fresh参数
        const url = new URL(window.location);
        url.searchParams.delete('fresh');
        window.history.replaceState({}, '', url);
        console.log('fresh=1 检测到，已清除状态并重置URL');
    }
}

// ==================== 游魂鉴定系统 ====================

// 保存某条线的最终属性数据（通关时调用）
function saveSoulData(heroId, data) {
    try {
        const soulData = JSON.parse(localStorage.getItem('soulData') || '{}');
        soulData[heroId] = {
            ...data,
            completedAt: new Date().toISOString()
        };
        localStorage.setItem('soulData', JSON.stringify(soulData));
        console.log(`游魂数据已保存：${heroId}`, data);
    } catch (error) {
        console.error('保存游魂数据失败:', error);
    }
}

// 获取所有游魂数据
function getSoulData() {
    try {
        return JSON.parse(localStorage.getItem('soulData') || '{}');
    } catch (error) {
        console.error('读取游魂数据失败:', error);
        return {};
    }
}

// 判断游魂鉴定是否解锁（三条线全部通关）
function isSoulAnalysisUnlocked() {
    const progress = getAllProgress();
    const totalActs = 5;
    return (progress.liBai || 0) >= totalActs
        && (progress.zhugeLiang || 0) >= totalActs
        && (progress.zhaoYun || 0) >= totalActs;
}

// 检查某条线是否已通关（soulData中有记录）
function isHeroLineCompleted(heroId) {
    const soulData = getSoulData();
    return !!soulData[heroId];
}

// 获取某条线最终属性（通关后回看时用固定值）
// 返回格式：{ poem/wine, strategy/efficiency, courage/guard } 或 null
function getHeroFinalAttrs(heroId) {
    const soulData = getSoulData();
    if (!soulData[heroId]) return null;
    const d = soulData[heroId];
    // 支持三种数据格式
    if (heroId === 'liBai') {
        return { poem: d.poem || 0, wine: d.wine || 0 };
    } else if (heroId === 'zhugeLiang') {
        return { strategy: d.strategy || 0, efficiency: d.efficiency || 0 };
    } else if (heroId === 'zhaoYun') {
        return { courage: d.courage || 0, guard: d.guard || 0 };
    }
    return null;
}

// ==================== 通用UI工具函数 ====================

// 显示加载动画
function showLoading() {
    // 可以在这里添加加载动画
    document.body.style.opacity = '0.8';
}

// 隐藏加载动画
function hideLoading() {
    document.body.style.opacity = '1';
}

// 显示提示消息
function showMessage(message, type = 'info', duration = 3000) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        animation: fadeInOut ${duration}ms ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 300);
    }, duration);
}

// ==================== 页面导航函数 ====================

// 跳转到指定页面
function navigateTo(page, params = {}) {
    let url = page + '.html';
    
    // 添加查询参数
    if (Object.keys(params).length > 0) {
        const query = new URLSearchParams(params).toString();
        url += '?' + query;
    }
    
    window.location.href = url;
}

// 返回首页
function goHome() {
    window.location.href = '../index.html';
}

// 选择英雄
function selectHero(heroId) {
    if (!heroes[heroId]) {
        showMessage('英雄不存在', 'error');
        return;
    }
    
    gameState.currentHero = heroId;
    saveGameState();
    
    // 始终从第一幕开始（首页会处理续玩逻辑）
    goToAct(heroId, 1);
}

// ==================== 成就系统函数 ====================

// 解锁成就
function unlockAchievement(id, title, description) {
    if (!gameState.achievements.some(ach => ach.id === id)) {
        gameState.achievements.push({
            id,
            title,
            description,
            unlockedAt: new Date().toISOString()
        });
        
        saveGameState();
        
        // 显示成就解锁通知
        showMessage(`🎉 成就解锁: ${title}`, 'success');
        
        // 检查是否达成"完美收集者"
        checkAllAchievementsAchievement();
        
        return true;
    }
    return false;
}

// 检查成就是否已解锁
function hasAchievement(id) {
    return gameState.achievements.some(ach => ach.id === id);
}

// 获取所有成就
function getAllAchievements() {
    return gameState.achievements;
}

// 检查全能学徒成就（体验所有三条英雄路线）
function checkAllHeroesAchievement() {
    const progress = getAllProgress();
    const allHeroesComplete = 
        (progress.liBai || 0) >= 5 &&
        (progress.zhugeLiang || 0) >= 5 &&
        (progress.zhaoYun || 0) >= 5;
    
    if (allHeroesComplete) {
        unlockAchievement('all_heroes', '全能学徒', '体验所有三条英雄路线');
    }
}

// 检查完美收集者成就（解锁所有成就）
function checkAllAchievementsAchievement() {
    // 获取所有成就定义（从allAchievements变量），排除自身
    const totalCount = typeof allAchievements !== 'undefined' ? allAchievements.length - 1 : 0;
    const unlockedCount = gameState.achievements.length;
    
    if (totalCount > 0 && unlockedCount >= totalCount) {
        unlockAchievement('all_achievements', '完美收集者', '解锁所有成就');
    }
}

// ==================== 设置管理函数 ====================

// 保存设置
function saveSettings() {
    try {
        localStorage.setItem('gameSettings', JSON.stringify(gameState.settings));
        console.log('设置已保存');
    } catch (error) {
        console.error('保存设置失败:', error);
    }
}

// 加载设置
function loadSettings() {
    try {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(gameState.settings, parsed);
            
            // 应用设置
            applySettings();
            
            console.log('设置已加载');
            return true;
        }
    } catch (error) {
        console.error('加载设置失败:', error);
    }
    return false;
}

// 应用设置到UI
function applySettings() {
    // 应用音量设置到 HTML audio 元素
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        audio.volume = gameState.settings.musicVolume;
    });
    
    // 应用音量设置到 bgmManager
    if (bgmManager && bgmManager.audio) {
        bgmManager.audio.volume = gameState.settings.musicVolume;
    }
    
    // 应用文本速度（可以通过CSS类实现）
    document.body.classList.remove('text-speed-fast', 'text-speed-medium', 'text-speed-slow');
    document.body.classList.add(`text-speed-${gameState.settings.textSpeed}`);
    
    // 应用主题
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${gameState.settings.theme}`);
}

// ==================== 通用工具函数 ====================

// 延迟执行
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 生成随机整数
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 格式化时间（秒转换为分:秒）
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 创建DOM元素
function createElement(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
}

// ==================== BGM 音乐管理器 ====================

const bgmManager = {
    audio: null,           // Audio 对象
    currentTrack: null,    // 当前播放的曲目
    isPlaying: false,
    
    // 曲目映射（使用 getter 动态计算路径）
    get tracks() {
        const root = getRootPath();
        return {
            'home': `${root}music/home-bgm.mp3`,
            'liBai': `${root}music/libai-bgm.mp3`,
            'zhugeLiang': `${root}music/zhuge-bgm.mp3`,
            'zhaoYun': `${root}music/zhaoyun-bgm.mp3`
        };
    },
    
    // 根据 URL 路径检测当前曲目
    detectCurrentTrack() {
        const path = window.location.pathname.toLowerCase();
        const filename = path.split('/').pop().replace('.html', '');
        
        if (filename.includes('home')) return 'home';
        if (filename.includes('libai') || filename.includes('li_bai')) return 'liBai';
        if (filename.includes('zhuge')) return 'zhugeLiang';
        if (filename.includes('zhaoyun') || filename.includes('zhao_yun')) return 'zhaoYun';
        
        return 'home';
    },
    
    // 初始化 BGM
    init() {
        if (this.audio) return;
        
        this.audio = new Audio();
        this.audio.loop = true;
        this.audio.preload = 'auto';
        
        // 从设置中恢复音量
        this.audio.volume = gameState.settings.musicVolume;
        
        // 添加 ended 事件处理（循环播放）
        this.audio.addEventListener('ended', () => {
            this.audio.currentTime = 0;
            this.audio.play().catch(e => console.warn('BGM 播放失败:', e));
        });
        
        console.log('BGM 管理器已初始化');
    },
    
    // 播放指定曲目
    play(trackKey) {
        if (!this.audio) this.init();

        const track = this.tracks[trackKey] || this.tracks['home'];

        // ★ 尝试从 sessionStorage 恢复同曲目的播放进度（页面跳转后无缝续播）
        const savedState = this.loadState();
        if (savedState && savedState.trackKey === trackKey && savedState.isPlaying) {
            this.currentTrack = trackKey;
            this.audio.src = track;
            this.audio.load();

            // 基础恢复时间 + 补偿跳转耗时（让时间轴连续推进）
            let savedTime = Math.max(0, savedState.currentTime || 0);
            if (savedState.savedAt) {
                const elapsed = (Date.now() - savedState.savedAt) / 1000; // 跳转耗时（秒）
                const bufferOffset = 2.2; // 额外缓冲：覆盖 DOM/加载/事件等隐式延迟
                savedTime += elapsed + bufferOffset;
                console.log(`BGM 时间轴补偿: 基础${savedState.currentTime.toFixed(1)}s + 跳转${elapsed.toFixed(1)}s + 缓冲${bufferOffset}s = ${savedTime.toFixed(1)}s`);
            }

            // 需要等音频元数据加载后才能设置 currentTime
            const resumeHandler = () => {
                // 如果补偿后超过音频时长，从头循环（防止 NaN 或超限）
                const targetTime = this.audio.duration ? Math.min(savedTime, this.audio.duration) : savedTime;
                this.audio.currentTime = targetTime;
                this.audio.removeEventListener('loadeddata', resumeHandler);
            };
            this.audio.addEventListener('loadeddata', resumeHandler);

            // 续播时先静音，避免页面跳转后的"炸响"顿感
            this.audio.volume = 0;
            this.audio.play().then(() => {
                this.isPlaying = true;
                console.log(`BGM 无缝续播: ${trackKey} @ ${savedTime.toFixed(1)}s`);
                // 淡入到目标音量（~600ms）
                this._fadeIn(gameState.settings.musicVolume);
                sessionStorage.removeItem('bgmState');
            }).catch(e => {
                console.warn('BGM 续播失败:', e);
                sessionStorage.removeItem('bgmState');
            });
            return;
        }

        // 清除可能残留的旧状态
        sessionStorage.removeItem('bgmState');

        if (this.currentTrack === trackKey && this.audio.src) {
            // 同一曲目，只恢复播放
            if (this.audio.paused) {
                this.audio.play().catch(e => console.warn('BGM 播放失败:', e));
                this.isPlaying = true;
            }
            return;
        }

        this.currentTrack = trackKey;
        this.audio.src = track;
        this.audio.load();
        this.audio.play().then(() => {
            this.isPlaying = true;
            console.log(`BGM 播放中: ${trackKey} - ${track}`);
        }).catch(e => {
            console.warn('BGM 播放失败:', e);
            this.isPlaying = false;
        });
    },
    
    // 暂停
    pause() {
        if (this.audio && !this.audio.paused) {
            this.audio.pause();
            this.isPlaying = false;
        }
    },
    
    // 恢复播放
    resume() {
        if (this.audio && this.audio.paused && this.audio.src) {
            this.audio.play().catch(e => console.warn('BGM 恢复失败:', e));
            this.isPlaying = true;
        }
    },

    // 淡入到目标音量（用于页面跳转后的续播，避免"炸响"顿感）
    _fadeIn(targetVolume, duration = 3000) {
        if (!this.audio) return;
        const start = this.audio.volume || 0;
        const startTime = performance.now();
        const step = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            // easeOut 曲线，前快后慢更自然
            const eased = 1 - Math.pow(1 - progress, 3);
            this.audio.volume = start + (targetVolume - start) * eased;
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    },
    
    // 设置音量 (0-1)
    setVolume(volume) {
        const v = Math.max(0, Math.min(1, volume));
        if (this.audio) {
            this.audio.volume = v;
        }
        // 同时更新游戏设置并持久化
        gameState.settings.musicVolume = v;
        saveSettings();
    },
    
    // 获取当前音量 (0-1)
    getVolume() {
        return this.audio ? this.audio.volume : gameState.settings.musicVolume;
    },
    
    // 停止
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.isPlaying = false;
        }
    },

    // 保存当前 BGM 状态到 sessionStorage（页面跳转前自动调用）
    saveState() {
        if (!this.audio) return;
        try {
            const state = {
                trackKey: this.currentTrack,
                currentTime: this.audio.currentTime || 0,
                isPlaying: !this.audio.paused && !!this.audio.src,
                savedAt: Date.now()  // 记录保存时刻，用于续播时补偿跳转耗时
            };
            sessionStorage.setItem('bgmState', JSON.stringify(state));
        } catch (e) {
            console.warn('BGM 状态保存失败:', e);
        }
    },

    // 从 sessionStorage 加载保存的 BGM 状态
    loadState() {
        try {
            const raw = sessionStorage.getItem('bgmState');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.warn('BGM 状态读取失败:', e);
            return null;
        }
    },

    // 静音切换
    toggleMute() {
        if (this.audio) {
            if (this.audio.volume > 0) {
                this._previousVolume = this.audio.volume;
                this.audio.volume = 0;
            } else {
                this.audio.volume = this._previousVolume || 0.5;
            }
        }
    }
};

// ==================== 页面初始化 ====================

// 初始化页面
function initPage() {
    // 全局缩放 90%
    const zoomStyle = document.createElement('style');
    zoomStyle.id = 'global-zoom-style';
    zoomStyle.textContent = 'html, body { zoom: 0.9; transform-origin: top left; }';
    document.head.appendChild(zoomStyle);

    // 加载游戏状态和设置
    loadGameState();
    loadSettings();
    
    // 初始化并播放 BGM
    bgmManager.init();
    const track = bgmManager.detectCurrentTrack();
    bgmManager.play(track);

    // 页面即将卸载时自动保存 BGM 状态
    window.addEventListener('beforeunload', () => bgmManager.saveState());
    
    // 应用设置
    applySettings();
    
    // 绑定通用事件
    bindCommonEvents();
    
    console.log('页面已初始化');
}

// 绑定通用事件
function bindCommonEvents() {
    // 注入右上角导航按钮
    injectCornerNav();
    
    // 返回首页按钮
    const backButtons = document.querySelectorAll('[data-action="go-home"]');
    backButtons.forEach(button => {
        button.addEventListener('click', goHome);
    });
    
    // 英雄选择按钮（仅在非首页生效，首页有自己的续玩逻辑）
    const isHomePage = document.querySelector('.home-hero') !== null;
    if (!isHomePage) {
        const heroButtons = document.querySelectorAll('[data-hero]');
        heroButtons.forEach(button => {
            button.addEventListener('click', () => {
                const heroId = button.getAttribute('data-hero');
                selectHero(heroId);
            });
        });
    }
    
    // 成就馆按钮
    const achievementButtons = document.querySelectorAll('[data-action="achievements"]');
    achievementButtons.forEach(button => {
        button.addEventListener('click', () => navigateTo('achievements'));
    });
    
    // 设置按钮
    const settingButtons = document.querySelectorAll('[data-action="settings"]');
    settingButtons.forEach(button => {
        button.addEventListener('click', () => navigateTo('settings'));
    });
    
   
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

// 导出全局函数（供页面使用）
window.gameState = gameState;
window.heroes = heroes;
window.saveGameState = saveGameState;
window.loadGameState = loadGameState;
window.resetGameData = resetGameData;
window.navigateTo = navigateTo;
window.goHome = goHome;
window.selectHero = selectHero;
window.unlockAchievement = unlockAchievement;
window.hasAchievement = hasAchievement;
window.getAllAchievements = getAllAchievements;
window.checkAllHeroesAchievement = checkAllHeroesAchievement;
window.checkAllAchievementsAchievement = checkAllAchievementsAchievement;
window.heroActs = heroActs;
window.saveSettings = saveSettings;
window.loadSettings = loadSettings;
window.applySettings = applySettings;
window.showMessage = showMessage;
window.delay = delay;
window.randomInt = randomInt;
window.formatTime = formatTime;
window.createElement = createElement;
window.saveProgress = saveProgress;
window.getProgress = getProgress;
window.getAllProgress = getAllProgress;
window.clearProgress = clearProgress;
window.clearAllProgress = clearAllProgress;
window.goToAct = goToAct;
window.isFreshEntry = isFreshEntry;
window.clearActStateOnFreshEntry = clearActStateOnFreshEntry;
window.saveSoulData = saveSoulData;
window.getSoulData = getSoulData;
window.isSoulAnalysisUnlocked = isSoulAnalysisUnlocked;
window.bgmManager = bgmManager;

// ==================== 全局浮窗系统 ====================

const modalManager = {
    currentModal: null,
    isClosing: false,
    
    // 打开弹窗
    async open(modalName) {
        // 如果正在关闭，等待关闭完成
        if (this.isClosing) {
            await new Promise(resolve => setTimeout(resolve, 350));
        }
        
        // 如果已存在弹窗，强制关闭
        if (this.currentModal) {
            this.forceClose();
        }
        
        try {
            // 获取弹窗内容（使用根路径解决子目录问题）
            const response = await fetch(`${getRootPath()}${modalName}.html`);
            if (!response.ok) throw new Error('加载失败');
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 获取body内容
            const bodyContent = doc.body.innerHTML;
            
            // 获取内联style
            const styles = doc.querySelectorAll('style');
            let styleContent = '';
            styles.forEach(style => {
                styleContent += style.textContent;
            });
            
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.id = 'modal-overlay';
            
            // 创建弹窗容器
            const modal = document.createElement('div');
            modal.className = 'modal-content';
            modal.id = 'modal-content';
            
            // 注入样式
            const styleEl = document.createElement('style');
            styleEl.textContent = styleContent;
            modal.appendChild(styleEl);
            
            // 注入内容
            modal.insertAdjacentHTML('beforeend', bodyContent);
            
            // 添加关闭按钮（只用X按钮关闭）
            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal-close-btn';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', () => this.close());
            modal.appendChild(closeBtn);
            
            // 组装并添加到body
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            // 执行新加载脚本中的初始化代码
            // 使用间接方式执行脚本，避免全局作用域重复声明问题
            const scripts = modal.querySelectorAll('script');
            scripts.forEach(script => {
                try {
                    // 使用 Function 构造函数执行脚本内容
                    const fn = new Function(script.textContent);
                    fn();
                } catch (e) {
                    // 忽略重复声明等运行时错误
                    if (e instanceof SyntaxError && e.message.includes('already been declared')) {
                        console.warn('脚本变量已存在，跳过声明（正常行为）');
                    } else {
                        console.warn('脚本执行警告:', e.message);
                    }
                }
            });
            
            // 淡入动画
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                modal.style.opacity = '1';
                modal.style.transform = 'translate(-50%, -50%) scale(1)';
            });
            
            this.currentModal = { overlay, modal, name: modalName };
            
            // 触发页面初始化
            if (typeof initSettings === 'function') initSettings();
            if (typeof initAchievements === 'function') initAchievements();
            
        } catch (error) {
            console.error('打开弹窗失败:', error);
            showMessage('加载失败，请重试', 'error');
        }
    },
    
    // 关闭弹窗（带动画）
    close() {
        if (!this.currentModal) return;
        this.isClosing = true;
        
        const { overlay, modal } = this.currentModal;
        
        // 淡出动画
        overlay.style.opacity = '0';
        modal.style.opacity = '0';
        modal.style.transform = 'translate(-50%, -50%) scale(0.9)';
        
        // 动画结束后移除
        setTimeout(() => {
            overlay.remove();
            this.currentModal = null;
            this.isClosing = false;
        }, 300);
    },
    
    // 强制关闭（无动画，立即移除）
    forceClose() {
        if (!this.currentModal) return;
        const { overlay } = this.currentModal;
        overlay.remove();
        this.currentModal = null;
        this.isClosing = false;
    }
};

// 注入右上角导航按钮
function injectCornerNav() {
    // 检查是否已注入
    if (document.getElementById('corner-nav')) return;
    
    const nav = document.createElement('div');
    nav.id = 'corner-nav';
    nav.innerHTML = `
        <button class="corner-btn" id="corner-settings" title="设置">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.03 7.03 0 00-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.49.37 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 118.4 12 3.6 3.6 0 0112 15.6z"/>
            </svg>
        </button>
        <button class="corner-btn" id="corner-achievements" title="成就">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
            </svg>
        </button>
    `;
    
    document.body.appendChild(nav);
    
    // 绑定点击事件（file:// 下直接跳转页面，避免 CORS 拦截 fetch）
    const isFileProtocol = location.protocol === 'file:';
    document.getElementById('corner-settings').addEventListener('click', () => {
        if (isFileProtocol) {
            location.href = getRootPath() + 'settings.html';
        } else {
            modalManager.open('settings');
        }
    });
    
    document.getElementById('corner-achievements').addEventListener('click', () => {
        if (isFileProtocol) {
            location.href = getRootPath() + 'achievements.html';
        } else {
            modalManager.open('achievements');
        }
    });
}

// 导出到window（必须在定义之后）
window.modalManager = modalManager;
window.injectCornerNav = injectCornerNav;