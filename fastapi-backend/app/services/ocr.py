from typing import Dict, Any


class OCRService:
    async def extract_text_from_file(self, filename: str, file_bytes: bytes) -> Dict[str, Any]:
        """Simulates OCR extraction of plain text from pdf, docx, or image files."""
        # Clean text decode
        try:
            raw_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            raw_text = "[Binary or scanned document content extracted successfully]"

        word_count = len(raw_text.split())
        return {
            "text": raw_text,
            "word_count": word_count,
            "file_type": filename.split(".")[-1].upper() if "." in filename else "UNKNOWN"
        }


ocr_service = OCRService()
