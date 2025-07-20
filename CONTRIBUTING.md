# 🤝 贡献指南

感谢您对BINGO知识之象项目的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、设计、测试和反馈。

## 📋 贡献方式

### 🐛 报告Bug
- 使用 [GitHub Issues](https://github.com/your-username/bingo-knowledge-visualization/issues) 报告问题
- 请先搜索现有问题，避免重复报告
- 提供详细的问题描述和复现步骤
- 包含系统环境信息和错误日志

### 💡 功能建议
- 通过 [GitHub Discussions](https://github.com/your-username/bingo-knowledge-visualization/discussions) 讨论新功能
- 详细描述功能需求和使用场景
- 说明功能的商业价值和用户价值

### 📝 改进文档
- 修正文档中的错误或不准确信息
- 添加缺失的文档内容
- 改进文档的可读性和结构
- 翻译文档到其他语言

### 🎨 设计贡献
- 改进用户界面设计
- 优化用户体验流程
- 设计新的视觉风格
- 创建图标和插图

## 🚀 开发流程

### 1. 准备开发环境

```bash
# Fork项目到您的GitHub账户
# 克隆您的Fork
git clone https://github.com/your-username/bingo-knowledge-visualization.git
cd bingo-knowledge-visualization

# 添加上游仓库
git remote add upstream https://github.com/original-owner/bingo-knowledge-visualization.git

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 2. 创建功能分支

```bash
# 确保主分支是最新的
git checkout main
git pull upstream main

# 创建新的功能分支
git checkout -b feature/your-feature-name
# 或者修复分支
git checkout -b fix/issue-number-description
```

### 3. 开发和测试

```bash
# 运行开发服务器
python start_app.py

# 运行测试
pytest

# 运行代码格式化
black .
isort .

# 运行代码检查
flake8 .
mypy src/
```

### 4. 提交代码

```bash
# 添加文件
git add .

# 提交代码（遵循提交规范）
git commit -m "feat(auth): add user registration functionality"

# 推送到您的Fork
git push origin feature/your-feature-name
```

### 5. 创建Pull Request

1. 在GitHub上打开您的Fork
2. 点击 "New Pull Request"
3. 选择正确的分支
4. 填写PR模板
5. 等待代码审查

## 📝 代码规范

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具的变动

**示例:**
```
feat(auth): add OAuth2 login support
fix(api): resolve timeout issue in generation endpoint
docs(readme): update installation instructions
style(css): improve button hover effects
refactor(db): optimize query performance
test(unit): add tests for content generation
chore(deps): update FastAPI to v0.104
```

### Python代码规范

```python
# 使用类型注解
def generate_content(topic: str, style: str) -> Dict[str, Any]:
    """生成内容的函数
    
    Args:
        topic: 主题内容
        style: 视觉风格
        
    Returns:
        生成的内容数据
        
    Raises:
        ValueError: 当参数无效时
    """
    pass

# 使用dataclass
from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    id: int
    username: str
    email: str
    is_active: bool = True
    subscription_tier: Optional[str] = None
```

### JavaScript代码规范

```javascript
// 使用现代ES6+语法
class ContentGenerator {
    constructor(config) {
        this.config = config;
        this.isGenerating = false;
    }
    
    async generateContent(topic, style) {
        if (this.isGenerating) {
            throw new Error('Generation already in progress');
        }
        
        try {
            this.isGenerating = true;
            const result = await this.callAPI(topic, style);
            return result;
        } finally {
            this.isGenerating = false;
        }
    }
}

// 使用箭头函数和解构
const { topic, style, options = {} } = request;
const processedContent = await pipeline
    .map(content => transform(content))
    .filter(content => validate(content))
    .reduce((acc, content) => merge(acc, content), {});
```

### CSS代码规范

```css
/* 使用BEM命名规范 */
.generation-workspace {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: var(--space-4);
}

.generation-workspace__input {
    padding: var(--space-3);
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-300);
}

.generation-workspace__input--focused {
    border-color: var(--klein-blue);
    box-shadow: 0 0 0 3px var(--klein-blue-alpha-10);
}

/* 使用CSS自定义属性 */
:root {
    --primary-color: #002FA7;
    --secondary-color: #0051D5;
    --text-color: #1D1D1F;
    --background-color: #FFFFFF;
}
```

## 🧪 测试指南

### 单元测试

```python
import pytest
from unittest.mock import Mock, patch
from src.services.content_generator import ContentGenerator

class TestContentGenerator:
    @pytest.fixture
    def generator(self):
        return ContentGenerator()
    
    @pytest.mark.asyncio
    async def test_generate_content_success(self, generator):
        # Arrange
        topic = "机器学习基础"
        style = "default"
        
        # Act
        result = await generator.generate_content(topic, style)
        
        # Assert
        assert result is not None
        assert result['topic'] == topic
        assert result['style'] == style
        assert len(result['content']) > 0
    
    @pytest.mark.asyncio
    async def test_generate_content_invalid_input(self, generator):
        # Act & Assert
        with pytest.raises(ValueError):
            await generator.generate_content("", "invalid_style")
```

### 集成测试

```python
import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

class TestGenerationAPI:
    def test_create_project(self):
        # Arrange
        project_data = {
            "title": "测试项目",
            "concept": "深度学习",
            "style": "default"
        }
        
        # Act
        response = client.post("/api/v1/projects", json=project_data)
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == project_data["title"]
        assert "id" in data
    
    def test_generate_content(self):
        # 先创建项目
        project_response = client.post("/api/v1/projects", json={
            "title": "测试项目",
            "concept": "机器学习",
            "style": "default"
        })
        project_id = project_response.json()["id"]
        
        # 生成内容
        response = client.post(f"/api/v1/projects/{project_id}/generate")
        assert response.status_code == 200
```

### 前端测试

```javascript
// 使用Jest进行单元测试
describe('ContentGenerator', () => {
    let generator;
    
    beforeEach(() => {
        generator = new ContentGenerator({
            apiUrl: 'http://localhost:8000'
        });
    });
    
    test('should generate content successfully', async () => {
        // Arrange
        const topic = '机器学习基础';
        const style = 'default';
        
        // Mock API response
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                content: 'Generated content',
                quality_score: 0.95
            })
        });
        
        // Act
        const result = await generator.generateContent(topic, style);
        
        // Assert
        expect(result).toBeDefined();
        expect(result.content).toBe('Generated content');
        expect(result.quality_score).toBeGreaterThan(0.9);
    });
});
```

## 📋 Pull Request 模板

创建PR时，请填写以下模板：

```markdown
## 📝 变更描述
简要描述此PR的变更内容

