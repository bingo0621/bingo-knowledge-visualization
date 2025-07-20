# 🧠 BINGO知识之象 (BINGO Knowledge Visualization)

> **AI驱动的商业级知识可视化平台**  
> 为教育工作者和自媒体创作者提供**绝对美观、准确实用**的概念动画生成服务

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## 🎯 项目愿景

BINGO知识之象致力于成为**最专业的知识可视化平台**，通过AI技术将抽象概念转换为高质量的动态视觉内容，服务于：

- 📚 **教育工作者** - 创建生动的教学动画，提升课堂效果
- 🎬 **自媒体创作者** - 快速制作专业级概念动画，提升内容质量  
- 🏢 **企业培训师** - 制作培训材料，提高培训效果
- 🎓 **学生和研究者** - 可视化复杂概念，加深理解

## ✨ 核心特性

### 核心特性

#### 🎨 多风格生成系统
- **默认风格**: 保持原有动画生成方式  
- **奢华暗黑风格**: 科技感霓虹效果，钻石质感设计
- **Aurora红黑风格**: 特斯拉红配黑底，简约科技美学

#### 🛠️ 前端配置系统
- **API配置**: 支持前端直接配置API Key和Base URL
- **模型选择**: 支持多种AI模型切换
- **风格控制**: 可视化风格选择器

#### 🎯 界面设计升级
- **苹果风格UI**: 采用克莱因蓝主题色彩
- **响应式设计**: 完美适配桌面、平板、移动端
- **现代交互**: 流畅的动画和交互体验

## 技术架构

### 前端技术栈
- HTML5 + CSS3
- TailwindCSS 3.0+
- Vanilla JavaScript
- Font Awesome图标库

### 后端技术栈  
- FastAPI (Python)
- 支持多种AI模型:
  - Google Gemini 2.5 Pro
  - OpenAI GPT系列
  - 其他兼容OpenAI API的服务

### 风格系统架构
```
styles/
├── default.css          # 默认风格
├── luxury-dark.css      # 奢华暗黑风格  
├── aurora-red.css       # Aurora红黑风格
└── components/
    ├── base.css         # 基础组件
    ├── animations.css   # 动画效果
    └── responsive.css   # 响应式布局
```

## 项目状态

### ✅ 已完成
- [x] 项目架构设计
- [x] 基础文件结构创建

### 🚧 进行中
- [ ] 前端界面重构 (苹果风格UI设计)
- [ ] API配置界面开发
- [ ] 多风格系统实现

### 📋 待开发
- [ ] 默认风格适配
- [ ] 奢华暗黑风格
- [ ] Aurora红黑风格
- [ ] 后端API适配
- [ ] 项目文档完善

## 开发指南

### 环境要求
- Python 3.9+
- 现代网络浏览器
- AI模型API密钥

### 快速开始
```bash
# 1. 克隆项目
git clone [项目地址]
cd BINGO知识之象

# 2. 安装依赖
pip install -r requirements.txt

# 3. 配置API (通过前端界面)
python start_app.py

# 4. 访问应用
# 浏览器自动打开 http://127.0.0.1:8000
```

## 风格展示

### 默认风格
- 保持原Fogsight的动画生成方式
- 适合日常知识展示

### 奢华暗黑风格  
- 深邃渐变背景 (#0a0a0f → #1a1a2e → #16213e)
- 霓虹色彩强调 (钻石蓝/奢华金/激光紫)
- 玻璃态毛玻璃效果
- 动态粒子背景
- 3D视差动画

### Aurora红黑风格
- 纯黑色底 (#000000)
- 特斯拉红高亮 (#E31937)  
- 超大字体视觉冲击
- 全屏分页滚动
- Apple官网风格动效

## 贡献指南

本项目基于MIT许可证开源，欢迎贡献代码。

### 开发流程
1. Fork项目到个人仓库
2. 创建功能分支
3. 提交代码变更
4. 发起Pull Request

### 代码规范
- 遵循项目现有代码风格
- 添加必要的注释
- 确保代码测试通过

## 版权说明

基于[Fogsight](https://github.com/fogsightai/fogsight)项目进行二次开发  
原项目采用MIT许可证  
本项目同样采用MIT许可证

---

**让知识在视觉中绽放，让概念在动画中重生** ✨