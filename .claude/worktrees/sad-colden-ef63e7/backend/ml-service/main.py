"""
FastAPI Backend Service for ML-Powered Lawyer Matchmaking
Author: Turn2Law
Description: Production-ready REST API for lawyer-client matching using ML model
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pickle
import pandas as pd
import numpy as np
import logging
import os
from pathlib import Path
import json
import traceback
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://vjfpqtyinumanvpgqlbj.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZnBxdHlpbnVtYW52cGdxbGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0OTEyOTIsImV4cCI6MjA3MTA2NzI5Mn0.IL4G5wXabjKdpUZGBAdAq5bvm1W6Xvb-zg9ux9uq5LY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize FastAPI app
app = FastAPI(
    title="Turn2Law ML Matchmaking API",
    description="ML-powered lawyer-client matching service",
    version="1.0.0"
)

# CORS configuration for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:9002",  # Turn2Law frontend
        "http://localhost:9003",  # Alternative port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to model files
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "best_matchmaking_model.pkl"
SCALER_PATH = BASE_DIR / "feature_scaler.pkl"
ENCODERS_PATH = BASE_DIR / "label_encoders (1).pkl"
MOCK_DATA_PATH = BASE_DIR / "backend" / "ml-service" / "mock_lawyers.json"

# Global variables for loaded models
ml_model = None
feature_scaler = None
label_encoders = None
mock_lawyers_data = None


class ClientRequest(BaseModel):
    """Client request model for lawyer matching"""
    case_type: str = Field(..., description="Type of legal case (e.g., 'Property and Estate', 'Divorce', 'Criminal')")
    case_description: str = Field(..., description="Brief description of the case")
    location: str = Field(default="Chennai", description="Preferred location")
    budget: Optional[float] = Field(default=None, description="Budget for consultation (in INR)")
    urgency: str = Field(default="Medium", description="Urgency level: Low, Medium, High")
    preferred_experience: Optional[int] = Field(default=None, description="Minimum years of experience preferred")
    language_preference: Optional[str] = Field(default="English", description="Preferred language")


class QuerySubmission(BaseModel):
    """Model for client query submission"""
    query: str = Field(..., description="Client's legal query/case description")
    timestamp: str = Field(..., description="Submission timestamp")


class LawyerProfile(BaseModel):
    """Lawyer profile model"""
    id: int
    name: str
    specialization: str
    category: str
    rating: float
    reviews: int
    experience: str
    years_experience: int
    location: str
    city: str
    court: str
    phone: str
    email: str
    consultation_fee: float
    consultation_fee_formatted: str
    about: str
    education: str
    additional_degree: str
    bar_council: str
    bar_number: str
    languages: List[str]
    practice_areas: List[str]
    achievements: List[str]
    success_rate: int
    cases_handled: int
    availability: str
    response_time: str
    image: str
    verified: bool
    available_now: bool
    features: Dict[str, Any]
    match_score: Optional[float] = None
    match_reasons: Optional[List[str]] = None


class MatchResponse(BaseModel):
    """Response model for lawyer matching"""
    success: bool
    matched_lawyers: List[LawyerProfile]
    total_matches: int
    request_summary: Dict[str, Any]


def load_models():
    """Load ML model, scaler, and encoders on startup"""
    global ml_model, feature_scaler, label_encoders, mock_lawyers_data
    
    try:
        # Load ML model (optional - service can work without it)
        if MODEL_PATH.exists():
            try:
                with open(MODEL_PATH, 'rb') as f:
                    ml_model = pickle.load(f)
                logger.info("✓ ML model loaded successfully")
            except Exception as e:
                logger.warning(f"⚠ Could not load ML model: {str(e)}")
                logger.info("  Service will use rule-based matching instead")
        else:
            logger.warning(f"⚠ Model file not found at {MODEL_PATH}")
        
        # Load feature scaler (optional)
        if SCALER_PATH.exists():
            try:
                with open(SCALER_PATH, 'rb') as f:
                    feature_scaler = pickle.load(f)
                logger.info("✓ Feature scaler loaded successfully")
            except Exception as e:
                logger.warning(f"⚠ Could not load scaler: {str(e)}")
        else:
            logger.warning(f"⚠ Scaler file not found at {SCALER_PATH}")
        
        # Load label encoders (optional)
        if ENCODERS_PATH.exists():
            try:
                with open(ENCODERS_PATH, 'rb') as f:
                    label_encoders = pickle.load(f)
                logger.info("✓ Label encoders loaded successfully")
            except Exception as e:
                logger.warning(f"⚠ Could not load encoders: {str(e)}")
        else:
            logger.warning(f"⚠ Encoders file not found at {ENCODERS_PATH}")
        
        # Load mock lawyers data (required)
        if MOCK_DATA_PATH.exists():
            with open(MOCK_DATA_PATH, 'r', encoding='utf-8') as f:
                mock_lawyers_data = json.load(f)
            logger.info(f"✓ Mock lawyers data loaded: {len(mock_lawyers_data)} lawyers")
        else:
            logger.warning(f"⚠ Mock data file not found at {MOCK_DATA_PATH}")
            mock_lawyers_data = []
            
    except Exception as e:
        logger.error(f"❌ Error loading data: {str(e)}")
        # Don't raise - service can still work with mock data
        if not mock_lawyers_data:
            raise


def extract_years_from_experience(exp_str: str) -> int:
    """Extract numeric years from experience string"""
    import re
    match = re.search(r'(\d+)', exp_str)
    return int(match.group(1)) if match else 10


def map_case_type_to_practice_area(case_type: str) -> str:
    """Map user's case type to ML model's practice_area categories"""
    case_type_lower = case_type.lower()
    
    if 'divorce' in case_type_lower or 'family' in case_type_lower or 'matrimonial' in case_type_lower:
        return 'Family Law'
    elif 'property' in case_type_lower or 'estate' in case_type_lower or 'land' in case_type_lower:
        return 'Real Estate & Property Law'
    elif 'criminal' in case_type_lower or 'crime' in case_type_lower:
        return 'Criminal Law'
    elif 'tax' in case_type_lower:
        return 'Tax Law'
    elif 'corporate' in case_type_lower or 'business' in case_type_lower:
        return 'Corporate/Business Law'
    elif 'labor' in case_type_lower or 'employment' in case_type_lower:
        return 'Labor & Employment Law'
    elif 'intellectual' in case_type_lower or 'patent' in case_type_lower or 'trademark' in case_type_lower:
        return 'Intellectual Property Law'
    else:
        return 'Civil Law'


def map_specialization_to_sub_specialisation(specialization: str) -> str:
    """Map lawyer's specialization to ML model's sub_specialisation categories"""
    spec_lower = specialization.lower()
    
    if 'divorce' in spec_lower or 'matrimonial' in spec_lower:
        return 'Divorce Settlements'
    elif 'property' in spec_lower or 'land' in spec_lower or 'estate' in spec_lower:
        return 'Property Disputes'
    elif 'fraud' in spec_lower:
        return 'Fraud Cases'
    elif 'cyber' in spec_lower:
        return 'Cyber Crime'
    elif 'contract' in spec_lower:
        return 'Contract Disputes'
    elif 'merger' in spec_lower or 'acquisition' in spec_lower:
        return 'Mergers & Acquisitions'
    elif 'patent' in spec_lower or 'trademark' in spec_lower:
        return 'Patents & Trademarks'
    elif 'wrongful' in spec_lower or 'termination' in spec_lower:
        return 'Wrongful Termination'
    else:
        return 'Contract Disputes'  # Default


def map_budget_to_range(budget: float) -> str:
    """Map numeric budget to ML model's budget_range categories"""
    if budget < 5000:
        return '5000-15000'
    elif budget < 15000:
        return '5000-15000'
    elif budget < 50000:
        return '15000-50000'
    elif budget < 150000:
        return '50000-150000'
    else:
        return '150000+'


