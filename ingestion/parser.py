"""
Parser for organizational communication data.
MVP: Enron-style email corpus (CSV or raw mbox).
Output: list of normalized "events" (sender, receiver, timestamp, body, subject, thread_id).
"""
from __future__ import annotations

import csv
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterator


@dataclass
class CommunicationEvent:
    """Normalized communication event (email, message, etc.)."""

    event_id: str
    sender_id: str
    receiver_id: str
    timestamp: datetime
    subject: str
    body: str
    thread_id: str | None = None
    source: str = "email"


def _normalize_email_id(email: str) -> str:
    """Normalize email to a stable node id (lowercase, strip)."""
    if not email or not isinstance(email, str):
        return "unknown"
    return email.strip().lower()


def _sanitize_body(text: str, max_len: int = 10_000) -> str:
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_len] if len(text) > max_len else text


def parse_enron_csv(path: Path) -> Iterator[CommunicationEvent]:
    """
    Parse a CSV with columns like: message_id, sender, recipients, date, subject, body.
    Adapt column names to your actual Enron export.
    """
    with open(path, encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            # Common Enron CSV column variants
            msg_id = row.get("message_id", row.get("id", str(i)))
            sender = _normalize_email_id(row.get("sender", row.get("from", "")))
            raw_to = row.get("recipients", row.get("to", ""))
            # Handle multiple recipients
            receivers = [r.strip() for r in re.split(r"[,;]", raw_to) if r.strip()]
            if not receivers:
                receivers = ["unknown"]
            date_str = row.get("date", row.get("timestamp", ""))
            try:
                ts = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.utcnow()
            subject = (row.get("subject", "") or "")[:500]
            body = _sanitize_body(row.get("body", row.get("content", "")))

            for recv in receivers:
                recv_id = _normalize_email_id(recv)
                yield CommunicationEvent(
                    event_id=f"{msg_id}_{recv_id}",
                    sender_id=sender,
                    receiver_id=recv_id,
                    timestamp=ts,
                    subject=subject,
                    body=body,
                    thread_id=row.get("thread_id"),
                    source="email",
                )


def load_events_from_csv(path: Path) -> list[CommunicationEvent]:
    """Load all events from an Enron-style CSV into memory."""
    return list(parse_enron_csv(path))


def load_events_from_json(path: Path) -> list[CommunicationEvent]:
    """Load events from a pre-built JSON (e.g. after a first run)."""
    import json

    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    out = []
    for d in data:
        ts = d.get("timestamp")
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        out.append(
            CommunicationEvent(
                event_id=d["event_id"],
                sender_id=d["sender_id"],
                receiver_id=d["receiver_id"],
                timestamp=ts,
                subject=d.get("subject", ""),
                body=d.get("body", ""),
                thread_id=d.get("thread_id"),
                source=d.get("source", "email"),
            )
        )
    return out
