"""
Configuration centralisée.
Utilise variables d'environnement ou .env (python-dotenv).
"""
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Settings for the AI Chief of Staff app."""

    # Paths
    project_root: Path = Path(__file__).resolve().parent.parent
    data_dir: Path = project_root / "data"
    raw_data_dir: Path = data_dir / "raw"
    processed_data_dir: Path = data_dir / "processed"

    # LLM: "ollama" = local (default), "none" = heuristics, "openai" = API
    llm_provider: str = "ollama"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_model_extraction: str = "gpt-4o-mini"
    ollama_model: str = "llama3.2"
    ollama_base_url: str = "http://localhost:11434"

    # Data source (Enron subset path or SNAP)
    enron_metadata_path: str = ""
    events_output_path: str = "data/processed/events.json"

    # Graph
    graph_output_path: str = "data/processed/graph.json"

    # Legacy: True = no API, use heuristics
    mock_llm: bool = False

    class Config:
        env_file = str(Path(__file__).resolve().parent.parent / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"


def get_settings() -> Settings:
    return Settings()