def map_urgency_to_case_urgency(urgency: str) -> str:
    """Map urgency to ML model's case_urgency categories"""
    urgency_map = {
        'Low': 'Flexible',
        'Medium': 'Standard',
        'High': 'Urgent'
    }
    return urgency_map.get(urgency, 'Standard')


def prepare_ml_features(client_req: ClientRequest, lawyer: Dict) -> np.ndarray:
    """
    Prepare complete feature vector for ML model (35 features total)
    Must match EXACT order and format the model was trained on
    
    Feature order:
    [0-8]: 9 encoded categorical features
    [9-14]: 6 primary numerical features  
    [15-34]: 20 additional features (padded with meaningful defaults)
    """
    # Get budget (default to middle range if not specified)
    budget = client_req.budget if client_req.budget else 25000
    budget_range = map_budget_to_range(budget)
    
    # Map client request to ML features
    practice_area = map_case_type_to_practice_area(client_req.case_type)
    sub_specialisation = map_specialization_to_sub_specialisation(lawyer.get('specialization', ''))
    case_urgency = map_urgency_to_case_urgency(client_req.urgency)
    
    # Build feature vector in EXACT order
    feature_vector = []
    
    # CATEGORICAL FEATURES (9 features) - these get encoded
    categorical_features = {
        'practice_area': practice_area,
        'sub_specialisation': sub_specialisation,
        'communication_mode': 'Video Call',  # Default user preference
        'comfort_preference': 'Friendly & Approachable',  # Default
        'past_client_category': 'Individual/Personal',  # Most common
        'gender': 'Male',  # Neutral default (for lawyer gender preference)
        'case_urgency': case_urgency,
        'budget_range': budget_range,
        'average_case_duration': '3-6 months'  # Default estimate
    }
    
    # Encode each categorical feature
    for feature_name in ['practice_area', 'sub_specialisation', 'communication_mode', 
                         'comfort_preference', 'past_client_category', 'gender',
                         'case_urgency', 'budget_range', 'average_case_duration']:
        try:
            encoded_value = label_encoders[feature_name].transform([categorical_features[feature_name]])[0]
            feature_vector.append(float(encoded_value))
        except Exception as e:
            logger.warning(f"Encoding error for {feature_name}={categorical_features[feature_name]}: {e}")
            feature_vector.append(0.0)
    
    # NUMERICAL FEATURES (6 core features from lawyer data)
    feature_vector.append(float(lawyer.get('years_experience', 10)))
    feature_vector.append(float(lawyer.get('rating', 4.0)))
    feature_vector.append(float(lawyer.get('reviews', 100)))
    feature_vector.append(float(lawyer.get('consultation_fee', 3000)))
    feature_vector.append(float(lawyer.get('success_rate', 80)))
    feature_vector.append(float(lawyer.get('cases_handled', 100)))
    
    # ADDITIONAL FEATURES (20 more features to reach 35 total)
    # Use meaningful defaults based on typical values
    additional_features = [
        1.0,  # has_specialization (1 = yes)
        lawyer.get('verified', True) * 1.0,  # is_verified
        lawyer.get('available_now', False) * 1.0,  # available_now
        1.0 if lawyer.get('rating', 0) >= 4.5 else 0.0,  # is_highly_rated
        1.0 if lawyer.get('years_experience', 0) >= 10 else 0.0,  # is_experienced
        len(lawyer.get('languages', [])),  # number_of_languages
        len(lawyer.get('practice_areas', [])),  # number_of_practice_areas
        float(budget / 1000),  # client_budget_thousands
        1.0 if client_req.urgency == 'High' else 0.0,  # is_urgent_case
        1.0 if client_req.location.lower() in lawyer.get('location', '').lower() else 0.0,  # location_match
        # Pad remaining with zeros
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
    ]
    
    feature_vector.extend(additional_features)
    
    # Ensure exactly 35 features
    feature_vector = feature_vector[:35]
    while len(feature_vector) < 35:
        feature_vector.append(0.0)
    
    logger.info(f"Feature vector for {lawyer['name']}: length={len(feature_vector)}, first 10={feature_vector[:10]}")
    
    return np.array(feature_vector, dtype=np.float64).reshape(1, -1)


