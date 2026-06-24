from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import requests
import os
import PyPDF2

app = FastAPI()

class PromptRequest(BaseModel):
    user_id: str
    prompt: str
    attachment_path: Optional[str] = None
    save_response_path: Optional[str] = None

@app.get("/")
def home():
    return {"message": "App Layer API running"}

@app.post("/process")
def process_request(req: PromptRequest):
    final_prompt = req.prompt

    if req.attachment_path and os.path.exists(req.attachment_path):
        file_content = ""

        if req.attachment_path.lower().endswith(".pdf"):
            with open(req.attachment_path, "rb") as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)

                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        file_content += text + "\n"
        else:
            with open(req.attachment_path, "r", encoding="utf-8", errors="ignore") as f:
                file_content = f.read()

        final_prompt += "\n\nAttached file content:\n" + file_content

    ollama_response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.2:latest",
            "prompt": final_prompt,
            "stream": False
        }
    )

    response_text = ollama_response.json().get("response", "")

    if req.save_response_path:
        os.makedirs(os.path.dirname(req.save_response_path), exist_ok=True)
        with open(req.save_response_path, "w", encoding="utf-8") as f:
            f.write(response_text)

    return {
        "status": "success",
        "response_text": response_text,
        "saved_file_path": req.save_response_path
    }