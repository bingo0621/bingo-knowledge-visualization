/**
 * BINGO知识之象 - 主应用程序
 * 应用程序入口和全局功能管理
 */

class App {
    constructor() {
        this.isReady = false;
        this.init();
    }

    /**
     * 初始化应用程序
     */
    async init() {
        try {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                await this.start();
            }
        } catch (error) {
            console.error('应用程序初始化失败:', error);
        }
    }

    /**
     * 启动应用程序
     */
    async start() {
        console.log('🚀 BINGO知识之象正在启动...');

        try {
            // 初始化Toast管理器
            this.initToastManager();

            // 初始化全局事件监听
            this.initGlobalEvents();

            // 检查服务器连接
            await this.checkServerHealth();

            // 应用程序已就绪
            this.isReady = true;
            console.log('✅ BINGO知识之象启动完成');

            // 显示欢迎消息
            this.showWelcomeMessage();

        } catch (error) {
            console.error('应用程序启动失败:', error);
            this.showToast('启动失败', '应用程序启动时遇到问题，请刷新页面重试', 'error');
        }
    }

    /**
     * 初始化Toast通知管理器
     */
    initToastManager() {
        window.toastManager = new ToastManager();
    }

    /**
     * 初始化全局事件
     */
    initGlobalEvents() {
        // 全局键盘快捷键
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
        
        // 窗口大小变化
        window.addEventListener('resize', () => this.handleWindowResize());
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // 在线状态变化
        window.addEventListener('online', () => this.handleOnlineStatusChange(true));
        window.addEventListener('offline', () => this.handleOnlineStatusChange(false));

        // 页面卸载前确认
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
    }

    /**
     * 检查服务器健康状态
     */
    async checkServerHealth() {
        try {
            const health = await window.apiManager.healthCheck();
            console.log('服务器状态:', health);
            return health;
        } catch (error) {
            console.warn('服务器健康检查失败:', error);
            throw new Error('无法连接到服务器');
        }
    }

    /**
     * 处理全局键盘事件
     */
    handleGlobalKeydown(e) {
        // Ctrl+/ 或 Cmd+/ 显示快捷键帮助
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.showKeyboardShortcuts();
            return;
        }

        // Ctrl+, 或 Cmd+, 打开设置
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            if (window.configManager) {
                window.configManager.openConfig();
            }
            return;
        }

        // Ctrl+Enter 或 Cmd+Enter 开始生成
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (window.contentGenerator && !window.contentGenerator.isGenerating) {
                window.contentGenerator.startGeneration();
            }
            return;
        }

        // Escape 关闭模态框
        if (e.key === 'Escape') {
            this.closeActiveModals();
            return;
        }
    }

    /**
     * 处理窗口大小变化
     */
    handleWindowResize() {
        // 可以在这里添加响应式布局调整逻辑
        console.log('窗口大小已变化:', window.innerWidth, 'x', window.innerHeight);
    }

    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('页面已隐藏');
            // 页面不可见时暂停一些操作
        } else {
            console.log('页面已显示');
            // 页面可见时恢复操作
        }
    }

    /**
     * 处理在线状态变化
     */
    handleOnlineStatusChange(isOnline) {
        if (isOnline) {
            console.log('网络已连接');
            this.showToast('网络已连接', '已重新连接到网络', 'success');
        } else {
            console.log('网络已断开');
            this.showToast('网络已断开', '请检查网络连接', 'warning');
        }
    }

    /**
     * 处理页面卸载前事件
     */
    handleBeforeUnload(e) {
        // 如果正在生成内容，提示用户确认
        if (window.contentGenerator && window.contentGenerator.isGenerating) {
            const message = '正在生成内容，确定要离开吗？';
            e.returnValue = message;
            return message;
        }
    }

    /**
     * 关闭所有活动的模态框
     */
    closeActiveModals() {
        // 关闭配置模态框
        if (window.configManager && window.configManager.isConfigOpen) {
            window.configManager.closeConfig();
        }

        // 可以添加其他模态框的关闭逻辑
    }

    /**
     * 显示键盘快捷键帮助
     */
    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Ctrl + /', desc: '显示快捷键帮助' },
            { key: 'Ctrl + ,', desc: '打开设置' },
            { key: 'Ctrl + Enter', desc: '开始生成' },
            { key: 'Escape', desc: '关闭模态框' }
        ];

        let message = '键盘快捷键：\n';
        shortcuts.forEach(shortcut => {
            message += `${shortcut.key}: ${shortcut.desc}\n`;
        });

        alert(message);
    }

    /**
     * 显示欢迎消息
     */
    showWelcomeMessage() {
        // 检查是否是首次访问
        const isFirstVisit = !localStorage.getItem('bingo_visited');
        
        if (isFirstVisit) {
            localStorage.setItem('bingo_visited', 'true');
            
            setTimeout(() => {
                this.showToast(
                    '欢迎使用BINGO知识之象',
                    '开始您的知识可视化之旅！',
                    'info'
                );
            }, 1000);
        }
    }

    /**
     * 显示Toast通知
     */
    showToast(title, message, type = 'info') {
        if (window.toastManager) {
            window.toastManager.show(title, message, type);
        }
    }
}