## 🎯 变更类型
- [ ] 新功能 (feature)
- [ ] 修复bug (fix)
- [ ] 文档更新 (docs)
- [ ] 代码重构 (refactor)
- [ ] 性能优化 (perf)
- [ ] 测试相关 (test)
- [ ] 构建相关 (build)

## 🧪 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试完成
- [ ] 添加了新的测试用例

## 📸 截图/演示
如果涉及UI变更，请提供截图或GIF演示

## 📋 检查清单
- [ ] 代码遵循项目规范
- [ ] 提交信息符合规范
- [ ] 文档已更新
- [ ] 没有引入破坏性变更
- [ ] 已测试在不同环境下的兼容性

## 🔗 相关Issue
Closes #issue_number
```

## 🎯 开发优先级

### 高优先级
1. **核心功能bug修复** - 影响基本功能的问题
2. **安全漏洞修复** - 安全相关问题
3. **性能优化** - 影响用户体验的性能问题
4. **API稳定性** - 确保API的稳定性和兼容性

### 中优先级
1. **新功能开发** - 按照roadmap规划的新功能
2. **用户体验改进** - UI/UX优化
3. **文档完善** - 补充和改进文档
4. **测试覆盖率提升** - 增加测试用例

### 低优先级
1. **代码重构** - 不影响功能的代码优化
2. **开发工具改进** - 提升开发效率的工具
3. **实验性功能** - 探索性的新功能

## 🏆 贡献者认可

我们重视每一位贡献者的努力，会通过以下方式表示感谢：

1. **贡献者列表** - 在README中列出所有贡献者
2. **发布说明** - 在版本发布时感谢贡献者
3. **特殊徽章** - 为重要贡献者提供特殊认可
4. **推荐信** - 为优秀贡献者提供推荐信

## 📞 联系方式

如果您有任何问题或建议，可以通过以下方式联系我们：

- **GitHub Issues**: 报告bug和功能请求
- **GitHub Discussions**: 技术讨论和问答
- **邮箱**: contribute@bingo-viz.com
- **微信群**: 扫描README中的二维码加入

## 📚 学习资源

### 技术文档
- [FastAPI官方文档](https://fastapi.tiangolo.com/)
- [Python异步编程指南](https://docs.python.org/3/library/asyncio.html)
- [PostgreSQL文档](https://www.postgresql.org/docs/)
- [Redis文档](https://redis.io/documentation)

### 设计资源
- [Apple设计指南](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://material.io/design)
- [色彩理论基础](https://www.interaction-design.org/literature/topics/color-theory)

### AI/ML资源
- [OpenAI API文档](https://platform.openai.com/docs)
- [Google AI文档](https://ai.google.dev/)
- [机器学习基础](https://developers.google.com/machine-learning/crash-course)

---

再次感谢您对BINGO知识之象项目的贡献！让我们一起打造最优秀的知识可视化平台！ 🚀