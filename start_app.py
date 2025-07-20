#!/usr/bin/env python3
"""
BINGO知识之象 启动脚本
启动服务并自动打开浏览器
"""

import os
import sys
import time
import webbrowser
import subprocess
from pathlib import Path

def check_requirements():
    """检查依赖是否已安装"""
    try:
        import fastapi
        import uvicorn
        import pydantic
        print("✅ 基础依赖检查通过")
        return True
    except ImportError as e:
        print(f"❌ 缺少依赖: {e}")
        print("请运行: pip install -r requirements.txt")
        return False

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 9):
        print("❌ Python版本过低，需要Python 3.9+")
        print(f"当前版本: {sys.version}")
        return False
    print(f"✅ Python版本检查通过: {sys.version}")
    return True

def setup_environment():
    """设置环境"""
    # 确保在正确的目录
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # 检查配置目录
    config_dir = Path("config")
    if not config_dir.exists():
        config_dir.mkdir(exist_ok=True)
        print("✅ 创建配置目录")
    
    # 检查静态文件目录
    for dir_name in ["static", "templates", "styles"]:
        dir_path = Path(dir_name)
        if not dir_path.exists():
            dir_path.mkdir(exist_ok=True)
            print(f"✅ 创建{dir_name}目录")

def start_server():
    """启动服务器"""
    try:
        print("\n🚀 正在启动BINGO知识之象...")
        print("📍 服务地址: http://127.0.0.1:8000")
        print("⚙️  配置界面: http://127.0.0.1:8000#config")
        print("📖 项目文档: 查看README.md和TODO.md")
        print("\n💡 提示: 按Ctrl+C停止服务")
        print("-" * 50)
        
        # 延迟2秒后打开浏览器
        def open_browser():
            time.sleep(2)
            try:
                webbrowser.open("http://127.0.0.1:8000")
                print("🌐 已在默认浏览器中打开应用")
            except Exception as e:
                print(f"⚠️  无法自动打开浏览器: {e}")
                print("请手动访问: http://127.0.0.1:8000")
        
        # 在新线程中打开浏览器
        import threading
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        # 启动服务器
        import uvicorn
        uvicorn.run(
            "app:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )
        
    except KeyboardInterrupt:
        print("\n\n👋 BINGO知识之象已停止运行")
        print("感谢使用！")
    except Exception as e:
        print(f"\n❌ 启动失败: {e}")
        print("请检查错误信息并重试")

def main():
    """主函数"""
    print("=" * 60)
    print("🎨 BINGO知识之象 (BINGO Knowledge Visualization)")
    print("   基于AI的知识可视化平台")
    print("=" * 60)
    
    # 环境检查
    if not check_python_version():
        return False
    
    if not check_requirements():
        return False
    
    # 环境设置
    setup_environment()
    
    # 启动服务器
    start_server()
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)