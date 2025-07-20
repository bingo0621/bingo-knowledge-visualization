#!/usr/bin/env python3
"""
BINGO知识之象 - 应用测试脚本
快速测试应用程序是否正常工作
"""

import os
import sys
import time
import subprocess
from pathlib import Path

def test_project_structure():
    """测试项目结构"""
    print("🔍 检查项目结构...")
    
    required_files = [
        "app.py",
        "requirements.txt",
        "start_app.py",
        "README.md",
        "TODO.md",
        "config/settings.py",
        "templates/index.html",
        "static/css/main.css",
        "static/js/app.js",
        "styles/components/base.css"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ 缺少文件: {', '.join(missing_files)}")
        return False
    
    print("✅ 项目结构检查通过")
    return True

def test_python_imports():
    """测试Python模块导入"""
    print("🔍 检查Python模块...")
    
    try:
        # 测试基本导入
        import fastapi
        import uvicorn
        import pydantic
        print("✅ FastAPI相关模块正常")
        
        # 测试项目模块
        sys.path.insert(0, str(Path.cwd()))
        from config.settings import get_settings
        settings = get_settings()
        print("✅ 项目配置模块正常")
        
        return True
        
    except ImportError as e:
        print(f"❌ 模块导入失败: {e}")
        return False

def test_config_system():
    """测试配置系统"""
    print("🔍 测试配置系统...")
    
    try:
        from config.settings import Settings
        
        # 创建测试配置
        settings = Settings()
        
        # 测试配置读写
        test_value = "test_value_123"
        settings.set("test.value", test_value)
        
        if settings.get("test.value") == test_value:
            print("✅ 配置系统读写正常")
            return True
        else:
            print("❌ 配置系统读写失败")
            return False
            
    except Exception as e:
        print(f"❌ 配置系统测试失败: {e}")
        return False

def test_app_startup():
    """测试应用启动（不启动服务器）"""
    print("🔍 测试应用启动...")
    
    try:
        # 尝试导入主应用
        from app import app
        print("✅ 主应用模块导入成功")
        
        # 检查应用配置
        if hasattr(app, 'title') and app.title:
            print(f"✅ 应用标题: {app.title}")
        
        return True
        
    except Exception as e:
        print(f"❌ 应用启动测试失败: {e}")
        return False

def create_test_config():
    """创建测试配置文件"""
    print("🔧 创建测试配置...")
    
    config_dir = Path("config")
    config_dir.mkdir(exist_ok=True)
    
    test_config_path = config_dir / "user_config.json"
    test_config = {
        "api": {
            "provider": "gemini",
            "api_key": "test_key_for_testing",
            "base_url": "",
            "model": "gemini-2.5-pro"
        },
        "ui": {
            "theme": "klein-blue",
            "language": "zh-CN",
            "animation_speed": "normal"
        },
        "generation": {
            "default_style": "default",
            "quality": "high",
            "timeout": 120
        }
    }
    
    import json
    with open(test_config_path, 'w', encoding='utf-8') as f:
        json.dump(test_config, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 测试配置已创建: {test_config_path}")

def cleanup_test_files():
    """清理测试文件"""
    test_files = [
        "config/user_config.json"
    ]
    
    for file_path in test_files:
        path = Path(file_path)
        if path.exists():
            path.unlink()
    
    print("🧹 测试文件已清理")

def run_all_tests():
    """运行所有测试"""
    print("=" * 60)
    print("🎨 BINGO知识之象 - 应用测试")
    print("=" * 60)
    
    tests = [
        ("项目结构", test_project_structure),
        ("Python模块", test_python_imports),
        ("配置系统", test_config_system),
        ("应用启动", test_app_startup)
    ]
    
    # 创建测试环境
    create_test_config()
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 测试: {test_name}")
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} 测试失败")
        except Exception as e:
            print(f"❌ {test_name} 测试异常: {e}")
    
    # 清理测试文件
    cleanup_test_files()
    
    print("\n" + "=" * 60)
    print(f"📊 测试结果: {passed}/{total} 通过")
    
    if passed == total:
        print("🎉 所有测试通过！应用程序准备就绪。")
        print("\n🚀 启动应用程序:")
        print("   python start_app.py")
        return True
    else:
        print("⚠️  部分测试失败，请检查相关问题。")
        return False

def show_quick_start():
    """显示快速开始指南"""
    print("\n" + "=" * 60)
    print("🚀 BINGO知识之象 - 快速开始")
    print("=" * 60)
    print("\n1. 安装依赖:")
    print("   pip install -r requirements.txt")
    print("\n2. 启动应用:")
    print("   python start_app.py")
    print("\n3. 配置API:")
    print("   - 打开 http://127.0.0.1:8000")
    print("   - 点击右上角的\"设置\"按钮")
    print("   - 配置您的API密钥")
    print("\n4. 开始使用:")
    print("   - 输入知识主题")
    print("   - 选择生成风格")
    print("   - 点击生成按钮")
    print("\n" + "=" * 60)

if __name__ == "__main__":
    # 确保在正确的目录
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    if len(sys.argv) > 1 and sys.argv[1] == "--quick-start":
        show_quick_start()
    else:
        success = run_all_tests()
        
        if success:
            show_quick_start()
        
        sys.exit(0 if success else 1)