#!/usr/bin/env python3
"""
Script to start the AI Chief of Staff backend server
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    """Start the FastAPI backend server"""
    print("🚀 Starting AI Chief of Staff Backend...")
    
    # Check if we're in the right directory
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    # Check if virtual environment exists
    venv_path = project_root / ".venv"
    if not venv_path.exists():
        print("❌ Virtual environment not found. Please create it first:")
        print("   python -m venv .venv")
        print("   .venv\\Scripts\\activate  # On Windows")
        print("   source .venv/bin/activate  # On Unix")
        return 1
    
    # Check if dependencies are installed
    try:
        import fastapi
        import uvicorn
        print("✅ Dependencies found")
    except ImportError:
        print("❌ Dependencies not found. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    # Start the server
    print("🌐 Starting FastAPI server on http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("⏹️  Press Ctrl+C to stop the server")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "api.main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n👋 Backend server stopped")
        return 0

if __name__ == "__main__":
    sys.exit(main())
