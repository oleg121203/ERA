# config.py

import os

class Config:
    API_KEY = os.environ.get("GEMINI_API_KEY")
    
    GENERATION_CONFIG = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }