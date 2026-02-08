"""
Extract topics, decisions, and entities from communication content.
Works 100% without API key using heuristics. Optional: OpenAI or Ollama.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

# Try optional LLM backends (not required)
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    import requests
except ImportError:
    requests = None


@dataclass
class ExtractedInfo:
    """Result of extraction from a single message."""

    topics: list[str]
    decisions: list[str]
    entities_mentioned: list[str]
    summary: str
    raw: dict[str, Any]


# Patterns for heuristic extraction (no LLM)
DECISION_PATTERNS = [
    r"\b(?:we\s+)?(?:have\s+)?decided\s+to\s+([^.!?]+)",
    r"\b(?:decision|approved|agreed)\s*[:\s]+([^.!?]+)",
    r"\b(?:let'?s?\s+)?(?:proceed|go\s+ahead)\s+(?:with\s+)?([^.!?]+)",
    r"\b(?:align(?:ed)?|agreed)\s+on\s+([^.!?]+)",
    r"\b(?:will|we'll)\s+([^.!?]+(?:by\s+\w+\s+\d+)?)",
]
TOPIC_FROM_SUBJECT = True  # use subject line as main topic
STOP_WORDS = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "by", "is", "we", "our", "this", "that"}


def _tokenize_for_topics(text: str) -> list[str]:
    """Simple tokenization: words of 3+ chars, not stopwords."""
    words = re.findall(r"\b[a-zA-Z0-9]{3,}\b", (text or "").lower())
    return [w for w in words if w not in STOP_WORDS]


def _extract_decisions_heuristic(body: str) -> list[str]:
    decisions = []
    for pat in DECISION_PATTERNS:
        for m in re.finditer(pat, body or "", re.IGNORECASE):
            s = m.group(1).strip()[:200]
            if s and s not in decisions:
                decisions.append(s)
    if not decisions and body:
        # Fallback: first sentence if it looks like a commitment
        first = (body or "").split(".")[0].strip()[:150]
        if first and any(k in first.lower() for k in ("will", "agree", "approve", "proceed", "align")):
            decisions.append(first)
    return decisions


def _extract_topics_heuristic(subject: str, body: str) -> list[str]:
    topics = []
    if TOPIC_FROM_SUBJECT and subject:
        # Subject often contains the topic
        subj_tokens = _tokenize_for_topics(subject)
        if subj_tokens:
            topics.append(" ".join(subj_tokens[:5]))
    # Add frequent words from body as secondary topics (simple)
    body_tokens = _tokenize_for_topics((body or "")[:2000])
    if body_tokens:
        from collections import Counter
        counts = Counter(body_tokens)
        for w, _ in counts.most_common(3):
            if w not in " ".join(topics).lower():
                topics.append(w)
    return topics[:5]


def _extract_entities_heuristic(body: str) -> list[str]:
    """Simple: email-like strings and capitalized multi-word names (very basic)."""
    entities = []
    for m in re.finditer(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", body or ""):
        e = m.group(0).lower()
        if e not in entities:
            entities.append(e)
    return entities


def extract_heuristic(subject: str, body: str, sender: str = "", receiver: str = "") -> ExtractedInfo:
    """
    Extract topics, decisions, entities using only rules and regex.
    No API key required.
    """
    subject = subject or ""
    body = body or ""
    topics = _extract_topics_heuristic(subject, body)
    decisions = _extract_decisions_heuristic(body)
    entities = _extract_entities_heuristic(body)
    if sender and sender not in entities:
        entities.append(sender)
    if receiver and receiver not in entities:
        entities.append(receiver)
    summary = (subject + ": " + (body[:200].strip() or "(no body)")).strip()[:300]
    return ExtractedInfo(
        topics=topics,
        decisions=decisions,
        entities_mentioned=entities,
        summary=summary,
        raw={"method": "heuristic"},
    )


def extract_with_openai(subject: str, body: str, client: Any, model: str) -> ExtractedInfo:
    """Optional: use OpenAI to extract. Call only when API key is set."""
    if not client or not getattr(client, "chat", None):
        return extract_heuristic(subject, body)
    prompt = f"""From this email extract structured info. Reply with ONLY valid JSON, no markdown.
