# Project Structure & Organization

## Directory Layout

```
BINGO知识之象/
├── README.md                    # Project documentation
├── TODO.md                      # Task management and roadmap
├── requirements.txt             # Python dependencies
├── app.py                       # Main FastAPI application
├── start_app.py                 # Development startup script
├── test_app.py                  # Application tests
├── test_simple.py               # Basic functionality tests
├── config/                      # Configuration management
│   ├── __init__.py
│   ├── settings.py              # Settings management class
│   └── user_config.json         # User configuration (auto-generated)
├── static/                      # Static assets
│   ├── css/
│   │   └── main.css             # Main application styles
│   ├── js/
│   │   ├── app.js               # Main application logic
│   │   ├── api.js               # API communication
│   │   ├── config.js            # Configuration management
│   │   └── generator.js         # Content generation logic
│   └── images/
│       ├── favicon.png          # Site favicon
│       └── temp_icon.png        # Temporary icons
├── templates/                   # Jinja2 HTML templates
│   └── index.html               # Main application template
├── styles/                      # Modular CSS architecture
│   └── components/
│       ├── base.css             # Base styles and design system
│       └── animations.css       # Animation definitions
└── venv/                        # Python virtual environment (gitignored)
```

## File Organization Principles

### Backend Structure
- **`app.py`**: Single-file FastAPI application with all routes and logic
- **`config/`**: Centralized configuration management
  - Settings class with JSON persistence
  - Default configuration with user overrides
  - API configuration validation
- **`start_app.py`**: Development convenience script with browser auto-open

### Frontend Structure
- **`templates/`**: Server-rendered HTML with Jinja2
  - Single-page application structure
  - Embedded configuration status
- **`static/`**: Client-side assets organized by type
  - **`css/`**: Application-specific styles
  - **`js/`**: Modular JavaScript architecture
  - **`images/`**: Static image assets
- **`styles/`**: Design system and component styles
  - Separate from application-specific CSS
  - Reusable component definitions

### JavaScript Architecture
- **`app.js`**: Main application class, global event handling, Toast manager
- **`api.js`**: API communication layer, HTTP client wrapper
- **`config.js`**: Configuration UI management, modal handling
- **`generator.js`**: Content generation logic, streaming response handling

### CSS Architecture
- **`styles/components/base.css`**: Design system, CSS variables, base components
- **`styles/components/animations.css`**: Animation definitions and keyframes
- **`static/css/main.css`**: Application-specific styles, page layouts

## Naming Conventions

### Files & Directories
- **Python files**: `snake_case.py`
- **JavaScript files**: `camelCase.js` for modules, `kebab-case.js` for utilities
- **CSS files**: `kebab-case.css`
- **HTML templates**: `kebab-case.html`
- **Configuration files**: `snake_case.json`

### Code Conventions
- **Python**: PEP 8 style, snake_case for variables/functions, PascalCase for classes
- **JavaScript**: camelCase for variables/functions, PascalCase for classes/constructors
- **CSS**: kebab-case for classes, camelCase for CSS custom properties
- **HTML**: kebab-case for attributes and IDs

### Component Organization
- **CSS Components**: Organized by functionality (base, animations, themes)
- **JavaScript Modules**: Single responsibility principle, clear imports/exports
- **Template Partials**: Reusable components in separate files (when needed)

## Configuration Management
- **User Settings**: `config/user_config.json` (auto-generated, gitignored)
- **Default Config**: Embedded in `config/settings.py`
- **Runtime Config**: Managed by Settings class with validation
- **Frontend Config**: Synchronized through API endpoints

## Asset Management
- **Static Assets**: Served directly by FastAPI StaticFiles
- **CDN Resources**: TailwindCSS, Font Awesome loaded from CDN
- **Local Assets**: Favicon, custom images, application-specific resources
- **Font Loading**: System fonts with fallbacks, no custom font files

## Development Workflow
1. **Configuration**: Auto-generated on first run
2. **Development Server**: `python start_app.py` with auto-reload
3. **Frontend Changes**: No build step, direct file editing
4. **Backend Changes**: Auto-reload via uvicorn
5. **Testing**: Simple test files for basic validation

## Deployment Structure
- **Single Directory**: All files in project root
- **No Build Process**: Direct Python execution
- **Static Serving**: FastAPI handles all static assets
- **Configuration**: JSON file persistence, no environment variables required

## Extension Points
- **New Styles**: Add CSS files to `styles/` directory
- **New Components**: Add to `static/js/` with modular imports
- **New Templates**: Add to `templates/` directory
- **New APIs**: Add routes to `app.py` with proper organization
- **New Tests**: Add test files following `test_*.py` pattern