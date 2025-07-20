#!/usr/bin/env python3
"""
测试BINGO知识之象的内容生成功能
"""

import asyncio
import json
import sys
from app import generate_content_stream

async def test_generation():
    """测试内容生成"""
    print("🧪 测试BINGO知识之象内容生成...")
    
    # 测试主题
    topic = "冒泡排序"
    style = "default"
    
    print(f"📝 主题: {topic}")
    print(f"🎨 风格: {style}")
    print("🚀 开始生成...\n")
    
    generated_content = ""
    html_code = ""
    in_code_block = False
    
    try:
        async for chunk in generate_content_stream(topic, style):
            if chunk.startswith('data: '):
                data_str = chunk[6:]
                if data_str.strip() == '{"event":"[DONE]"}':
                    break
                
                try:
                    data = json.loads(data_str)
                    if 'token' in data:
                        token = data['token']
                        generated_content += token
                        
                        # 检测HTML代码块
                        if not in_code_block and '```' in token:
                            in_code_block = True
                            print("🔍 检测到HTML代码块开始...")
                            content_after = token.split('```', 1)[1]
                            if content_after.startswith('html\n'):
                                content_after = content_after[5:]
                            html_code = content_after
                        elif in_code_block:
                            if '```' in token:
                                in_code_block = False
                                content_before = token.split('```', 1)[0]
                                html_code += content_before
                                print("✅ HTML代码块完成!")
                                break
                            else:
                                html_code += token
                        
                        # 显示进度
                        if len(generated_content) % 100 == 0:
                            print(f"📊 已生成 {len(generated_content)} 字符...")
                    
                    elif 'error' in data:
                        print(f"❌ 错误: {data['error']}")
                        return False
                        
                except json.JSONDecodeError:
                    continue
    
    except Exception as e:
        print(f"❌ 生成失败: {e}")
        return False
    
    print(f"\n📈 生成统计:")
    print(f"   总字符数: {len(generated_content)}")
    print(f"   HTML代码长度: {len(html_code)}")
    
    if html_code:
        print("\n🎉 成功生成HTML动画代码!")
        print("📄 HTML代码预览 (前200字符):")
        print("-" * 50)
        print(html_code[:200] + "..." if len(html_code) > 200 else html_code)
        print("-" * 50)
        
        # 保存HTML文件用于测试
        filename = f"test_animation_{topic}.html"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_code)
        print(f"💾 HTML文件已保存为: {filename}")
        print(f"🌐 可以在浏览器中打开查看动画效果")
        
        return True
    else:
        print("⚠️  未检测到HTML代码，可能生成的是文本内容")
        print("📄 生成内容预览 (前500字符):")
        print("-" * 50)
        print(generated_content[:500] + "..." if len(generated_content) > 500 else generated_content)
        print("-" * 50)
        return False

if __name__ == "__main__":
    # 检查是否配置了API密钥
    from config.settings import get_settings
    settings = get_settings()
    api_config = settings.get_api_config()
    
    if not api_config["api_key"]:
        print("❌ 请先配置API密钥!")
        print("💡 请编辑 config/user_config.json 文件或通过Web界面配置")
        sys.exit(1)
    
    print(f"🔑 使用 {api_config['provider']} - {api_config['model']}")
    
    # 运行测试
    success = asyncio.run(test_generation())
    
    if success:
        print("\n✅ 测试成功! BINGO知识之象可以正常生成HTML动画")
    else:
        print("\n❌ 测试失败! 需要检查配置或提示词")
    
    print("\n🔗 访问 http://127.0.0.1:8001 查看Web界面")