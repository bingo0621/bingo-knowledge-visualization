"""
BINGO知识之象 - 主应用程序
BINGO Knowledge Visualization - Main Application

基于Fogsight的知识可视化平台二次开发版本
AI驱动的知识概念可视化引擎，支持多种风格的动态内容生成
"""

import asyncio
import json
import os
from datetime import datetime
from typing import AsyncGenerator, List, Optional

import pytz
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# AI模型导入
from openai import AsyncOpenAI, OpenAIError
import google.generativeai as genai

# 项目配置
from config.settings import get_settings

# -----------------------------------------------------------------------
# 0. 应用初始化和配置
# -----------------------------------------------------------------------

# 时区配置
shanghai_tz = pytz.timezone("Asia/Shanghai")

# 获取配置
settings = get_settings()

# 模板引擎
templates = Jinja2Templates(directory="templates")

# FastAPI应用初始化
app = FastAPI(
    title="BINGO知识之象",
    description="AI驱动的知识可视化平台",
    version="2.0.0"
)

# CORS中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# 静态文件服务
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/styles", StaticFiles(directory="styles"), name="styles")

# -----------------------------------------------------------------------
# 1. 数据模型定义
# -----------------------------------------------------------------------

class GenerationRequest(BaseModel):
    """内容生成请求模型"""
    topic: str
    style: Optional[str] = "default"  # default, luxury, aurora
    history: Optional[List[dict]] = None
    config: Optional[dict] = None

class APIConfigRequest(BaseModel):
    """API配置请求模型"""
    provider: str  # gemini, openai, custom
    api_key: str
    base_url: Optional[str] = ""
    model: Optional[str] = ""

class StyleConfig(BaseModel):
    """风格配置模型"""
    name: str
    display_name: str
    description: str
    preview_url: Optional[str] = None

# -----------------------------------------------------------------------
# 2. AI客户端管理
# -----------------------------------------------------------------------

class AIClientManager:
    """AI客户端管理器"""
    
    def __init__(self):
        self.openai_client = None
        self.gemini_configured = False
        self.setup_clients()
    
    def setup_clients(self):
        """根据配置设置AI客户端"""
        api_config = settings.get_api_config()
        
        if api_config["provider"] == "gemini" and api_config["api_key"]:
            try:
                genai.configure(api_key=api_config["api_key"])
                self.gemini_configured = True
            except Exception as e:
                print(f"Gemini配置失败: {e}")
                self.gemini_configured = False
        
        elif api_config["provider"] in ["openai", "custom"] and api_config["api_key"]:
            try:
                base_url = api_config["base_url"] if api_config["provider"] == "custom" else None
                self.openai_client = AsyncOpenAI(
                    api_key=api_config["api_key"],
                    base_url=base_url
                )
            except Exception as e:
                print(f"OpenAI客户端配置失败: {e}")
                self.openai_client = None
    
    def refresh_clients(self):
        """刷新客户端配置"""
        self.setup_clients()
    
    def is_configured(self) -> bool:
        """检查是否已正确配置"""
        api_config = settings.get_api_config()
        
        if api_config["provider"] == "gemini":
            return self.gemini_configured
        elif api_config["provider"] in ["openai", "custom"]:
            return self.openai_client is not None
        
        return False

# 全局AI客户端管理器
ai_manager = AIClientManager()

# -----------------------------------------------------------------------
# 3. 内容生成引擎
# -----------------------------------------------------------------------