def extract_keywords_from_prompt(client_req: ClientRequest) -> Dict[str, List[str]]:
    """
    Extract all relevant keywords from client's case description and case type
    Returns: Dict with primary and secondary keywords for matching
    """
    import re
    
    # Combine case type and description for analysis
    full_text = f"{client_req.case_type} {client_req.case_description}".lower()
    
    # Define comprehensive keyword mappings (primary keywords only - NO overlap!)
    keyword_mappings = {
        'divorce': ['divorce', 'matrimonial', 'custody', 'alimony'],
        'family': ['family law', 'domestic violence'],
        'property': ['property', 'real estate', 'land', 'tenancy', 'estate'],
        'criminal': ['criminal', 'crime', 'fraud', 'theft', 'assault', 'bail', 'fir'],
        'tax': ['tax', 'gst', 'income tax'],
        'corporate': ['corporate', 'business', 'company', 'merger', 'acquisition'],
        'contract': ['contract'],
        'civil': ['civil'],
        'labor': ['labor', 'labour', 'employment', 'workplace', 'wrongful termination'],
        'intellectual_property': ['intellectual property', 'patent', 'trademark', 'copyright'],
        'consumer': ['consumer protection', 'defective product'],
        'banking': ['banking', 'loan', 'debt', 'cheque bounce'],
        'cyber': ['cyber', 'cybercrime', 'hacking'],
        'immigration': ['immigration', 'visa', 'citizenship'],
    }
    
    # Extract matched categories (primary match)
    primary_matches = set()
    matched_keywords = set()
    
    for category, keywords in keyword_mappings.items():
        for keyword in keywords:
            if keyword in full_text:
                primary_matches.add(category)
                matched_keywords.add(keyword)
    
    # Special handling: if "property" matched, exclude "intellectual property"
    if 'intellectual_property' in primary_matches and 'property' in primary_matches:
        # Check which one is actually in the text
        if 'intellectual' in full_text or 'patent' in full_text or 'trademark' in full_text:
            primary_matches.discard('property')  # Remove general property
        else:
            primary_matches.discard('intellectual_property')  # Remove IP
    
    # Extract location from request
    location_keywords = [client_req.location.lower()]
    
    result = {
        'keywords': list(matched_keywords),  # Actual keywords found in text
        'categories': list(primary_matches),  # High-level categories
        'location': location_keywords,
        'case_type': client_req.case_type.lower(),
        'full_text': full_text
    }
    
    logger.info(f"📋 Extracted categories: {result['categories']} | Keywords: {list(matched_keywords)[:5]}...")
    return result


