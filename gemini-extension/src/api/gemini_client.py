import os
import google.generativeai as genai

class GeminiModel:
    def __init__(self):
        self.api_key = os.environ["GEMINI_API_KEY"]
        self.generation_config = {
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        }
        self.model = self.configure_model()

    def configure_model(self):
        genai.configure(api_key=self.api_key)
        return genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            generation_config=self.generation_config,
        )

    def start_chat(self):
        return self.model.start_chat(history=[])

    def send_message(self, message):
        chat_session = self.start_chat()
        response = chat_session.send_message(message)
        return response.text