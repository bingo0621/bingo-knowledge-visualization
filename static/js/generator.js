/**
 * BINGO知识之象 - 内容生成模块
 * 处理知识可视化内容生成和显示
 */

class ContentGenerator {
    constructor() {
        this.isGenerating = false;
        this.currentStream = null;
        this.generatedContent = '';
        this.history = [];
        this.inCodeBlock = false;
        this.accumulatedHTMLCode = '';
        this.init();
    }

    /**
     * 初始化生成器
     */
    init() {
        this.bindEvents();
        this.updateUIState();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 主题输入框
        const topicInput = document.getElementById('topicInput');
        if (topicInput) {
            topicInput.addEventListener('input', (e) => this.onTopicChange(e.target.value));
            topicInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.startGeneration();
                }
            });
        }

        // 生成按钮
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.startGeneration());
        }

        // 开始创作按钮
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.scrollToWorkspace());
        }

        // 复制按钮
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyContent());
        }

        // 下载按钮
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadContent());
        }

        // 风格选择
        const styleInputs = document.querySelectorAll('input[name="style"]');
        styleInputs.forEach(input => {
            input.addEventListener('change', () => this.onStyleChange());
        });
    }

    /**
     * 主题输入变化处理
     */
    onTopicChange(value) {
        const charCount = document.getElementById('charCount');
        const generateBtn = document.getElementById('generateBtn');
        
        // 更新字符计数
        if (charCount) {
            const length = value.length;
            charCount.textContent = `${length}/200`;
            
            // 更新计数器颜色
            charCount.className = 'text-xs';
            if (length > 180) {
                charCount.classList.add('text-error');
            } else if (length > 150) {
                charCount.classList.add('text-warning');
            } else {
                charCount.classList.add('text-gray-400');
            }
        }

        // 更新生成按钮状态
        this.updateGenerateButtonState();
    }

    /**
     * 风格选择变化处理
     */
    onStyleChange() {
        // 可以在这里添加风格预览逻辑
        console.log('风格已更改:', this.getSelectedStyle());
    }

    /**
     * 获取选中的风格
     */
    getSelectedStyle() {
        const selectedStyle = document.querySelector('input[name="style"]:checked');
        return selectedStyle ? selectedStyle.value : 'default';
    }

    /**
     * 更新生成按钮状态
     */
    updateGenerateButtonState() {
        const generateBtn = document.getElementById('generateBtn');
        const topicInput = document.getElementById('topicInput');
        
        if (!generateBtn || !topicInput) return;

        const hasInput = topicInput.value.trim().length > 0;
        const isConfigured = window.configManager?.currentConfig?.is_configured || false;
        
        generateBtn.disabled = !hasInput || !isConfigured || this.isGenerating;
        
        // 更新按钮文本和提示
        if (this.isGenerating) {
            generateBtn.title = '正在生成中...';
        } else if (!isConfigured) {
            generateBtn.title = '请先配置API密钥';
        } else if (!hasInput) {
            generateBtn.title = '请输入要可视化的主题';
        } else {
            generateBtn.title = '';
        }
    }

    /**
     * 更新UI状态
     */
    updateUIState() {
        this.updateGenerateButtonState();
    }

    /**
     * 滚动到工作区域
     */
    scrollToWorkspace() {
        const workspace = document.getElementById('workspace');
        const topicInput = document.getElementById('topicInput');
        
        if (workspace) {
            workspace.scrollIntoView({ behavior: 'smooth' });
            
            // 聚焦到输入框
            setTimeout(() => {
                if (topicInput) {
                    topicInput.focus();
                }
            }, 500);
        }
    }

    /**
     * 开始生成内容
     */
    async startGeneration() {
        if (this.isGenerating) return;

        const topicInput = document.getElementById('topicInput');
        const topic = topicInput?.value.trim();
        
        if (!topic) {
            this.showToast('输入错误', '请输入要可视化的主题', 'warning');
            return;
        }

        if (topic.length > 200) {
            this.showToast('输入错误', '主题描述不能超过200个字符', 'warning');
            return;
        }

        // 检查配置
        if (!window.configManager?.currentConfig?.is_configured) {
            this.showToast('配置错误', '请先配置API密钥', 'warning');
            window.configManager?.openConfig();
            return;
        }

        this.isGenerating = true;
        this.generatedContent = '';
        
        try {
            // 更新UI状态
            this.showGeneratingUI();
            
            // 获取选中的风格
            const style = this.getSelectedStyle();
            
            // 开始生成
            await this.generateContent(topic, style);
            
        } catch (error) {
            console.error('生成失败:', error);
            this.showToast('生成失败', error.message, 'error');
            this.hideGeneratingUI();
        } finally {
            this.isGenerating = false;
            this.updateUIState();
        }
    }

    /**
     * 生成内容
     */
    async generateContent(topic, style) {
        try {
            // 获取响应流
            const response = await window.apiManager.generateContent(topic, style, this.history);
            this.currentStream = new window.StreamReader(response);
            
            // 处理流数据
            await this.currentStream.process(
                (token) => this.onContentToken(token),
                (error) => this.onGenerationError(error),
                () => this.onGenerationComplete()
            );
            
        } catch (error) {
            throw new Error('生成请求失败: ' + error.message);
        }
    }

    /**
     * 处理内容token
     */
    onContentToken(token) {
        this.generatedContent += token;
        this.updateContentDisplay();
        this.updateProgress();
        
        // 检测HTML代码块的开始和结束
        this.detectHTMLCodeBlock(token);
    }

    /**
     * 检测HTML代码块
     */
    detectHTMLCodeBlock(token) {
        if (!this.inCodeBlock && token.includes('```')) {
            this.inCodeBlock = true;
            this.showCodeGenerationUI();
            const contentAfterMarker = token.substring(token.indexOf('```') + 3).replace(/^html\n/, '');
            this.accumulatedHTMLCode = contentAfterMarker;
        } else if (this.inCodeBlock) {
            if (token.includes('```')) {
                this.inCodeBlock = false;
                const contentBeforeMarker = token.substring(0, token.indexOf('```'));
                this.accumulatedHTMLCode += contentBeforeMarker;
                this.showHTMLAnimation();
            } else {
                this.accumulatedHTMLCode += token;
            }
        }
    }

    /**
     * 显示代码生成UI
     */
    showCodeGenerationUI() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="code-generation-status">
                <div class="flex items-center gap-3 mb-4">
                    <div class="animate-spin">
                        <i class="fas fa-code text-klein text-xl"></i>
                    </div>
                    <span class="text-lg font-medium text-gray-700">正在生成HTML动画代码...</span>
                </div>
                <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
                    <div id="codePreview"></div>
                </div>
            </div>
        `;
    }

    /**
     * 显示HTML动画
     */
    showHTMLAnimation() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea || !this.accumulatedHTMLCode) return;
        
        // 先进行代码质量检查
        const qualityCheck = this.validateHTMLCode(this.accumulatedHTMLCode);
        
        contentArea.innerHTML = `
            <div class="animation-player">
                <div class="animation-header flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">
                        <i class="fas fa-play-circle text-klein mr-2"></i>
                        知识动画已生成
                        ${qualityCheck.hasErrors ? '<span class="text-warning ml-2"><i class="fas fa-exclamation-triangle"></i></span>' : '<span class="text-success ml-2"><i class="fas fa-check-circle"></i></span>'}
                    </h3>
                    <div class="flex gap-2">
                        <button id="openNewWindow" class="btn btn-secondary btn-sm">
                            <i class="fas fa-external-link-alt mr-1"></i>
                            新窗口打开
                        </button>
                        <button id="downloadHTML" class="btn btn-secondary btn-sm">
                            <i class="fas fa-download mr-1"></i>
                            下载HTML
                        </button>
                        ${qualityCheck.hasErrors ? '<button id="fixCode" class="btn btn-warning btn-sm"><i class="fas fa-wrench mr-1"></i>修复代码</button>' : ''}
                    </div>
                </div>
                ${qualityCheck.hasErrors ? `
                <div class="quality-warning bg-warning bg-opacity-10 border border-warning rounded-lg p-3 mb-4">
                    <div class="flex items-center gap-2 mb-2">
                        <i class="fas fa-exclamation-triangle text-warning"></i>
                        <span class="font-medium text-warning">代码质量警告</span>
                    </div>
                    <ul class="text-sm text-gray-700 ml-6">
                        ${qualityCheck.errors.map(error => `<li>• ${error}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                <div class="animation-iframe-container">
                    <iframe id="animationIframe" class="w-full h-96 border border-gray-200 rounded-lg shadow-sm"></iframe>
                </div>
                <details class="mt-4">
                    <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        <i class="fas fa-code mr-1"></i>
                        查看生成的HTML代码
                    </summary>
                    <pre class="bg-gray-900 text-green-400 p-4 rounded-lg mt-2 text-xs overflow-x-auto"><code id="htmlCode"></code></pre>
                </details>
            </div>
        `;
        
        // 设置iframe内容
        const iframe = document.getElementById('animationIframe');
        if (iframe) {
            iframe.srcdoc = this.accumulatedHTMLCode;
        }
        
        // 显示代码
        const htmlCode = document.getElementById('htmlCode');
        if (htmlCode) {
            htmlCode.textContent = this.accumulatedHTMLCode;
        }
        
        // 绑定按钮事件
        this.bindAnimationPlayerEvents();
        
        // 如果有错误，绑定修复按钮
        if (qualityCheck.hasErrors) {
            this.bindFixCodeEvent();
        }
    }

    /**
     * 验证HTML代码质量
     */
    validateHTMLCode(htmlCode) {
        const errors = [];
        
        // 检查常见的JavaScript错误
        if (htmlCode.includes('new document.getElementById')) {
            errors.push('JavaScript语法错误: 不应该在document.getElementById前使用new关键字');
        }
        
        // 检查拼写错误
        const typoPattern = /[a-zA-Z]+document\.getElementById/g;
        const matches = htmlCode.match(typoPattern);
        if (matches) {
            matches.forEach(match => {
                if (!match.startsWith('document.getElementById')) {
                    errors.push(`JavaScript语法错误: ${match} 应该是 document.getElementById`);
                }
            });
        }
        
        // 检查基本HTML结构
        if (!htmlCode.includes('<!DOCTYPE html>')) {
            errors.push('HTML结构警告: 缺少DOCTYPE声明');
        }
        
        return {
            hasErrors: errors.length > 0,
            errors: errors
        };
    }

    /**
     * 自动修复HTML代码
     */
    fixHTMLCode() {
        let fixedCode = this.accumulatedHTMLCode;
        
        // 修复 new document.getElementById 错误
        fixedCode = fixedCode.replace(/new\s+document\.getElementById/g, 'document.getElementById');
        
        // 修复拼写错误 (如 aodocument.getElementById)
        fixedCode = fixedCode.replace(/[a-zA-Z]+document\.getElementById/g, 'document.getElementById');
        
        this.accumulatedHTMLCode = fixedCode;
        
        // 重新显示修复后的动画
        this.showHTMLAnimation();
        
        this.showToast('代码修复完成', '已自动修复常见的JavaScript语法错误', 'success');
    }

    /**
     * 绑定修复代码按钮事件
     */
    bindFixCodeEvent() {
        const fixCodeBtn = document.getElementById('fixCode');
        if (fixCodeBtn) {
            fixCodeBtn.addEventListener('click', () => this.fixHTMLCode());
        }
    }

    /**
     * 绑定动画播放器事件
     */
    bindAnimationPlayerEvents() {
        const openNewWindow = document.getElementById('openNewWindow');
        const downloadHTML = document.getElementById('downloadHTML');
        
        if (openNewWindow) {
            openNewWindow.addEventListener('click', () => {
                const blob = new Blob([this.accumulatedHTMLCode], { type: 'text/html' });
                window.open(URL.createObjectURL(blob), '_blank');
            });
        }
        
        if (downloadHTML) {
            downloadHTML.addEventListener('click', () => {
                const topicInput = document.getElementById('topicInput');
                const topic = topicInput?.value.trim() || 'animation';
                const filename = `${topic.replace(/[^\w\u4e00-\u9fa5]/g, '_')}_${Date.now()}.html`;
                
                const blob = new Blob([this.accumulatedHTMLCode], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                a.remove();
                
                this.showToast('下载成功', `HTML文件已保存为 ${filename}`, 'success');
            });
        }
    }

    /**
     * 处理生成错误
     */
    onGenerationError(error) {
        console.error('生成过程中出错:', error);
        this.showToast('生成失败', error, 'error');
        this.hideGeneratingUI();
    }

    /**
     * 生成完成处理
     */
    onGenerationComplete() {
        console.log('内容生成完成');
        this.hideGeneratingUI();
        this.showCompletedUI();
        
        // 添加到历史记录
        this.addToHistory();
        
        // 显示成功通知
        if (this.accumulatedHTMLCode) {
            this.showToast('动画生成完成', '知识可视化动画已生成完成！', 'success');
        } else {
            this.showToast('生成完成', '内容已生成完成', 'success');
        }
    }

    /**
     * 显示生成中的UI
     */
    showGeneratingUI() {
        // 显示结果区域
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.classList.remove('hidden');
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }

        // 显示进度条
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.classList.remove('hidden');
        }

        // 隐藏占位符，显示内容区域
        const contentPlaceholder = document.getElementById('contentPlaceholder');
        const contentArea = document.getElementById('contentArea');
        
        if (contentPlaceholder) {
            contentPlaceholder.classList.add('hidden');
        }
        
        if (contentArea) {
            contentArea.classList.remove('hidden');
            contentArea.innerHTML = '<div class="text-gray-500"><i class="fas fa-magic mr-2 animate-pulse"></i>正在生成精彩内容...</div>';
        }

        // 更新生成按钮
        const generateBtn = document.getElementById('generateBtn');
        const generateBtnText = document.getElementById('generateBtnText');
        const generateLoader = document.getElementById('generateLoader');
        
        if (generateBtn) {
            generateBtn.classList.add('loading');
            generateBtn.disabled = true;
        }
        
        if (generateBtnText) {
            generateBtnText.textContent = '正在生成中...';
        }
        
        if (generateLoader) {
            generateLoader.classList.remove('hidden');
        }
    }

    /**
     * 隐藏生成中的UI
     */
    hideGeneratingUI() {
        // 隐藏进度条
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.classList.add('hidden');
        }

        // 恢复生成按钮
        const generateBtn = document.getElementById('generateBtn');
        const generateBtnText = document.getElementById('generateBtnText');
        const generateLoader = document.getElementById('generateLoader');
        
        if (generateBtn) {
            generateBtn.classList.remove('loading');
        }
        
        if (generateBtnText) {
            generateBtnText.textContent = '开始生成知识可视化';
        }
        
        if (generateLoader) {
            generateLoader.classList.add('hidden');
        }
    }

    /**
     * 显示完成后的UI
     */
    showCompletedUI() {
        // 启用操作按钮
        const copyBtn = document.getElementById('copyBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        
        if (copyBtn) copyBtn.disabled = false;
        if (downloadBtn) downloadBtn.disabled = false;
    }

    /**
     * 更新内容显示
     */
    updateContentDisplay() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;

        // 将markdown转换为HTML（简单实现）
        const htmlContent = this.markdownToHTML(this.generatedContent);
        contentArea.innerHTML = htmlContent;

        // 滚动到底部
        contentArea.scrollTop = contentArea.scrollHeight;
    }

    /**
     * 简单的Markdown转HTML
     */
    markdownToHTML(markdown) {
        return markdown
            // 标题
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // 粗体
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            // 斜体
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            // 代码
            .replace(/`([^`]*)`/gim, '<code>$1</code>')
            // 链接
            .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank">$1</a>')
            // 换行
            .replace(/\n/gim, '<br>');
    }

    /**
     * 更新进度
     */
    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (!progressFill || !progressText) return;

        // 根据内容长度估算进度（简单实现）
        const estimatedLength = 2000; // 假设完整内容约2000字符
        const currentLength = this.generatedContent.length;
        const progress = Math.min((currentLength / estimatedLength) * 100, 95); // 最多显示95%，完成时显示100%
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }

    /**
     * 添加到历史记录
     */
    addToHistory() {
        const topicInput = document.getElementById('topicInput');
        const topic = topicInput?.value.trim();
        
        if (topic && this.generatedContent) {
            this.history.push({
                role: 'user',
                content: topic
            });
            
            this.history.push({
                role: 'assistant',
                content: this.generatedContent
            });

            // 限制历史记录长度
            if (this.history.length > 10) {
                this.history = this.history.slice(-10);
            }
        }
    }

    /**
     * 复制内容
     */
    async copyContent() {
        if (!this.generatedContent) {
            this.showToast('复制失败', '没有可复制的内容', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(this.generatedContent);
            this.showToast('复制成功', '内容已复制到剪贴板', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            
            // Fallback: 使用旧方法
            const textArea = document.createElement('textarea');
            textArea.value = this.generatedContent;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showToast('复制成功', '内容已复制到剪贴板', 'success');
            } catch (fallbackError) {
                this.showToast('复制失败', '浏览器不支持复制功能', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    }

    /**
     * 下载内容
     */
    downloadContent() {
        if (!this.generatedContent) {
            this.showToast('下载失败', '没有可下载的内容', 'warning');
            return;
        }

        const topicInput = document.getElementById('topicInput');
        const topic = topicInput?.value.trim() || 'knowledge_visualization';
        const filename = `${topic.replace(/[^\w\u4e00-\u9fa5]/g, '_')}_${Date.now()}.md`;
        
        try {
            const blob = new Blob([this.generatedContent], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.showToast('下载成功', `文件已保存为 ${filename}`, 'success');
        } catch (error) {
            console.error('下载失败:', error);
            this.showToast('下载失败', '文件下载失败', 'error');
        }
    }

    /**
     * 停止生成
     */
    async stopGeneration() {
        if (this.currentStream) {
            await this.currentStream.close();
            this.currentStream = null;
        }
        
        this.isGenerating = false;
        this.hideGeneratingUI();
        this.updateUIState();
        
        this.showToast('已停止', '内容生成已停止', 'info');
    }

    /**
     * 重置生成器
     */
    reset() {
        this.isGenerating = false;
        this.currentStream = null;
        this.generatedContent = '';
        
        // 重置UI
        const resultSection = document.getElementById('resultSection');
        const contentArea = document.getElementById('contentArea');
        const contentPlaceholder = document.getElementById('contentPlaceholder');
        
        if (resultSection) {
            resultSection.classList.add('hidden');
        }
        
        if (contentArea) {
            contentArea.classList.add('hidden');
            contentArea.innerHTML = '';
        }
        
        if (contentPlaceholder) {
            contentPlaceholder.classList.remove('hidden');
        }
        
        this.hideGeneratingUI();
        this.updateUIState();
    }

    /**
     * 显示Toast通知
     */
    showToast(title, message, type = 'info') {
        if (window.toastManager) {
            window.toastManager.show(title, message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        }
    }
}

// 创建全局内容生成器实例
window.contentGenerator = new ContentGenerator();

// 导出到全局作用域
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentGenerator;
}