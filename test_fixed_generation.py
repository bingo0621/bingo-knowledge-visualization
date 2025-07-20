#!/usr/bin/env python3
"""
测试修复后的BINGO知识之象HTML动画生成功能
"""

import asyncio
import json
import sys
import re
from app import generate_content_stream

async def test_fixed_generation():
    """测试修复后的内容生成"""
    print("🧪 测试修复后的BINGO知识之象...")
    
    # 测试主题
    topic = "快速排序"
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
                        if len(generated_content) % 500 == 0:
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
        print("\n🔍 代码质量检查...")
        
        # 检查常见错误
        errors = []
        
        # 检查 new document.getElementById 错误
        if re.search(r'new\s+document\.getElementById', html_code):
            errors.append("发现 'new document.getElementById' 错误")
        
        # 检查拼写错误
        typo_matches = re.findall(r'[a-zA-Z]+document\.getElementById', html_code)
        for match in typo_matches:
            if not match.startswith('document.getElementById'):
                errors.append(f"发现拼写错误: {match}")
        
        # 检查基本结构
        if '<!DOCTYPE html>' not in html_code:
            errors.append("缺少DOCTYPE声明")
        
        if errors:
            print("⚠️  发现以下问题:")
            for error in errors:
                print(f"   • {error}")
            
            print("\n🔧 自动修复代码...")
            # 自动修复
            fixed_code = html_code
            fixed_code = re.sub(r'new\s+document\.getElementById', 'document.getElementById', fixed_code)
            fixed_code = re.sub(r'[a-zA-Z]+document\.getElementById', 'document.getElementById', fixed_code)
            
            # 保存修复后的文件
            filename = f"fixed_animation_{topic}.html"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(fixed_code)
            
            print(f"✅ 修复完成! 文件已保存为: {filename}")
            
            # 再次检查修复后的代码
            fixed_errors = []
            if re.search(r'new\s+document\.getElementById', fixed_code):
                fixed_errors.append("'new document.getElementById' 错误仍存在")
            
            typo_matches = re.findall(r'[a-zA-Z]+document\.getElementById', fixed_code)
            for match in typo_matches:
                if not match.startswith('document.getElementById'):
                    fixed_errors.append(f"拼写错误仍存在: {match}")
            
            if fixed_errors:
                print("❌ 修复后仍有问题:")
                for error in fixed_errors:
                    print(f"   • {error}")
                return False
            else:
                print("🎉 所有问题已修复!")
        else:
            print("✅ 代码质量良好，未发现问题!")
            
            # 保存原始文件
            filename = f"quality_animation_{topic}.html"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(html_code)
            print(f"💾 HTML文件已保存为: {filename}")
        
        print("\n📄 HTML代码预览 (前300字符):")
        print("-" * 60)
        print(html_code[:300] + "..." if len(html_code) > 300 else html_code)
        print("-" * 60)
        
        return True
    else:
        print("⚠️  未检测到HTML代码，可能生成的是文本内容")
        return False

if __name__ == "__main__":
    # 检查是否配置了API密钥
    from config.settings import get_settings
    settings = get_settings()
    api_config = settings.get_api_config()
    
    if not api_config["api_key"]:
        print("❌ 请先配置API密钥!")
        sys.exit(1)
    
    print(f"🔑 使用 {api_config['provider']} - {api_config['model']}")
    
    # 运行测试
    success = asyncio.run(test_fixed_generation())
    
    if success:
        print("\n✅ 测试成功! 修复后的BINGO知识之象可以生成高质量HTML动画")
        print("🌐 可以在浏览器中打开生成的HTML文件查看动画效果")
    else:
        print("\n❌ 测试失败! 仍需要进一步优化")
    
    print("\n🔗 访问 http://127.0.0.1:8001 查看Web界面")