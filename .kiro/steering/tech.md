# Technology Stack & Build System

## Backend Technology Stack
- **Framework**: FastAPI (Python 3.9+)
- **Web Server**: Uvicorn with auto-reload for development
- **Template Engine**: Jinja2 for HTML templating
- **Configuration**: JSON-based user configuration with Python settings management
- **AI Integration**: 
  - Google Generative AI (Gemini 2.5 Pro)
  - OpenAI Python SDK (GPT models)
  - Custom OpenAI-compatible API support
- **Async Support**: Full async/await pattern for AI API calls
- **CORS**: Configured for cross-origin requests

## Frontend Technology Stack
- **Core**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **CSS Framework**: TailwindCSS 3.0+ (CDN)
- **UI Theme**: Klein Blue + Apple-inspired design system
- **Icons**: Font Awesome 6.4.0
- **Fonts**: 
  - Chinese: PingFang SC, Hiragino Sans GB, Microsoft YaHei
  - English: SF Pro Display, -apple-system, BlinkMacSystemFont
  - Monospace: SF Mono, Monaco, Cascadia Code
- **Responsive**: Mobile-first responsive design
- **Animations**: CSS transitions and keyframe animations

## Project Structure
```
├── app.py                 # Main FastAPI application
├── start_app.py          # Development startup script
├── config/               # Configuration management
├── static/               # Static assets (CSS, JS, images)
├── templates/            # Jinja2 HTML templates
├── styles/               # Modular CSS (base, components, themes)
└── requirements.txt      # Python dependencies
```

## Development Commands

### Environment Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Development Server
```bash
# Start development server (auto-reload enabled)
python start_app.py

# Alternative: Direct uvicorn command
uvicorn app:app --host 127.0.0.1 --port 8000 --reload

# Access application
# Main app: http://127.0.0.1:8000
# Config UI: http://127.0.0.1:8000#config
```

### Testing Commands
```bash
# Run basic tests
python test_simple.py

# Run application tests
python test_app.py

# Health check
curl http://127.0.0.1:8000/api/health
```

## Key Dependencies
- `fastapi` - Modern web framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation
- `openai` - OpenAI API client
- `google-generativeai` - Google Gemini API
- `jinja2` - Template engine
- `pytz` - Timezone handling

## Configuration System
- **User Config**: `config/user_config.json` (auto-generated)
- **Settings Management**: `config/settings.py` with default fallbacks
- **API Configuration**: Frontend-configurable through UI
- **Environment**: No environment variables required for basic setup

## Build & Deployment Notes
- **No Build Step**: Direct Python execution, no compilation needed
- **Static Assets**: Served directly by FastAPI
- **Hot Reload**: Enabled in development mode
- **Production**: Use `uvicorn app:app --host 0.0.0.0 --port 8000` for production

## Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features Used**: ES6+, CSS Grid, Flexbox, CSS Custom Properties