def get_style_prompt(style: str, topic: str) -> str:
    """根据风格获取对应的提示词"""
    
    # 核心基础提示词 - 确保生成HTML动画
    base_html_prompt = f"""请你生成一个非常精美的动态动画,讲讲 {topic}
要动态的,要像一个完整的,正在播放的视频。包含一个完整的过程，能把知识点讲清楚。
页面极为精美，好看，有设计感，同时能够很好的传达知识。知识和图像要准确
附带一些旁白式的文字解说,从头到尾讲清楚一个小的知识点
不需要任何互动按钮,直接开始播放

**代码质量要求：**
- 确保JavaScript语法完全正确，没有任何语法错误
- 所有的document.getElementById()调用都要正确
- 变量声明和函数调用都要准确无误
- 代码要能在浏览器中正常运行

**视觉要求：**
- 请保证任何一个元素都在一个2k分辨率的容器中被摆在了正确的位置
- 避免穿模，字幕遮挡，图形位置错误等等问题影响正确的视觉传达
- 动画要流畅，过渡要自然

**输出格式：**
html+css+js+svg，放进一个完整的html文件里，确保代码可以直接在浏览器中运行"""
    
    if style == "luxury":
        return f"""{base_html_prompt}

**奢华暗黑风格要求：**
- 使用深邃渐变背景，营造神秘科技感 (background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%))
- 采用霓虹色彩强调（钻石蓝#00D4FF/奢华金#FFD700/激光紫#9D4EDD）
- 内容呈现要有玻璃态毛玻璃效果 (backdrop-filter: blur(20px), background: rgba(255,255,255,0.1))
- 文字要有发光效果，突出重点 (text-shadow: 0 0 20px currentColor)
- 整体风格要体现高端科技感和奢华质感
- 添加动态粒子背景效果 (CSS animations + JavaScript)
- 知识点要准确，视觉要震撼
- 使用和谐好看的浅色配色方案，使用很多的，丰富的视觉元素。双语字幕"""
    
    elif style == "aurora":
        return f"""{base_html_prompt}

**Aurora红黑风格要求：**
- 使用纯黑色背景 (background: #000000)
- 采用特斯拉红(#E31937)作为唯一强调色
- 超大字体展示核心概念，形成视觉冲击 (font-size: clamp(2rem, 8vw, 6rem))
- 中英文混用，中文大字体粗体，英文小字点缀
- 采用全屏分页的PPT演示形式，模仿Apple官网的段落切屏和视差缩放动效
- 使用简洁的图形化元素，强调超大视觉元素与小元素的比例反差
- 使用和谐好看的配色方案，使用丰富的视觉元素。双语字幕"""
    
    else:  # default
        return f"""{base_html_prompt}

**默认动画风格要求：**
- 生成精美的动态动画效果，包含完整的知识讲解过程
- 页面要有设计感，传达准确的知识，附带旁白式的文字解说
- 使用和谐好看，广泛采用的浅色配色方案
- 使用很多的，丰富的视觉元素。双语字幕
- 确保所有元素在2k分辨率下正确显示，避免穿模，字幕遮挡，图形位置错误等问题"""

async def generate_content_stream(
    topic: str,
    style: str = "default",
    history: Optional[List[dict]] = None,
    model: str = None
) -> AsyncGenerator[str, None]:
    """流式生成内容"""
    
    if not ai_manager.is_configured():
        yield f"data: {json.dumps({'error': '请先配置API密钥'})}\n\n"
        return
    
    history = history or []
    api_config = settings.get_api_config()
    model = model or api_config["model"]
    
    # 获取风格化提示词
    system_prompt = get_style_prompt(style, topic)
    
    try:
        if api_config["provider"] == "gemini":
            # 使用Gemini生成
            full_prompt = system_prompt + "\n\n" + topic
            if history:
                history_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])
                full_prompt = history_text + "\n\n" + full_prompt
            
            model_instance = genai.GenerativeModel(model)
            response = await asyncio.get_event_loop().run_in_executor(
                None, 
                lambda: model_instance.generate_content(full_prompt)
            )
            
            text = response.text
            chunk_size = 50
            
            for i in range(0, len(text), chunk_size):
                chunk = text[i:i+chunk_size]
                payload = json.dumps({"token": chunk}, ensure_ascii=False)
                yield f"data: {payload}\n\n"
                await asyncio.sleep(0.05)
        
        else:
            # 使用OpenAI兼容API生成
            messages = [
                {"role": "system", "content": system_prompt},
                *history,
                {"role": "user", "content": topic},
            ]

            response = await ai_manager.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True,
                temperature=0.8,
            )

            async for chunk in response:
                token = chunk.choices[0].delta.content or ""
                if token:
                    payload = json.dumps({"token": token}, ensure_ascii=False)
                    yield f"data: {payload}\n\n"
                    await asyncio.sleep(0.001)
    
    except Exception as e:
        yield f"data: {json.dumps({'error': f'生成失败: {str(e)}'})}\n\n"
        return

    yield 'data: {"event":"[DONE]"}\n\n'

