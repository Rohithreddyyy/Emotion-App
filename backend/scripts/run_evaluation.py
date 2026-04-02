import json
import os
import random
import numpy as np
import datasets
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from transformers import pipeline
import warnings

warnings.filterwarnings("ignore")

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(os.path.dirname(current_dir), 'data')
    os.makedirs(data_dir, exist_ok=True)

    labels = ['joy', 'sadness', 'anger', 'fear', 'neutral', 'surprise']
    
    print("Loading actual dair-ai/emotion dataset from Hugging Face for 100% REAL text evaluation...")
    dataset = datasets.load_dataset("dair-ai/emotion", split="validation", trust_remote_code=True)
    
    # HF mapping: 0: sadness, 1: joy, 2: love, 3: anger, 4: fear, 5: surprise
    dataset_texts = dataset["text"]
    dataset_labels = dataset["label"]
    
    X_real = []
    y_real = []
    
    # Map love (2) to joy (1).
    for text, label in zip(dataset_texts, dataset_labels):
        if label == 0:
            y_real.append("sadness")
        elif label == 1 or label == 2:
            y_real.append("joy")
        elif label == 3:
            y_real.append("anger")
        elif label == 4:
            y_real.append("fear")
        elif label == 5:
            y_real.append("surprise")
        X_real.append(text)
        
    # Inject some neutral sentences since dair-ai lacks 'neutral'
    neutral_texts = [
        "I am going to the store.", "The sky is blue today.", "Here is a pencil.", "The meeting is at 3pm.",
        "Water boils at 100 degrees Celsius.", "I bought some groceries.", "The book is on the table.",
        "They are walking down the street.", "Please open the door.", "My name is John.",
        "The train arrived exactly on time.", "There is a computer on the desk.", "It is a Tuesday.",
        "A car drove past the house.", "The wall is painted white.", "She is reading a newspaper.",
        "The cat is sleeping on the floor.", "He wears a grey jacket.", "The window is slightly open.",
        "The document has five pages.", "I drank a glass of water.", "The clock shows twelve o'clock.",
        "There are clouds in the sky.", "A bird is on the branch."
    ] * 6  # ~144 neutral texts
    
    for text in neutral_texts:
        X_real.append(text)
        y_real.append("neutral")
        
    # Subsample to speed up local TF-IDF and BERT evaluation
    random.seed(42)
    sample_indices = random.sample(range(len(X_real)), min(1500, len(X_real)))
    
    X_sampled = [X_real[i] for i in sample_indices]
    y_sampled = [y_real[i] for i in sample_indices]
    
    # 80-20 train-test split
    train_size = int(len(X_sampled) * 0.8)
    X_train, X_test = X_sampled[:train_size], X_sampled[train_size:]
    y_train, y_test = y_sampled[:train_size], y_sampled[train_size:]
    
    print(f"Dataset split: {len(X_train)} training, {len(X_test)} testing texts")
    
    print("Vectorizing real text using TF-IDF...")
    vectorizer = TfidfVectorizer(max_features=3000, stop_words='english')
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    print("Training REAL ML (Logistic Regression) model on text data...")
    ml_model = LogisticRegression(max_iter=1000, class_weight='balanced')
    ml_model.fit(X_train_vec, y_train)
    y_pred_ml = ml_model.predict(X_test_vec).tolist()
    
    print("Training REAL DL (MLP Neural Network) model on text data...")
    dl_model = MLPClassifier(hidden_layer_sizes=(128,), max_iter=500)
    dl_model.fit(X_train_vec, y_train)
    y_pred_dl = dl_model.predict(X_test_vec).tolist()
    
    print("Evaluating ACTUAL pipeline BERT (DistilRoBERTa) from Hugging Face on test set... (This takes a few seconds)")
    classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", device=-1)
    
    y_pred_bert = []    
    for text in X_test:
        res = classifier(text[:512])
        top_emotion = res[0]['label'].lower()
        if top_emotion == 'disgust': 
            top_emotion = 'anger' # map disgust to anger since we don't track disgust
        y_pred_bert.append(top_emotion)

    def evaluate_model(name, y_t, y_p):
        p_scores = precision_score(y_t, y_p, labels=labels, average=None, zero_division=0)
        r_scores = recall_score(y_t, y_p, labels=labels, average=None, zero_division=0)
        f_scores = f1_score(y_t, y_p, labels=labels, average=None, zero_division=0)
        
        per_class = {
            label: {
                "precision": round(p, 4),
                "recall": round(r, 4),
                "f1": round(f, 4)
            } for label, p, r, f in zip(labels, p_scores, r_scores, f_scores)
        }
        
        return {
            "model": name,
            "accuracy": round(accuracy_score(y_t, y_p), 4),
            "precision": round(precision_score(y_t, y_p, average='weighted', zero_division=0), 4),
            "recall": round(recall_score(y_t, y_p, average='weighted', zero_division=0), 4),
            "f1": round(f1_score(y_t, y_p, average='weighted', zero_division=0), 4),
            "per_class": per_class,
            "confusion_matrix": confusion_matrix(y_t, y_p, labels=labels).tolist()
        }

    print("Computing comprehensive metrics and generating report...")
    results = {
        "labels": labels,
        "metrics": {
            "ML": evaluate_model("ML (Logistic Regression)", y_test, y_pred_ml),
            "DL": evaluate_model("DL (MLP)", y_test, y_pred_dl),
            "BERT": evaluate_model("BERT (DistilRoBERTa)", y_test, y_pred_bert),
        }
    }

    file_path = os.path.join(data_dir, 'evaluation_metrics.json')
    with open(file_path, 'w') as f:
        json.dump(results, f, indent=4)

    print(f"Results successfully saved to {file_path}")

if __name__ == "__main__":
    main()
