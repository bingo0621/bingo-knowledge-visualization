#!/usr/bin/env python3
"""
HTML动画代码质量检查器
用于验证AI生成的HTML代码是否有语法错误
"""

import re
import sys
from typing import List, Tuple

class HTMLValidator:
    def __init__(self):
        self.errors = []
        self.warnings = []
    
    def validate_html_file(self, file_path: str) -> bool:
        """验证HTML文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            return self.validate_html_content(content)
        except Exception as e:
            self.errors.append(f"文件读取错误: {e}")
            return False
    
    def validate_html_content(self, content: str) -> bool:
        """验证HTML内容"""
        self.errors = []
        self.warnings = []
        
        # 检查JavaScript语法错误
        self._check_javascript_syntax(content)
        
        # 检查HTML结构
        self._check_html_structure(content)
        
        # 检查CSS语法
        self._check_css_syntax(content)
        
        return len(self.errors) == 0
    
    def _check_javascript_syntax(self, content: str):
        """检查JavaScript语法错误"""
        # 提取JavaScript代码
        js_pattern = r'<script[^>]*>(.*?)</script>'
        js_matches = re.findall(js_pattern, content, re.DOTALL | re.IGNORECASE)
        
        for i, js_code in enumerate(js_matches):
            # 检查常见的语法错误
            self._check_js_common_errors(js_code, i + 1)
    
    def _check_js_common_errors(self, js_code: str, script_index: int):
        """检查JavaScript常见错误"""
        lines = js_code.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            
            # 检查 document.getElementById 错误
            if 'document.getElementById' in line:
                # 检查是否有多余的 'new' 关键字
                if re.search(r'new\s+document\.getElementById', line):
                    self.errors.append(f"Script {script_index}, Line {line_num}: 不应该在document.getElementById前使用'new'关键字")
                
                # 检查是否有拼写错误
                if re.search(r'[a-zA-Z]+document\.getElementById', line) and not re.search(r'(var|let|const|=|\()\s*[a-zA-Z]+document\.getElementById', line):
                    self.errors.append(f"Script {script_index}, Line {line_num}: document.getElementById前有多余字符")
            
            # 检查变量声明错误
            if re.search(r'const\s+\w+\s*=\s*new\s+document\.', line):
                self.errors.append(f"Script {script_index}, Line {line_num}: 不应该对DOM查询使用'new'关键字")
            
            # 检查函数调用错误
            if re.search(r'\.getElementById\s*\(\s*[\'"][^\'"]*[\'"]\s*\)\s*;?\s*$', line):
                # 这是正确的格式，跳过
                pass
            elif 'getElementById' in line and not re.search(r'getElementById\s*\([^)]*\)', line):
                self.warnings.append(f"Script {script_index}, Line {line_num}: getElementById调用格式可能不正确")
            
            # 检查未闭合的括号
            open_parens = line.count('(')
            close_parens = line.count(')')
            if open_parens != close_parens and not line.endswith(',') and not line.endswith('{'):
                self.warnings.append(f"Script {script_index}, Line {line_num}: 括号可能不匹配")
    
    def _check_html_structure(self, content: str):
        """检查HTML结构"""
        # 检查基本HTML标签
        if not re.search(r'<!DOCTYPE\s+html>', content, re.IGNORECASE):
            self.warnings.append("缺少DOCTYPE声明")
        
        if not re.search(r'<html[^>]*>', content, re.IGNORECASE):
            self.errors.append("缺少<html>标签")
        
        if not re.search(r'<head[^>]*>.*</head>', content, re.DOTALL | re.IGNORECASE):
            self.errors.append("缺少<head>标签")
        
        if not re.search(r'<body[^>]*>.*</body>', content, re.DOTALL | re.IGNORECASE):
            self.errors.append("缺少<body>标签")
    
    def _check_css_syntax(self, content: str):
        """检查CSS语法"""
        # 提取CSS代码
        css_pattern = r'<style[^>]*>(.*?)</style>'
        css_matches = re.findall(css_pattern, content, re.DOTALL | re.IGNORECASE)
        
        for i, css_code in enumerate(css_matches):
            # 检查CSS基本语法
            self._check_css_basic_syntax(css_code, i + 1)
    
    def _check_css_basic_syntax(self, css_code: str, style_index: int):
        """检查CSS基本语法"""
        # 检查未闭合的大括号
        open_braces = css_code.count('{')
        close_braces = css_code.count('}')
        
        if open_braces != close_braces:
            self.errors.append(f"Style {style_index}: CSS大括号不匹配 (开:{open_braces}, 闭:{close_braces})")
    
    def get_report(self) -> str:
        """获取验证报告"""
        report = []
        
        if self.errors:
            report.append("🚨 发现错误:")
            for error in self.errors:
                report.append(f"  ❌ {error}")
        
        if self.warnings:
            report.append("\n⚠️  警告:")
            for warning in self.warnings:
                report.append(f"  ⚠️  {warning}")
        
        if not self.errors and not self.warnings:
            report.append("✅ 代码验证通过，未发现问题")
        
        return "\n".join(report)

def fix_common_js_errors(content: str) -> str:
    """修复常见的JavaScript错误"""
    # 修复 new document.getElementById 错误
    content = re.sub(r'new\s+document\.getElementById', 'document.getElementById', content)
    
    # 修复 aodocument.getElementById 类似的错误
    content = re.sub(r'[a-zA-Z]+document\.getElementById', 'document.getElementById', content)
    
    return content

def main():
    if len(sys.argv) != 2:
        print("用法: python html_validator.py <html文件路径>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    validator = HTMLValidator()
    
    print(f"🔍 验证文件: {file_path}")
    print("-" * 50)
    
    is_valid = validator.validate_html_file(file_path)
    print(validator.get_report())
    
    if not is_valid:
        print(f"\n🔧 尝试自动修复...")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            fixed_content = fix_common_js_errors(content)
            
            if fixed_content != content:
                fixed_file = file_path.replace('.html', '_fixed.html')
                with open(fixed_file, 'w', encoding='utf-8') as f:
                    f.write(fixed_content)
                
                print(f"✅ 已生成修复版本: {fixed_file}")
                
                # 验证修复后的文件
                validator_fixed = HTMLValidator()
                is_fixed = validator_fixed.validate_html_content(fixed_content)
                
                if is_fixed:
                    print("🎉 修复成功！文件现在应该可以正常工作了")
                else:
                    print("⚠️  部分问题已修复，但仍有其他问题:")
                    print(validator_fixed.get_report())
            else:
                print("❌ 未找到可自动修复的问题")
        
        except Exception as e:
            print(f"❌ 修复失败: {e}")
    
    print("-" * 50)
    return 0 if is_valid else 1

if __name__ == "__main__":
    sys.exit(main())