# -----------------------------------------------------------------------
# 4. API路由定义
# -----------------------------------------------------------------------

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """主页面"""
    # 获取配置状态
    is_configured = ai_manager.is_configured()
    api_config = settings.get_api_config()
    
    return templates.TemplateResponse("index.html", {
        "request": request,
        "is_configured": is_configured,
        "current_provider": api_config["provider"],
        "current_model": api_config["model"]
    })

@app.post("/api/generate")
async def generate_content(request: GenerationRequest):
    """生成内容API"""
    return StreamingResponse(
        generate_content_stream(
            topic=request.topic,
            style=request.style,
            history=request.history
        ),
        media_type="text/plain"
    )

@app.post("/api/config/api")
async def update_api_config(config: APIConfigRequest):
    """更新API配置"""
    try:
        success = settings.update_api_config(
            provider=config.provider,
            api_key=config.api_key,
            base_url=config.base_url,
            model=config.model
        )
        
        if success:
            # 刷新AI客户端
            ai_manager.refresh_clients()
            
            return JSONResponse({
                "success": True,
                "message": "API配置更新成功",
                "is_configured": ai_manager.is_configured()
            })
        else:
            raise HTTPException(status_code=500, detail="配置保存失败")
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"配置更新失败: {str(e)}")

@app.get("/api/config")
async def get_config():
    """获取当前配置"""
    api_config = settings.get_api_config()
    
    # 隐藏API密钥的完整内容
    if api_config["api_key"]:
        api_config["api_key"] = api_config["api_key"][:8] + "..." if len(api_config["api_key"]) > 8 else "***"
    
    return JSONResponse({
        "api": api_config,
        "ui": {
            "theme": settings.get("ui.theme", "klein-blue"),
            "language": settings.get("ui.language", "zh-CN")
        },
        "generation": {
            "default_style": settings.get("generation.default_style", "default")
        },
        "is_configured": ai_manager.is_configured()
    })

@app.get("/api/styles")
async def get_available_styles():
    """获取可用的生成风格"""
    styles = [
        {
            "name": "default",
            "display_name": "默认动画风格",
            "description": "保持原有的动画生成方式，适合日常知识展示"
        },
        {
            "name": "luxury",
            "display_name": "奢华暗黑风格", 
            "description": "科技感霓虹效果，深邃渐变背景，钻石质感设计"
        },
        {
            "name": "aurora",
            "display_name": "Aurora红黑风格",
            "description": "特斯拉红配黑底，超大字体视觉冲击，Apple风格动效"
        }
    ]
    
    return JSONResponse({"styles": styles})

@app.get("/api/health")
async def health_check():
    """健康检查API"""
    return JSONResponse({
        "status": "healthy",
        "timestamp": datetime.now(shanghai_tz).isoformat(),
        "version": "2.0.0",
        "is_configured": ai_manager.is_configured()
    })

# -----------------------------------------------------------------------
# 5. 应用启动和错误处理
# -----------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "内部服务器错误",
            "detail": str(exc),
            "timestamp": datetime.now(shanghai_tz).isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 启动 BINGO知识之象...")
    print("📍 访问地址: http://127.0.0.1:8000")
    print("⚙️  配置界面: http://127.0.0.1:8000#config")
    
    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
        log_level="info"
    )