def matches_specialization(lawyer: Dict, extracted_keywords: Dict) -> tuple[bool, str]:
    """
    Check if lawyer's specialization matches the extracted keywords from prompt
    Returns: (matches: bool, reason: str)
    """
    import re
    
    keywords = extracted_keywords['keywords']
    categories = extracted_keywords.get('categories', [])
    
    if not keywords and not categories:
        # If no specific keywords, accept all lawyers
        return True, "General case"
    
    # Get lawyer's specialization data
    lawyer_spec = lawyer.get('specialization', '').lower()
    lawyer_category = lawyer.get('category', '').lower()
    lawyer_practice_areas = [area.lower() for area in lawyer.get('practice_areas', [])]
    
    # Combine all lawyer specialization fields for matching
    lawyer_fields = f" {lawyer_spec} {lawyer_category} {' '.join(lawyer_practice_areas)} "
    
    # Priority 1: Check for exact multi-word phrases first (highest priority)
    exact_multi_word_keywords = [k for k in keywords if ' ' in k]  # e.g., "real estate", "intellectual property"
    multi_word_matches = []
    for keyword in exact_multi_word_keywords:
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, lawyer_fields):
            multi_word_matches.append(keyword)
    
    # Priority 2: Single-word keyword matching (but EXCLUDE if multi-word was more specific)
    single_word_keywords = [k for k in keywords if ' ' not in k]  # e.g., "property", "divorce"
    single_word_matches = []
    excluded = False  # Track if lawyer should be COMPLETELY excluded
    
    for keyword in single_word_keywords:
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, lawyer_fields):
            # CRITICAL EXCLUSIONS: Avoid matching substrings of compound terms
            if keyword == "property":
                # If "intellectual property" is present, ONLY match if "real estate" or "property law" or "property disputes" is ALSO present
                if "intellectual property" in lawyer_fields:
                    # Check if there's ALSO a real property-related term
                    has_real_property = any(term in lawyer_fields for term in ['real estate', 'property law', 'property dispute', 'tenancy', 'land law'])
                    logger.info(f"🔍 Property check for {lawyer.get('name')}: has_real_property={has_real_property}, fields={lawyer_fields[:100]}")
                    if not has_real_property:
                        logger.info(f"❌ Excluding {lawyer.get('name')} - only 'intellectual property', not real property")
                        excluded = True
                        break  # Stop checking, this lawyer is excluded
            
            if keyword == "labor" or keyword == "labour":
                # Labor/Labour law is distinct, don't match other terms
                if not any(term in lawyer_fields for term in ['labor law', 'labour law', 'employment']):
                    excluded = True
                    break
            
            if keyword == "tax" and "income tax" in lawyer_fields:
                single_word_matches.append("income tax")  # More specific match
            else:
                single_word_matches.append(keyword)
    
    # If lawyer was excluded due to false match, return False immediately
    if excluded:
        return False, f"Excluded: false match on '{keywords[0]}'"
    
    # Priority 3: Check categories for broader matching
    category_matches = []
    for category in categories:
        category_clean = category.replace('_', ' ')
        if category_clean in lawyer_fields or category in lawyer_fields:
            category_matches.append(category_clean)
    
    # Combine all matches (prioritize multi-word > single-word > categories)
    all_matches = multi_word_matches + single_word_matches + category_matches
    
    if all_matches:
        return True, f"Matches: {', '.join(all_matches[:2])}"
    else:
        # No match
        search_terms = keywords[:2] if keywords else categories[:2]
        return False, f"No match for: {', '.join(search_terms)}"


