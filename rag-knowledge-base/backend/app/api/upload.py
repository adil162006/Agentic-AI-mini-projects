from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ingestion import save_upload_file, process_document

router = APIRouter()

@router.post("/ingest")
async def ingest_document(file: UploadFile = File(...)):
    try:
        # 1. Save file locally
        file_path = save_upload_file(file)
        
        # 2. Process and Index
        result = process_document(file_path)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))