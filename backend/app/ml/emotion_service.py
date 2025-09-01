import torch
from transformers import pipeline
import logging
from typing import Dict, List, Tuple
import numpy as np
from decimal import Decimal
import os

logger = logging.getLogger(__name__)

class EmotionDetectionService:
    def __init__(self):
        self.model_name = "j-hartmann/emotion-english-distilroberta-base"
        self.emotion_labels = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral']
        self.pipeline = None
        self._load_model()
    
    def _load_model(self):
        """Load the emotion detection model"""
        try:
            # Check if CUDA is available
            device = 0 if torch.cuda.is_available() else -1
            logger.info(f"Loading emotion model on device: {device}")
            
            self.pipeline = pipeline(
                "text-classification",
                model=self.model_name,
                device=device,
                return_all_scores=True
            )
            logger.info("Emotion model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load emotion model: {e}")
            raise
    
    def analyze_emotion(self, text: str) -> Dict:
        """
        Analyze emotion in text and return detailed results
        
        Args:
            text (str): Input text to analyze
            
        Returns:
            Dict: Emotion analysis results with scores and mood index
        """
        try:
            if not text or len(text.strip()) == 0:
                raise ValueError("Text cannot be empty")
            
            # Get emotion predictions
            results = self.pipeline(text)
            
            # Extract scores for each emotion
            emotion_scores = {}
            for result in results[0]:
                emotion_scores[result['label']] = float(result['score'])
            
            # Ensure all emotions are present (some models might not return all)
            for emotion in self.emotion_labels:
                if emotion not in emotion_scores:
                    emotion_scores[emotion] = 0.0
            
            # Calculate mood index: (joy + neutral) - (anger + sadness + disgust + fear + surprise)
            # Scale to 0-100 range
            positive_score = emotion_scores['joy'] + emotion_scores['neutral']
            negative_score = (emotion_scores['anger'] + emotion_scores['sadness'] + 
                           emotion_scores['disgust'] + emotion_scores['fear'] + 
                           emotion_scores['surprise'])
            
            # Normalize to 0-100 scale
            mood_index = max(0, min(100, (positive_score - negative_score + 1) * 50))
            
            # Find dominant emotion
            dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0]
            
            # Convert to Decimal for database storage
            result = {
                'joy': Decimal(str(emotion_scores['joy'])),
                'sadness': Decimal(str(emotion_scores['sadness'])),
                'anger': Decimal(str(emotion_scores['anger'])),
                'fear': Decimal(str(emotion_scores['fear'])),
                'surprise': Decimal(str(emotion_scores['surprise'])),
                'disgust': Decimal(str(emotion_scores['disgust'])),
                'neutral': Decimal(str(emotion_scores['neutral'])),
                'dominant_emotion': dominant_emotion,
                'mood_index': Decimal(str(round(mood_index, 2))),
                'raw_scores': emotion_scores
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing emotion in text: {e}")
            raise
    
    def batch_analyze_emotions(self, texts: List[str]) -> List[Dict]:
        """
        Analyze emotions in multiple texts
        
        Args:
            texts (List[str]): List of texts to analyze
            
        Returns:
            List[Dict]: List of emotion analysis results
        """
        results = []
        for text in texts:
            try:
                result = self.analyze_emotion(text)
                results.append(result)
            except Exception as e:
                logger.error(f"Error analyzing text '{text[:50]}...': {e}")
                # Add default neutral result for failed analysis
                results.append({
                    'joy': Decimal('0.0'),
                    'sadness': Decimal('0.0'),
                    'anger': Decimal('0.0'),
                    'fear': Decimal('0.0'),
                    'surprise': Decimal('0.0'),
                    'disgust': Decimal('0.0'),
                    'neutral': Decimal('1.0'),
                    'dominant_emotion': 'neutral',
                    'mood_index': Decimal('50.0'),
                    'raw_scores': {'neutral': 1.0}
                })
        
        return results
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded model"""
        return {
            'model_name': self.model_name,
            'emotion_labels': self.emotion_labels,
            'device': 'cuda' if torch.cuda.is_available() else 'cpu',
            'loaded': self.pipeline is not None
        }

# Global instance
emotion_service = EmotionDetectionService()