Subject: {subject[:200]}
Body: {body[:1500]}

JSON format:
{{"topics": ["topic1", "topic2"], "decisions": ["decision1"], "entities_mentioned": ["email@domain.com"], "summary": "one line summary"}}
"""
    try:
        r = client.chat.completions.create(model=model, messages=[{"role": "user", "content": prompt}], temperature=0.1)
        text = r.choices[0].message.content.strip()
        text = re.sub(r"^```\w*\n?", "", text).strip()
        import json
        data = json.loads(text)
        return ExtractedInfo(
            topics=data.get("topics", [])[:5],
            decisions=data.get("decisions", [])[:5],
            entities_mentioned=data.get("entities_mentioned", [])[:10],
            summary=data.get("summary", "")[:300],
            raw=data,
        )
    except Exception:
        return extract_heuristic(subject, body)


def _parse_json_from_response(text: str) -> dict | None:
    """Extract a JSON object from LLM response (may contain markdown or extra text)."""
    import json
    text = (text or "").strip()
    text = re.sub(r"^```(?:json)?\s*\n?", "", text)
    text = re.sub(r"\n?```\s*$", "", text)
    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Try to find {...}
    match = re.search(r"\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return None


def extract_with_ollama(subject: str, body: str, model: str = "llama3.2", base_url: str = "http://localhost:11434") -> ExtractedInfo:
    """Use local Ollama. Requires Ollama installed and model pulled (e.g. ollama run llama3.2)."""
    if not requests:
        return extract_heuristic(subject, body)
    prompt = f"""From this email extract structured info. Reply with ONLY valid JSON, no other text.
Subject: {subject[:200]}
Body: {body[:1500]}

JSON format:
{{"topics": ["topic1", "topic2"], "decisions": ["decision1"], "entities_mentioned": ["email@domain.com"], "summary": "one line summary"}}
"""
    try:
        r = requests.post(
            f"{base_url.rstrip('/')}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=120,
        )
        r.raise_for_status()
        text = (r.json().get("response") or "").strip()
        data = _parse_json_from_response(text)
        if data:
            return ExtractedInfo(
                topics=data.get("topics", [])[:5],
                decisions=data.get("decisions", [])[:5],
                entities_mentioned=data.get("entities_mentioned", [])[:10],
                summary=(data.get("summary") or "")[:300],
                raw=data,
            )
    except Exception:
        pass
    return extract_heuristic(subject, body)


def get_extractor(
    provider: str = "ollama",
    openai_key: str = "",
    openai_model: str = "gpt-4o-mini",
    ollama_model: str = "llama3.2",
    ollama_base: str = "http://localhost:11434",
):
    """
    Return (extract_fn, provider_name). Use config.get_settings() and pass its values.
    provider: "ollama" (default) | "none" | "openai"
    """
    if provider == "openai" and openai_key and OpenAI:
        client = OpenAI(api_key=openai_key)
        return lambda s, b, sender="", receiver="": extract_with_openai(s, b, client, openai_model), "openai"
    if provider == "ollama" and requests:
        return lambda s, b, sender="", receiver="": extract_with_ollama(s, b, ollama_model, ollama_base), "ollama"
    return lambda s, b, sender="", receiver="": extract_heuristic(s, b, sender, receiver), "heuristic"


def get_extractor_from_settings(settings: Any):
    """Build extractor from config.Settings. Usage: extract_fn, name = get_extractor_from_settings(get_settings())."""
    return get_extractor(
        provider=getattr(settings, "llm_provider", "ollama"),
        openai_key=getattr(settings, "openai_api_key", "") or "",
        openai_model=getattr(settings, "openai_model", "gpt-4o-mini"),
        ollama_model=getattr(settings, "ollama_model", "llama3.2"),
        ollama_base=getattr(settings, "ollama_base_url", "http://localhost:11434"),
    )