def calculate_match_score(client_req: ClientRequest, lawyer: Dict, extracted_keywords: Dict) -> tuple[float, List[str]]:
    """
    Uses STRICT FILTERING + YOUR ML MODEL for scoring
    
    Steps:
    1. Strict budget filter (hard constraint)
    2. Strict specialization filter (hard constraint) - NEW!
    3. ML model prediction (100% of score)
    4. Add human-readable match reasons
    
    Returns: (score 0-100, reasons)
    """
    reasons = []
    
    # STEP 1: STRICT BUDGET FILTERING (hard constraint - must pass)
    if client_req.budget:
        lawyer_fee = lawyer.get('consultation_fee', 2000)
        if lawyer_fee > client_req.budget:
            logger.info(f"❌ Budget filter: {lawyer['name']} fee {lawyer_fee} > budget {client_req.budget}")
            return 0, [f"Over budget ({lawyer.get('consultation_fee_formatted')} > ₹{client_req.budget})"]
    
    # STEP 2: STRICT SPECIALIZATION FILTERING (hard constraint - must pass)
    specialization_match, match_reason = matches_specialization(lawyer, extracted_keywords)
    if not specialization_match:
        logger.info(f"❌ Specialization filter: {lawyer['name']} - {match_reason}")
        return 0, [f"Specialization mismatch: {match_reason}"]
    
    # STEP 3: USE YOUR ML MODEL FOR SCORING (100% of the score)
    if ml_model is None or feature_scaler is None or label_encoders is None:
        logger.error("❌ ML model not loaded! Cannot score lawyers.")
        return 0, ["ML model not available"]
    
    try:
        # Prepare feature vector (35 features)
        feature_vector = prepare_ml_features(client_req, lawyer)
        
        # Scale features using YOUR scaler
        scaled_features = feature_scaler.transform(feature_vector)
        
        # Get ML prediction probability
        ml_prediction = ml_model.predict_proba(scaled_features)[0]
        ml_confidence = ml_prediction[1]  # Probability of being a good match (0-1)
        
        # Convert to 0-100 score
        ml_score = ml_confidence * 100
        
        # Log ML usage
        logger.info(f"✅ ML: {lawyer['name']} = {ml_score:.1f}/100 ({int(ml_confidence*100)}% confidence)")
        
        # STEP 4: Generate human-readable match reasons based on data
        reasons.append(f"AI Match Score: {int(ml_score)}/100")
        reasons.append(f"{match_reason}")  # Add specialization match reason
        reasons.append(f"{lawyer['specialization']} specialist")
        
        if client_req.budget:
            reasons.append(f"Within budget ({lawyer.get('consultation_fee_formatted')})")
        
        if lawyer.get('rating', 0) >= 4.5:
            reasons.append(f"Highly rated ({lawyer.get('rating')}⭐)")
        
        if lawyer.get('years_experience', 0) >= 15:
            reasons.append(f"Experienced ({lawyer.get('years_experience')}+ years)")
        
        if client_req.location.lower() in lawyer.get('location', '').lower():
            reasons.append(f"Located in {client_req.location}")
        
        return ml_score, reasons
        
    except Exception as e:
        logger.error(f"❌ ML model error for {lawyer['name']}: {str(e)}")
        import traceback
        traceback.print_exc()
        return 0, [f"ML model error: {str(e)}"]


