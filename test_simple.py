#!/usr/bin/env python3
"""
简单测试服务器
"""

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

app = FastAPI()

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/styles", StaticFiles(directory="styles"), name="styles")

@app.get("/", response_class=HTMLResponse)
async def home():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>BINGO知识之象 - 测试</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-2xl mx-auto">
                <h1 class="text-4xl font-bold text-blue-600 mb-4">
                    <i class="fas fa-brain mr-2"></i>
                    BINGO知识之象
                </h1>
                <p class="text-gray-700 mb-6">AI驱动的知识可视化平台</p>
                
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-semibold mb-4">快速测试</h2>
                    <div class="space-y-4">
                        <input 
                            type="text" 
                            placeholder="输入知识主题..." 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                        <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-magic mr-2"></i>
                            开始生成
                        </button>
                    </div>
                </div>
                
                <div class="mt-6 text-center">
                    <p class="text-gray-500">✅ 基础界面测试成功</p>
                </div>
            </div>
        </div>
        
        <script>
            console.log('BINGO知识之象 - 简单测试版本加载成功');
            document.querySelector('button').addEventListener('click', function() {
                alert('测试按钮点击成功！主应用功能正常。');
            });
        </script>
    </body>
    </html>
    """

@app.get("/health")
async def health():
    return {"status": "ok", "message": "简单测试服务器运行正常"}

if __name__ == "__main__":
    print("🧪 启动简单测试服务器...")
    print("📍 访问: http://127.0.0.1:8001")
    uvicorn.run(app, host="127.0.0.1", port=8001)