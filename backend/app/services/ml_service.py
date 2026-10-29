"""
ML service: loads both scikit-learn models once at startup and exposes predict().
Models are stored in module-level variables so they are shared across requests.
"""

from pathlib import Path

import joblib

# Resolve paths relative to this file: backend/app/services/ -> backend/ml/models/
_MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "ml" / "models"
_SPAM_PATH = _MODELS_DIR / "spam_model.joblib"
_SENTIMENT_PATH = _MODELS_DIR / "sentiment_model.joblib"

# Module-level holders; None until load_models() is called
_spam_model = None
_sentiment_model = None


def load_models() -> None:
    """
    Called from FastAPI lifespan at startup.
    If files are missing, print a warning but do NOT crash — predict() will raise later.
    """
    global _spam_model, _sentiment_model

    if _SPAM_PATH.exists() and _SENTIMENT_PATH.exists():
        _spam_model = joblib.load(_SPAM_PATH)
        _sentiment_model = joblib.load(_SENTIMENT_PATH)
        print("✓ ML models loaded successfully")
    else:
        print(
            "⚠  Model files not found. "
            "Run:  cd backend && python ml/train.py"
        )


def predict(text: str) -> dict:
    """
    Run spam + sentiment prediction on text.
    Returns:
        {
          "spam_label": "SPAM" | "HAM",
          "spam_confidence": float,
          "sentiment_label": "POSITIVE" | "NEGATIVE",
          "sentiment_confidence": float,
        }
    Raises RuntimeError if models were not loaded.
    """
    if _spam_model is None or _sentiment_model is None:
        raise RuntimeError(
            "Model files not found. Run:  cd backend && python ml/train.py"
        )

    # --- Spam ---
    spam_proba = _spam_model.predict_proba([text])[0]
    spam_classes = _spam_model.classes_           # e.g. ['ham', 'spam']
    spam_pred_idx = spam_proba.argmax()
    spam_pred_raw = spam_classes[spam_pred_idx]   # 'ham' or 'spam'
    spam_label = "SPAM" if spam_pred_raw.lower() == "spam" else "HAM"
    spam_confidence = round(float(spam_proba[spam_pred_idx]), 4)

    # --- Sentiment ---
    sent_proba = _sentiment_model.predict_proba([text])[0]
    sent_classes = _sentiment_model.classes_      # e.g. [0, 1] or ['0', '1']
    sent_pred_idx = sent_proba.argmax()
    sent_pred_raw = sent_classes[sent_pred_idx]   # 0/1 or '0'/'1'
    # Label 1 = positive, 0 = negative (from the UCI dataset)
    sentiment_label = "POSITIVE" if str(sent_pred_raw) == "1" else "NEGATIVE"
    sentiment_confidence = round(float(sent_proba[sent_pred_idx]), 4)

    return {
        "spam_label": spam_label,
        "spam_confidence": spam_confidence,
        "sentiment_label": sentiment_label,
        "sentiment_confidence": sentiment_confidence,
    }
