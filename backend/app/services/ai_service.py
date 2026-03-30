"""
Service d'IA pour la génération de descriptions produits
"""
from typing import Optional
import logging
from ..core.config import settings
from ..schemas.product import AIDescriptionRequest

logger = logging.getLogger(__name__)


class AIService:
    """Service de génération de descriptions par IA"""
    
    def __init__(self):
        self.provider = settings.AI_PROVIDER
        logger.info(f"AI Service initialisé avec provider: {self.provider}")
    
    async def generate_description(self, request: AIDescriptionRequest) -> str:
        """
        Génère une description de produit reconditionné
        
        Args:
            request: Données du produit
        
        Returns:
            Description générée par l'IA
        """
        prompt = self._build_prompt(request)
        
        if self.provider == "openai":
            return await self._generate_with_openai(prompt)
        elif self.provider == "anthropic":
            return await self._generate_with_anthropic(prompt)
        elif self.provider == "google":
            return await self._generate_with_google(prompt)
        else:
            return self._generate_fallback(request)
    
    def _build_prompt(self, request: AIDescriptionRequest) -> str:
        """Construit le prompt pour l'IA"""
        condition_text = {
            "excellent": "excellent état, comme neuf",
            "bon": "bon état, quelques traces d'usage",
            "correct": "état correct, signes d'utilisation visible"
        }
        
        specs_text = f"\nCaractéristiques : {request.specifications}" if request.specifications else ""
        
        prompt = f"""Tu es un expert en e-commerce de produits reconditionnés. 
Génère une description professionnelle et engageante pour ce produit :

Produit : {request.name}
Marque : {request.brand}
Catégorie : {request.category}
État : {condition_text.get(request.condition, request.condition)}{specs_text}

La description doit :
- Être rassurante et professionnelle
- Mettre en avant la qualité du reconditionnement
- Mentionner la garantie et le contrôle qualité
- Être optimisée pour l'e-commerce
- Faire environ 150-200 mots
- Être en français

Génère uniquement la description, sans titre ni introduction."""
        
        return prompt
    
    async def _generate_with_openai(self, prompt: str) -> str:
        """Génère avec OpenAI"""
        try:
            import openai
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Tu es un expert en rédaction de descriptions e-commerce."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            logger.info("Description générée avec succès via OpenAI")
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            logger.error(f"Erreur OpenAI: {e}", exc_info=True)
            return self._generate_fallback_from_prompt(prompt)
    
    async def _generate_with_anthropic(self, prompt: str) -> str:
        """Génère avec Anthropic Claude"""
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            
            message = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=500,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            logger.info("Description générée avec succès via Anthropic")
            return message.content[0].text.strip()
        
        except Exception as e:
            logger.error(f"Erreur Anthropic: {e}", exc_info=True)
            return self._generate_fallback_from_prompt(prompt)
    
    async def _generate_with_google(self, prompt: str) -> str:
        """Génère avec Google Gemini"""
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            
            logger.info("Description générée avec succès via Google Gemini")
            return response.text.strip()
        
        except Exception as e:
            logger.error(f"Erreur Google Gemini: {e}", exc_info=True)
            return self._generate_fallback_from_prompt(prompt)
    
    def _generate_fallback(self, request: AIDescriptionRequest) -> str:
        """Génère une description de secours si l'IA n'est pas disponible"""
        condition_text = {
            "excellent": "en excellent état, comme neuf",
            "bon": "en bon état général",
            "correct": "en état correct"
        }
        
        description = f"""Ce {request.name} de marque {request.brand} reconditionné {condition_text.get(request.condition, "")} a été soigneusement testé, nettoyé et remis à neuf par nos experts.

Chaque appareil reconditionné passe par un processus de contrôle qualité rigoureux comprenant plus de 30 points de vérification. Nous garantissons son bon fonctionnement et sa fiabilité.

Ce produit constitue une alternative écologique et économique au produit neuf, tout en offrant des performances optimales. Il est livré avec une garantie de 12 mois et un service client dédié.

Profitez d'un produit de qualité à prix réduit, tout en participant à une consommation plus responsable."""
        
        return description
    
    def _generate_fallback_from_prompt(self, prompt: str) -> str:
        """Génère une description basique en cas d'erreur API"""
        return """Ce produit reconditionné de qualité a été rigoureusement testé et contrôlé par nos experts. 

Il a bénéficié d'un nettoyage complet et d'un reconditionnement professionnel pour garantir des performances optimales. Chaque appareil passe par un processus de vérification strict incluant plus de 30 points de contrôle.

Opter pour un produit reconditionné, c'est faire un choix économique et écologique intelligent. Vous bénéficiez d'un produit performant à prix réduit, tout en contribuant à réduire l'impact environnemental.

Livré avec une garantie constructeur de 12 mois et un service client dédié à votre écoute."""


# Instance globale
ai_service = AIService()
