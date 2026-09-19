import sys
import os
import uvicorn

# Ensure both workspace root and backend directory are on sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8005))
    print(f"Starting AuraStream FastAPI Server on http://127.0.0.1:{port} ...")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=port, reload=True)
