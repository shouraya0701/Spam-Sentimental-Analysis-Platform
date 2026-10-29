"""
TextGuard — ML Training Script
Run from the backend/ folder:  python ml/train.py

Downloads two UCI datasets, trains two scikit-learn pipelines, saves joblib files.
"""

import os
import sys
import zipfile
from pathlib import Path

import pandas as pd
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
import joblib

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent          # backend/ml/
DATA_DIR   = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
DATA_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)

# ── Dataset URLs ─────────────────────────────────────────────────────────────
SPAM_URL      = "https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip"
SENTIMENT_URL = "https://archive.ics.uci.edu/static/public/331/sentiment+labelled+sentences.zip"


def download_and_extract(url: str, dest_dir: Path, label: str) -> bool:
    """Download a zip from url, extract into dest_dir. Returns True on success."""
    zip_path = dest_dir / "download.zip"
    print(f"  Downloading {label} ...")
    try:
        response = requests.get(url, timeout=60)
        response.raise_for_status()
    except Exception as exc:
        print(f"\n✗  Could not download {label}: {exc}")
        return False
    zip_path.write_bytes(response.content)
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(dest_dir)
    zip_path.unlink()
    print(f"  ✓ {label} downloaded and extracted.")
    return True


# ── 1. Spam dataset ──────────────────────────────────────────────────────────
print("\n=== SPAM MODEL ===")

spam_file = DATA_DIR / "SMSSpamCollection"
if not spam_file.exists():
    ok = download_and_extract(SPAM_URL, DATA_DIR, "SMS Spam Collection")
    if not ok or not spam_file.exists():
        print(
            "\nManual download instructions:\n"
            f"  1. Go to {SPAM_URL}\n"
            f"  2. Extract the file 'SMSSpamCollection' into:  {DATA_DIR}\n"
        )
        sys.exit(1)

spam_df = pd.read_csv(
    spam_file, sep="\t", header=None, names=["label", "text"], encoding="utf-8"
)
spam_df.dropna(inplace=True)
spam_df.drop_duplicates(inplace=True)
print(f"Spam dataset: {len(spam_df)} rows  |  {spam_df['label'].value_counts().to_dict()}")

X_spam, y_spam = spam_df["text"], spam_df["label"]
X_tr, X_te, y_tr, y_te = train_test_split(
    X_spam, y_spam, test_size=0.2, stratify=y_spam, random_state=42
)

spam_pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True, ngram_range=(1, 2), max_features=5000, stop_words="english"
    )),
    ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
])
spam_pipeline.fit(X_tr, y_tr)
spam_acc = spam_pipeline.score(X_te, y_te)
print(f"\nSpam accuracy: {spam_acc:.4f}")
print(classification_report(y_te, spam_pipeline.predict(X_te)))

joblib.dump(spam_pipeline, MODELS_DIR / "spam_model.joblib")
print(f"✓ Saved spam model -> {MODELS_DIR / 'spam_model.joblib'}")


# ── 2. Sentiment dataset ─────────────────────────────────────────────────────
print("\n=== SENTIMENT MODEL ===")

sent_dir = DATA_DIR / "sentiment labelled sentences"
if not sent_dir.exists():
    ok = download_and_extract(SENTIMENT_URL, DATA_DIR, "Sentiment Labelled Sentences")
    if not ok:
        print(
            "\nManual download instructions:\n"
            f"  1. Go to {SENTIMENT_URL}\n"
            f"  2. Extract the folder 'sentiment labelled sentences' into:  {DATA_DIR}\n"
        )
        sys.exit(1)

sent_files = [
    sent_dir / "imdb_labelled.txt",
    sent_dir / "amazon_cells_labelled.txt",
    sent_dir / "yelp_labelled.txt",
]
# Verify files exist
missing = [str(f) for f in sent_files if not f.exists()]
if missing:
    print(f"\n✗  Missing sentiment files:\n" + "\n".join(f"  {m}" for m in missing))
    sys.exit(1)

dfs = [
    pd.read_csv(f, sep="\t", header=None, names=["text", "label"], encoding="utf-8")
    for f in sent_files
]
sent_df = pd.concat(dfs, ignore_index=True)
sent_df.dropna(inplace=True)
sent_df.drop_duplicates(inplace=True)
print(f"Sentiment dataset: {len(sent_df)} rows  |  {sent_df['label'].value_counts().to_dict()}")

X_sent, y_sent = sent_df["text"], sent_df["label"]
X_tr2, X_te2, y_tr2, y_te2 = train_test_split(
    X_sent, y_sent, test_size=0.2, stratify=y_sent, random_state=42
)

# NOTE: No stop_words for sentiment — "not good" and "no issues" must stay meaningful
sentiment_pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True, ngram_range=(1, 2), max_features=5000
    )),
    ("clf", LogisticRegression(max_iter=1000)),
])
sentiment_pipeline.fit(X_tr2, y_tr2)
sent_acc = sentiment_pipeline.score(X_te2, y_te2)
print(f"\nSentiment accuracy: {sent_acc:.4f}")
print(classification_report(y_te2, sentiment_pipeline.predict(X_te2)))

joblib.dump(sentiment_pipeline, MODELS_DIR / "sentiment_model.joblib")
print(f"✓ Saved sentiment model -> {MODELS_DIR / 'sentiment_model.joblib'}")


# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "=" * 50)
print("TRAINING COMPLETE")
print(f"  Spam accuracy    : {spam_acc * 100:.2f}%  (expected 96–98%)")
print(f"  Sentiment accuracy: {sent_acc * 100:.2f}%  (expected 80–85%)")
print("=" * 50)
