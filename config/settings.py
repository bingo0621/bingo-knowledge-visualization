"""
BINGO知识之象 - 配置管理
Configuration management for BINGO Knowledge Visualization
"""

import json
import os
from typing import Dict, Any, Optional


class Settings:
    """应用配置管理类"""
    
    def __init__(self):
        self.config_file = "config/user_config.json"
        self.default_config = {
            "api": {
                "provider": "gemini",  # gemini, openai, custom
                "api_key": "",
                "base_url": "",
                "model": "gemini-2.5-pro"
            },
            "ui": {
                "theme": "klein-blue",  # klein-blue, luxury-dark, aurora-red
                "language": "zh-CN",
                "animation_speed": "normal"
            },
            "generation": {
                "default_style": "default",  # default, luxury, aurora
                "quality": "high",
                "timeout": 120
            }
        }
        self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """加载配置文件"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                # 合并默认配置和用户配置
                self.config = self._merge_config(self.default_config, user_config)
            else:
                self.config = self.default_config.copy()
                self.save_config()
        except Exception as e:
            print(f"配置加载失败，使用默认配置: {e}")
            self.config = self.default_config.copy()
        
        return self.config
    
    def save_config(self) -> bool:
        """保存配置文件"""
        try:
            os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"配置保存失败: {e}")
            return False
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取配置值，支持点号分隔的嵌套键"""
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key: str, value: Any) -> bool:
        """设置配置值，支持点号分隔的嵌套键"""
        keys = key.split('.')
        config = self.config
        
        # 导航到目标位置
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        # 设置值
        config[keys[-1]] = value
        return self.save_config()
    
    def update_api_config(self, provider: str, api_key: str, base_url: str = "", model: str = "") -> bool:
        """更新API配置"""
        self.config["api"]["provider"] = provider
        self.config["api"]["api_key"] = api_key
        self.config["api"]["base_url"] = base_url
        
        if model:
            self.config["api"]["model"] = model
        else:
            # 根据提供商设置默认模型
            if provider == "gemini":
                self.config["api"]["model"] = "gemini-2.5-pro"
            elif provider == "openai":
                self.config["api"]["model"] = "gpt-4"
            elif provider == "custom":
                self.config["api"]["model"] = model or "default"
        
        return self.save_config()
    
    def get_api_config(self) -> Dict[str, str]:
        """获取API配置"""
        return {
            "provider": self.get("api.provider", "gemini"),
            "api_key": self.get("api.api_key", ""),
            "base_url": self.get("api.base_url", ""),
            "model": self.get("api.model", "gemini-2.5-pro")
        }
    
    def validate_api_config(self) -> bool:
        """验证API配置是否完整"""
        api_config = self.get_api_config()
        
        if not api_config["api_key"]:
            return False
        
        if api_config["provider"] == "custom" and not api_config["base_url"]:
            return False
        
        return True
    
    def _merge_config(self, default: Dict, user: Dict) -> Dict:
        """递归合并配置字典"""
        result = default.copy()
        
        for key, value in user.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._merge_config(result[key], value)
            else:
                result[key] = value
        
        return result


# 全局配置实例
settings = Settings()


def get_settings() -> Settings:
    """获取全局配置实例"""
    return settings