@app.on_event("startup")
async def startup_event():
    """Load models when server starts"""
    logger.info("🚀 Starting Turn2Law ML Matchmaking Service...")
    load_models()
    logger.info("✅ Service ready!")


@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "service": "Turn2Law ML Matchmaking API",
        "status": "active",
        "version": "1.0.0",
        "endpoints": {
            "match": "/api/match",
            "health": "/health",
            "lawyers": "/api/lawyers"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": ml_model is not None,
        "scaler_loaded": feature_scaler is not None,
        "encoders_loaded": label_encoders is not None,
        "mock_data_loaded": mock_lawyers_data is not None and len(mock_lawyers_data) > 0
    }


@app.post("/api/match", response_model=MatchResponse)
async def match_lawyer(client_request: ClientRequest):
    """
    Match client with suitable lawyers based on requirements
    Uses ML model for intelligent matching
    """
    try:
        logger.info(f"Received match request: {client_request.case_type}")
        logger.info(f"Case description: {client_request.case_description[:100]}...")
        
        if not mock_lawyers_data:
            raise HTTPException(status_code=503, detail="Lawyer data not available")
        
        # STEP 1: Extract keywords from user prompt for strict filtering
        extracted_keywords = extract_keywords_from_prompt(client_request)
        logger.info(f"📋 Extracted {len(extracted_keywords['keywords'])} keywords from prompt")
        
        # STEP 2: Filter and score lawyers using STRICT FILTERS + ML MODEL
        logger.info(f"Filtering {len(mock_lawyers_data)} lawyers with strict specialization + budget filters...")
        
        # Calculate match scores for all lawyers using STRICT FILTERS + ML MODEL
        scored_lawyers = []
        filtered_count = 0
        filter_reasons = {'budget': 0, 'specialization': 0, 'other': 0}
        
        for lawyer in mock_lawyers_data:
            score, reasons = calculate_match_score(client_request, lawyer, extracted_keywords)
            
            # STRICT FILTERING: Only include lawyers with score > 0
            if score > 0:
                lawyer_copy = lawyer.copy()
                lawyer_copy['match_score'] = round(score, 2)
                lawyer_copy['match_reasons'] = reasons
                scored_lawyers.append(lawyer_copy)
            else:
                filtered_count += 1
                # Track filter reasons for debugging
                if 'budget' in reasons[0].lower():
                    filter_reasons['budget'] += 1
                elif 'specialization' in reasons[0].lower():
                    filter_reasons['specialization'] += 1
                else:
                    filter_reasons['other'] += 1
        
        logger.info(f"✅ Passed filters: {len(scored_lawyers)} lawyers")
        logger.info(f"❌ Filtered out: {filtered_count} lawyers (budget: {filter_reasons['budget']}, specialization: {filter_reasons['specialization']}, other: {filter_reasons['other']})")
        
        # Sort by match score (descending)
        scored_lawyers.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Return top 10 matches (or all if less than 10)
        top_matches = scored_lawyers[:10]
        
        logger.info(f"Found {len(top_matches)} matches for {client_request.case_type}")
        
        return MatchResponse(
            success=True,
            matched_lawyers=top_matches,
            total_matches=len(top_matches),
            request_summary={
                "case_type": client_request.case_type,
                "location": client_request.location,
                "urgency": client_request.urgency,
                "budget": client_request.budget
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in match_lawyer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/lawyers", response_model=List[LawyerProfile])
async def get_all_lawyers(
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=100, description="Number of lawyers to return")
):
    """
    Get all lawyers or filter by category
    """
    try:
        if not mock_lawyers_data:
            raise HTTPException(status_code=503, detail="Lawyer data not available")
        
        lawyers = mock_lawyers_data
        
        # Filter by category if provided
        if category:
            lawyers = [
                lawyer for lawyer in lawyers
                if category.lower() in lawyer['category'].lower()
            ]
        
        # Return limited results
        return lawyers[:limit]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_all_lawyers: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/lawyers/{lawyer_id}", response_model=LawyerProfile)
async def get_lawyer_by_id(lawyer_id: int):
    """
    Get specific lawyer by ID
    """
    try:
        if not mock_lawyers_data:
            raise HTTPException(status_code=503, detail="Lawyer data not available")
        
        lawyer = next((l for l in mock_lawyers_data if l['id'] == lawyer_id), None)
        
        if not lawyer:
            raise HTTPException(status_code=404, detail=f"Lawyer with ID {lawyer_id} not found")
        
        return lawyer
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_lawyer_by_id: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/api/submit-query")
async def submit_query(submission: QuerySubmission):
    """
    Submit a client query for lawyer matching.
    This endpoint receives user queries from the consult page.
    Stores queries in Supabase and logs for admin review.
    """
    try:
        query_id = f"Q{int(pd.Timestamp.now().timestamp())}"
        
        # Log full query details to console
        logger.info("="*80)
        logger.info(f"📥 NEW CLIENT QUERY RECEIVED")
        logger.info(f"Query ID: {query_id}")
        logger.info(f"Timestamp: {submission.timestamp}")
        logger.info(f"Full Query Text:")
        logger.info(f"{submission.query}")
        logger.info("="*80)
        
        # Save to Supabase
        try:
            response = supabase.table("client_queries").insert({
                "query_id": query_id,
                "query_text": submission.query,
                "submitted_at": submission.timestamp,
                "status": "pending"
            }).execute()
            logger.info(f"✅ Query saved to Supabase database")
        except Exception as db_error:
            logger.error(f"⚠️  Supabase error (query still logged): {str(db_error)}")
        
        # Also save query to file for backup
        queries_file = BASE_DIR / "backend" / "ml-service" / "client_queries.log"
        with open(queries_file, "a", encoding="utf-8") as f:
            f.write(f"\n{'='*80}\n")
            f.write(f"Query ID: {query_id}\n")
            f.write(f"Timestamp: {submission.timestamp}\n")
            f.write(f"Query:\n{submission.query}\n")
            f.write(f"{'='*80}\n")
        
        logger.info(f"✅ Query backed up to {queries_file}")
        
        return {
            "success": True,
            "message": "Query received successfully. We'll contact you with a suitable lawyer soon.",
            "query_id": query_id,
            "timestamp": submission.timestamp
        }
        
    except Exception as e:
        logger.error(f"❌ Error submitting query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to submit query: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
