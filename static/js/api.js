/**
 * BINGO知识之象 - API管理模块
 * 处理与后端的所有HTTP通信
 */

class APIManager {
    constructor() {
        this.baseURL = '';
        this.timeout = 30000; // 30秒超时
    }

    /**
     * 通用HTTP请求方法
     */
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            data = null,
            headers = {},
            timeout = this.timeout
        } = options;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            signal: controller.signal
        };

        if (data && method !== 'GET') {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('请求超时');
            }
            
            throw error;
        }
    }

    /**
     * GET请求
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, { method: 'GET', ...options });
    }

    /**
     * POST请求
     */
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, { method: 'POST', data, ...options });
    }

    /**
     * PUT请求
     */
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, { method: 'PUT', data, ...options });
    }

    /**
     * DELETE请求
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { method: 'DELETE', ...options });
    }

    /**
     * 获取当前配置
     */
    async getConfig() {
        try {
            return await this.get('/api/config');
        } catch (error) {
            console.error('获取配置失败:', error);
            throw new Error('无法获取配置信息');
        }
    }

    /**
     * 更新API配置
     */
    async updateAPIConfig(config) {
        try {
            return await this.post('/api/config/api', config);
        } catch (error) {
            console.error('更新API配置失败:', error);
            throw new Error('配置更新失败: ' + error.message);
        }
    }

    /**
     * 获取可用风格列表
     */
    async getAvailableStyles() {
        try {
            return await this.get('/api/styles');
        } catch (error) {
            console.error('获取风格列表失败:', error);
            throw new Error('无法获取风格列表');
        }
    }

    /**
     * 生成内容（流式）
     */
    async generateContent(topic, style = 'default', history = null) {
        const data = {
            topic,
            style,
            history: history || []
        };

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response; // 返回Response对象用于流式读取
        } catch (error) {
            console.error('内容生成请求失败:', error);
            throw new Error('内容生成失败: ' + error.message);
        }
    }

    /**
     * 健康检查
     */
    async healthCheck() {
        try {
            return await this.get('/api/health');
        } catch (error) {
            console.error('健康检查失败:', error);
            throw new Error('服务器连接失败');
        }
    }

    /**
     * 测试API连接
     */
    async testConnection(config) {
        try {
            // 先更新配置
            await this.updateAPIConfig(config);
            
            // 然后进行健康检查
            const health = await this.healthCheck();
            
            return {
                success: health.is_configured,
                message: health.is_configured ? 'API连接测试成功' : 'API配置不完整'
            };
        } catch (error) {
            console.error('连接测试失败:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
}

/**
 * 流式内容读取器
 */
class StreamReader {
    constructor(response) {
        this.response = response;
        this.reader = null;
        this.decoder = new TextDecoder();
    }

    /**
     * 开始读取流
     */
    async start() {
        this.reader = this.response.body.getReader();
    }

    /**
     * 读取下一个数据块
     */
    async readNext() {
        if (!this.reader) {
            throw new Error('流未初始化');
        }

        const { value, done } = await this.reader.read();
        
        if (done) {
            return { done: true, data: null };
        }

        const chunk = this.decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        const events = [];

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.slice(6));
                    events.push(data);
                } catch (error) {
                    // 忽略解析错误，可能是不完整的JSON
                    console.warn('解析流数据失败:', line);
                }
            }
        }

        return { done: false, data: events };
    }

    /**
     * 关闭流
     */
    async close() {
        if (this.reader) {
            await this.reader.cancel();
            this.reader = null;
        }
    }

    /**
     * 处理整个流（便捷方法）
     */
    async process(onData, onError, onComplete) {
        try {
            await this.start();
            
            while (true) {
                const { done, data } = await this.readNext();
                
                if (done) {
                    if (onComplete) onComplete();
                    break;
                }
                
                if (data && data.length > 0) {
                    for (const event of data) {
                        if (event.error) {
                            if (onError) onError(event.error);
                            return;
                        }
                        
                        if (event.event === '[DONE]') {
                            if (onComplete) onComplete();
                            return;
                        }
                        
                        if (event.token && onData) {
                            onData(event.token);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('流处理失败:', error);
            if (onError) onError(error.message);
        } finally {
            await this.close();
        }
    }
}

/**
 * 错误处理工具
 */
class APIError extends Error {
    constructor(message, code, details = null) {
        super(message);
        this.name = 'APIError';
        this.code = code;
        this.details = details;
    }
}

/**
 * 请求重试工具
 */
class RetryManager {
    constructor(maxRetries = 3, baseDelay = 1000) {
        this.maxRetries = maxRetries;
        this.baseDelay = baseDelay;
    }

    async execute(fn, retries = 0) {
        try {
            return await fn();
        } catch (error) {
            if (retries >= this.maxRetries) {
                throw error;
            }

            const delay = this.baseDelay * Math.pow(2, retries);
            console.warn(`请求失败，${delay}ms后重试 (${retries + 1}/${this.maxRetries}):`, error.message);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.execute(fn, retries + 1);
        }
    }
}

// 创建全局API管理器实例
window.apiManager = new APIManager();
window.StreamReader = StreamReader;
window.APIError = APIError;
window.RetryManager = RetryManager;

// 导出到全局作用域
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIManager, StreamReader, APIError, RetryManager };
}