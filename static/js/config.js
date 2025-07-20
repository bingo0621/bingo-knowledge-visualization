/**
 * BINGO知识之象 - 配置管理模块
 * 处理配置界面和设置管理
 */

class ConfigManager {
    constructor() {
        this.currentConfig = null;
        this.isConfigOpen = false;
        this.init();
    }

    /**
     * 初始化配置管理器
     */
    init() {
        this.bindEvents();
        this.loadCurrentConfig();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 配置按钮
        const configBtn = document.getElementById('configBtn');
        const closeConfigBtn = document.getElementById('closeConfigBtn');
        const cancelConfigBtn = document.getElementById('cancelConfigBtn');
        const saveConfigBtn = document.getElementById('saveConfigBtn');
        const configOverlay = document.getElementById('configOverlay');

        if (configBtn) {
            configBtn.addEventListener('click', () => this.openConfig());
        }

        if (closeConfigBtn) {
            closeConfigBtn.addEventListener('click', () => this.closeConfig());
        }

        if (cancelConfigBtn) {
            cancelConfigBtn.addEventListener('click', () => this.closeConfig());
        }

        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => this.saveConfig());
        }

        if (configOverlay) {
            configOverlay.addEventListener('click', () => this.closeConfig());
        }

        // 提供商选择变化
        const providerSelect = document.getElementById('providerSelect');
        if (providerSelect) {
            providerSelect.addEventListener('change', (e) => this.onProviderChange(e.target.value));
        }

        // API Key显示/隐藏切换
        const toggleApiKey = document.getElementById('toggleApiKey');
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (toggleApiKey && apiKeyInput) {
            toggleApiKey.addEventListener('click', () => {
                const isPassword = apiKeyInput.type === 'password';
                apiKeyInput.type = isPassword ? 'text' : 'password';
                toggleApiKey.innerHTML = isPassword ? 
                    '<i class="fas fa-eye-slash"></i>' : 
                    '<i class="fas fa-eye"></i>';
            });
        }

        // 测试连接按钮
        const testConnectionBtn = document.getElementById('testConnectionBtn');
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => this.testConnection());
        }

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isConfigOpen) {
                this.closeConfig();
            }
        });
    }

    /**
     * 加载当前配置
     */
    async loadCurrentConfig() {
        try {
            const config = await window.apiManager.getConfig();
            this.currentConfig = config;
            this.updateConfigStatus();
        } catch (error) {
            console.error('加载配置失败:', error);
            this.showToast('加载配置失败', error.message, 'error');
        }
    }

    /**
     * 更新配置状态显示
     */
    updateConfigStatus() {
        const configStatus = document.getElementById('configStatus');
        if (!configStatus || !this.currentConfig) return;

        const isConfigured = this.currentConfig.is_configured;
        const provider = this.currentConfig.api?.provider || 'unknown';
        const model = this.currentConfig.api?.model || 'unknown';

        if (isConfigured) {
            configStatus.innerHTML = `
                <div class="status-indicator configured">
                    <i class="fas fa-check-circle"></i>
                    <span>已配置 ${provider} - ${model}</span>
                </div>
            `;
        } else {
            configStatus.innerHTML = `
                <div class="status-indicator not-configured">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>请先配置API密钥以开始使用</span>
                </div>
            `;
        }

        // 更新生成按钮状态
        this.updateGenerateButton();
    }

    /**
     * 更新生成按钮状态
     */
    updateGenerateButton() {
        const generateBtn = document.getElementById('generateBtn');
        const topicInput = document.getElementById('topicInput');
        
        if (!generateBtn || !this.currentConfig) return;

        const isConfigured = this.currentConfig.is_configured;
        const hasInput = topicInput && topicInput.value.trim().length > 0;

        generateBtn.disabled = !isConfigured || !hasInput;
        
        if (!isConfigured) {
            generateBtn.title = '请先配置API密钥';
        } else if (!hasInput) {
            generateBtn.title = '请输入要可视化的主题';
        } else {
            generateBtn.title = '';
        }
    }

    /**
     * 打开配置模态框
     */
    openConfig() {
        const configModal = document.getElementById('configModal');
        if (!configModal) return;

        this.isConfigOpen = true;
        configModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // 填充当前配置
        this.populateConfigForm();
        
        // 聚焦到第一个输入框
        setTimeout(() => {
            const firstInput = configModal.querySelector('select, input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    /**
     * 关闭配置模态框
     */
    closeConfig() {
        const configModal = document.getElementById('configModal');
        if (!configModal) return;

        this.isConfigOpen = false;
        configModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    /**
     * 填充配置表单
     */
    populateConfigForm() {
        if (!this.currentConfig) return;

        const { api, ui } = this.currentConfig;

        // API配置
        this.setSelectValue('providerSelect', api?.provider || 'gemini');
        this.setInputValue('apiKeyInput', ''); // 出于安全考虑，不显示API密钥
        this.setInputValue('baseUrlInput', api?.base_url || '');
        
        // 更新模型选项和选择
        this.onProviderChange(api?.provider || 'gemini');
        this.setSelectValue('modelSelect', api?.model || 'gemini-2.5-pro');

        // UI配置
        this.setSelectValue('themeSelect', ui?.theme || 'klein-blue');
        this.setSelectValue('languageSelect', ui?.language || 'zh-CN');
    }

    /**
     * 设置选择框值
     */
    setSelectValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    }

    /**
     * 设置输入框值
     */
    setInputValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    }

    /**
     * 提供商变化处理
     */
    onProviderChange(provider) {
        const baseUrlGroup = document.getElementById('baseUrlGroup');
        const modelSelect = document.getElementById('modelSelect');

        // 显示/隐藏Base URL输入框
        if (baseUrlGroup) {
            if (provider === 'custom') {
                baseUrlGroup.classList.remove('hidden');
            } else {
                baseUrlGroup.classList.add('hidden');
            }
        }

        // 更新模型选项
        if (modelSelect) {
            modelSelect.innerHTML = this.getModelOptions(provider);
        }
    }

    /**
     * 获取模型选项
     */
    getModelOptions(provider) {
        const options = {
            gemini: [
                { value: 'gemini-2.5-pro', text: 'Gemini 2.5 Pro' },
                { value: 'gemini-1.5-pro', text: 'Gemini 1.5 Pro' },
                { value: 'gemini-1.5-flash', text: 'Gemini 1.5 Flash' }
            ],
            openai: [
                { value: 'gpt-4', text: 'GPT-4' },
                { value: 'gpt-4-turbo', text: 'GPT-4 Turbo' },
                { value: 'gpt-3.5-turbo', text: 'GPT-3.5 Turbo' }
            ],
            custom: [
                { value: 'default', text: '默认模型' },
                { value: 'custom-model', text: '自定义模型' }
            ]
        };

        const providerOptions = options[provider] || options.custom;
        return providerOptions.map(option => 
            `<option value="${option.value}">${option.text}</option>`
        ).join('');
    }

    /**
     * 收集配置表单数据
     */
    collectConfigData() {
        return {
            provider: document.getElementById('providerSelect')?.value || 'gemini',
            api_key: document.getElementById('apiKeyInput')?.value || '',
            base_url: document.getElementById('baseUrlInput')?.value || '',
            model: document.getElementById('modelSelect')?.value || 'gemini-2.5-pro'
        };
    }

    /**
     * 验证配置数据
     */
    validateConfig(config) {
        const errors = [];

        if (!config.api_key.trim()) {
            errors.push('API密钥不能为空');
        }

        if (config.provider === 'custom' && !config.base_url.trim()) {
            errors.push('自定义API需要提供Base URL');
        }

        if (config.base_url && !this.isValidURL(config.base_url)) {
            errors.push('Base URL格式不正确');
        }

        return errors;
    }

    /**
     * 验证URL格式
     */
    isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * 保存配置
     */
    async saveConfig() {
        const saveBtn = document.getElementById('saveConfigBtn');
        if (!saveBtn) return;

        // 收集配置数据
        const config = this.collectConfigData();

        // 验证配置
        const errors = this.validateConfig(config);
        if (errors.length > 0) {
            this.showToast('配置验证失败', errors.join('、'), 'error');
            return;
        }

        // 显示保存状态
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i>保存中...';
        saveBtn.disabled = true;

        try {
            const result = await window.apiManager.updateAPIConfig(config);
            
            if (result.success) {
                this.showToast('配置保存成功', result.message, 'success');
                
                // 重新加载配置
                await this.loadCurrentConfig();
                
                // 关闭模态框
                this.closeConfig();
            } else {
                this.showToast('配置保存失败', result.message, 'error');
            }
        } catch (error) {
            console.error('保存配置失败:', error);
            this.showToast('配置保存失败', error.message, 'error');
        } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }

    /**
     * 测试连接
     */
    async testConnection() {
        const testBtn = document.getElementById('testConnectionBtn');
        if (!testBtn) return;

        // 收集配置数据
        const config = this.collectConfigData();

        // 验证配置
        const errors = this.validateConfig(config);
        if (errors.length > 0) {
            this.showToast('配置验证失败', errors.join('、'), 'error');
            return;
        }

        // 显示测试状态
        const originalText = testBtn.innerHTML;
        testBtn.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i>测试中...';
        testBtn.disabled = true;

        // 创建或更新连接状态指示器
        this.updateConnectionStatus('testing', '正在测试连接...');

        try {
            const result = await window.apiManager.testConnection(config);
            
            if (result.success) {
                this.updateConnectionStatus('success', result.message);
                this.showToast('连接测试成功', result.message, 'success');
            } else {
                this.updateConnectionStatus('error', result.message);
                this.showToast('连接测试失败', result.message, 'error');
            }
        } catch (error) {
            console.error('连接测试失败:', error);
            this.updateConnectionStatus('error', error.message);
            this.showToast('连接测试失败', error.message, 'error');
        } finally {
            testBtn.innerHTML = originalText;
            testBtn.disabled = false;
        }
    }

    /**
     * 更新连接状态指示器
     */
    updateConnectionStatus(status, message) {
        const testBtn = document.getElementById('testConnectionBtn');
        if (!testBtn) return;

        // 移除旧的状态指示器
        const oldStatus = testBtn.parentNode.querySelector('.connection-status');
        if (oldStatus) {
            oldStatus.remove();
        }

        // 创建新的状态指示器
        const statusDiv = document.createElement('div');
        statusDiv.className = `connection-status ${status}`;
        
        let icon = '';
        switch (status) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-times-circle"></i>';
                break;
            case 'testing':
                icon = '<i class="fas fa-spinner animate-spin"></i>';
                break;
        }
        
        statusDiv.innerHTML = `${icon}<span>${message}</span>`;
        testBtn.parentNode.appendChild(statusDiv);

        // 自动移除成功/错误状态（5秒后）
        if (status !== 'testing') {
            setTimeout(() => {
                if (statusDiv.parentNode) {
                    statusDiv.remove();
                }
            }, 5000);
        }
    }

    /**
     * 显示Toast通知
     */
    showToast(title, message, type = 'info') {
        if (window.toastManager) {
            window.toastManager.show(title, message, type);
        } else {
            // fallback
            alert(`${title}: ${message}`);
        }
    }
}

// 创建全局配置管理器实例
window.configManager = new ConfigManager();

// 导出到全局作用域
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}