/**
 * Toast通知管理器
 */
class ToastManager {
    constructor() {
        this.container = this.createContainer();
        this.toasts = new Map();
        this.maxToasts = 5;
    }

    /**
     * 创建Toast容器
     */
    createContainer() {
        let container = document.getElementById('toastContainer');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(container);
        }
        
        return container;
    }

    /**
     * 显示Toast通知
     */
    show(title, message, type = 'info', duration = 5000) {
        const id = this.generateId();
        const toast = this.createToast(id, title, message, type, duration);
        
        // 添加到容器
        this.container.appendChild(toast);
        this.toasts.set(id, toast);
        
        // 限制Toast数量
        this.limitToasts();
        
        // 自动移除
        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
        
        // 添加进入动画
        setTimeout(() => {
            toast.classList.add('animate-slide-right');
        }, 10);
        
        return id;
    }

    /**
     * 创建Toast元素
     */
    createToast(id, title, message, type, duration) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.dataset.toastId = id;
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon">
                ${icon}
            </div>
            <div class="toast-content">
                <div class="toast-title">${this.escapeHtml(title)}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" onclick="window.toastManager.remove('${id}')">
                <i class="fas fa-times"></i>
            </button>
            ${duration > 0 ? '<div class="toast-progress"></div>' : ''}
        `;
        
        return toast;
    }

    /**
     * 获取类型对应的图标
     */
    getIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle text-success"></i>',
            error: '<i class="fas fa-times-circle text-error"></i>',
            warning: '<i class="fas fa-exclamation-triangle text-warning"></i>',
            info: '<i class="fas fa-info-circle text-klein"></i>'
        };
        
        return icons[type] || icons.info;
    }

    /**
     * 移除Toast通知
     */
    remove(id) {
        const toast = this.toasts.get(id);
        
        if (toast) {
            // 添加退出动画
            toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                this.toasts.delete(id);
            }, 300);
        }
    }

    /**
     * 限制Toast数量
     */
    limitToasts() {
        const toastElements = this.container.children;
        
        while (toastElements.length > this.maxToasts) {
            const firstToast = toastElements[0];
            const id = firstToast.dataset.toastId;
            this.remove(id);
        }
    }

    /**
     * 清除所有Toast
     */
    clear() {
        const toastIds = Array.from(this.toasts.keys());
        toastIds.forEach(id => this.remove(id));
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 添加退出动画CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// 创建并启动应用程序
window.app = new App();

// 全局错误处理
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.error);
    
    if (window.toastManager) {
        window.toastManager.show(
            '发生错误',
            '应用程序遇到了问题，请尝试刷新页面',
            'error'
        );
    }
});

// 全局Promise错误处理
window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise错误:', e.reason);
    
    if (window.toastManager) {
        window.toastManager.show(
            '异步操作失败',
            '某个操作未能完成，请重试',
            'error'
        );
    }
});

// 导出到全局作用域
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, ToastManager };
}