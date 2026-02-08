"""
Parser spécialisé pour le dataset Enron réel.
Format: file, message (avec en-têtes email complets)
Extrait: message_id, sender, recipients, date, subject, body
"""
import csv
import re
from datetime import datetime
from pathlib import Path
from typing import Iterator

from ingestion.parser import CommunicationEvent, _normalize_email_id, _sanitize_body

# Augmenter la limite de taille des champs CSV pour les longs emails Enron
csv.field_size_limit(10000000)  # 10MB par champ


def parse_enron_raw(path: Path, max_events: int = None) -> Iterator[CommunicationEvent]:
    """
    Parse le vrai dataset Enron avec format file,message.
    Chaque ligne contient un email complet avec en-têtes.
    """
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        
        for i, row in enumerate(reader):
            if max_events and i >= max_events:
                break
                
            try:
                # Extraire les informations du message brut
                message_content = row.get('message', '')
                
                # Parser les en-têtes email
                message_id = extract_message_id(message_content, i)
                sender = extract_sender(message_content)
                recipients = extract_recipients(message_content)
                date_str = extract_date(message_content)
                subject = extract_subject(message_content)
                body = extract_body(message_content)
                
                # Normaliser et créer des événements pour chaque destinataire
                if not recipients:
                    recipients = ["unknown"]
                    
                for recipient in recipients:
                    recipient_id = _normalize_email_id(recipient)
                    sender_id = _normalize_email_id(sender)
                    
                    if recipient_id and sender_id:
                        yield CommunicationEvent(
                            event_id=f"{message_id}_{recipient_id}",
                            sender_id=sender_id,
                            receiver_id=recipient_id,
                            timestamp=date_str,
                            subject=subject,
                            body=_sanitize_body(body),
                            thread_id=None,
                            source="enron_email"
                        )
                        
            except Exception as e:
                print(f"Erreur parsing ligne {i}: {e}")
                continue


def extract_message_id(message: str, line_num: int) -> str:
    """Extraire le Message-ID de l'email."""
    match = re.search(r'Message-ID:\s*<([^>]+)>', message, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return f"enron_msg_{line_num}"


def extract_sender(message: str) -> str:
    """Extraire l'expéditeur depuis l'en-tête From."""
    match = re.search(r'From:\s*([^\n]+)', message, re.IGNORECASE)
    if match:
        sender = match.group(1).strip()
        # Nettoyer les noms (ex: "John Doe <john@enron.com>")
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', sender)
        if email_match:
            return email_match.group(0).lower()
    return "unknown@enron.com"


def extract_recipients(message: str) -> list[str]:
    """Extraire les destinataires depuis l'en-tête To."""
    recipients = []
    
    # Chercher l'en-tête To principal
    to_match = re.search(r'To:\s*([^\n]+)', message, re.IGNORECASE)
    if to_match:
        to_field = to_match.group(1)
        # Extraire tous les emails dans le champ To
        email_matches = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', to_field)
        recipients.extend([email.lower() for email in email_matches])
    
    # Chercher aussi dans X-To (format Enron)
    xto_match = re.search(r'X-To:\s*([^\n]+)', message, re.IGNORECASE)
    if xto_match:
        xto_field = xto_match.group(1)
        email_matches = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', xto_field)
        recipients.extend([email.lower() for email in email_matches])
    
    return list(set(recipients)) if recipients else ["unknown"]


def extract_date(message: str) -> datetime:
    """Extraire et parser la date de l'email."""
    # Format typique Enron: "Date: Mon, 14 May 2001 16:39:00 -0700 (PDT)"
    match = re.search(r'Date:\s*([^\n]+)', message, re.IGNORECASE)
    if match:
        date_str = match.group(1).strip()
        try:
            # Essayer de parser différents formats
            for fmt in [
                '%a, %d %b %Y %H:%M:%S %z',
                '%a, %d %b %Y %H:%M:%S %z (%Z)',
                '%d %b %Y %H:%M:%S',
                '%Y-%m-%d %H:%M:%S'
            ]:
                try:
                    return datetime.strptime(date_str.split('(')[0].strip(), fmt)
                except ValueError:
                    continue
        except Exception:
            pass
    
    # Fallback: date actuelle
    return datetime.utcnow()


def extract_subject(message: str) -> str:
    """Extraire le sujet de l'email."""
    match = re.search(r'Subject:\s*([^\n]+)', message, re.IGNORECASE)
    if match:
        subject = match.group(1).strip()
        # Nettoyer les "Re:", "Fwd:", etc. et les en-têtes MIME
        subject = re.sub(r'^(Re|Fwd|FW):\s*', '', subject, flags=re.IGNORECASE)
        subject = re.sub(r'^(Mime-Version|Content-Type):.*$', '', subject, flags=re.IGNORECASE)
        return subject[:500]  # Limiter la longueur
    return "(no subject)"


def extract_body(message: str) -> str:
    """Extraire le corps du message après les en-têtes."""
    # Séparer les en-têtes du corps
    parts = message.split('\n\n', 1)
    if len(parts) > 1:
        body = parts[1].strip()
        # Nettoyer les citations et signatures
        body = re.sub(r'^\s*>-.*$', '', body, flags=re.MULTILINE)
        body = re.sub(r'^\s*-----.*$', '', body, flags=re.MULTILINE)
        return body[:10000]  # Limiter la longueur
    return ""


def load_enron_events(path: Path, max_events: int = None) -> list[CommunicationEvent]:
    """Charger tous les événements du dataset Enron."""
    print(f"Chargement du dataset Enron depuis {path}...")
    events = list(parse_enron_raw(path, max_events))
    print(f"Chargé {len(events)} événements communication")
    return events


if __name__ == "__main__":
    # Test du parser avec échantillon limité
    enron_path = Path(__file__).parent.parent / "data" / "emails.csv"
    if enron_path.exists():
        events = load_enron_events(enron_path, max_events=1000)  # Limiter à 1000 pour le test
        print(f"Test: {len(events)} événements parsés")
        
        # Afficher quelques exemples
        for i, event in enumerate(events[:3]):
            print(f"\nExemple {i+1}:")
            print(f"  De: {event.sender_id}")
            print(f"  À: {event.receiver_id}")
            print(f"  Date: {event.timestamp}")
            print(f"  Sujet: {event.subject}")
            print(f"  Corps: {event.body[:100]}...")
    else:
        print(f"Fichier non trouvé: {enron_path}")
