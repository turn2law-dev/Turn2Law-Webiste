# Turn2Law ML Matchmaking Service

Production-ready FastAPI backend service for intelligent lawyer-client matching using machine learning.

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation & Running

1. **Navigate to the service directory:**
```bash
cd backend/ml-service
```

2. **Run the startup script:**
```bash
./start.sh
```

Or manually:

```bash
# Install dependencies
pip3 install -r requirements.txt

# Start the service
python3 main.py
```

The API will be available at:
- **API Endpoint:** http://localhost:8000
- **Interactive Docs:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc

## 📋 API Endpoints

### Health Check
```bash
GET /health
```
Check if the service is running and models are loaded.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "scaler_loaded": true,
  "encoders_loaded": true,
  "mock_data_loaded": true
}
```

### Match Lawyers
```bash
POST /api/match
```
Find the best matching lawyers for a client's requirements.

**Request Body:**
```json
{
  "case_type": "Property and Estate",
  "case_description": "Need help with property dispute",
  "location": "Chennai",
  "budget": 3000,
  "urgency": "High",
  "preferred_experience": 10,
  "language_preference": "English"
}
```

**Response:**
```json
{
  "success": true,
  "matched_lawyers": [
    {
      "id": 1,
      "name": "Rajendra Kumar",
      "specialization": "Property Law",
      "rating": 4.8,
      "experience": "15+ years",
      "match_score": 95.5,
      "match_reasons": [
        "Specializes in Property Law",
        "Available in Chennai",
        "Within budget (₹2,500)",
        "15+ years of experience",
        "Highly rated (4.8⭐)"
      ],
      ...
    }
  ],
  "total_matches": 10,
  "request_summary": {
    "case_type": "Property and Estate",
    "location": "Chennai",
    "urgency": "High",
    "budget": 3000
  }
}
```

### Get All Lawyers
```bash
GET /api/lawyers?category=Property%20and%20Estate&limit=20
```
Retrieve all lawyers or filter by category.

**Query Parameters:**
- `category` (optional): Filter by legal category
- `limit` (optional): Number of results (default: 50, max: 100)

### Get Lawyer by ID
```bash
GET /api/lawyers/{lawyer_id}
```
Get detailed information about a specific lawyer.

## 🧪 Testing the API

### Using curl

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Match Request:**
```bash
curl -X POST http://localhost:8000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "case_type": "Divorce",
    "case_description": "Need consultation for divorce proceedings",
    "location": "Mumbai",
    "budget": 2500,
    "urgency": "Medium"
  }'
```

**Get Lawyers:**
```bash
curl http://localhost:8000/api/lawyers?category=Criminal&limit=10
```

### Using the Interactive Docs

1. Open http://localhost:8000/docs in your browser
2. Click on any endpoint to expand it
3. Click "Try it out"
4. Fill in the parameters
5. Click "Execute"

## 🗂️ Project Structure

```
backend/ml-service/
├── main.py                    # FastAPI application
├── requirements.txt           # Python dependencies
├── mock_data_generator.py     # Mock data generator
├── mock_lawyers.json          # Generated mock lawyer data
├── start.sh                   # Startup script
└── README.md                  # This file
```

## 📦 Dependencies

- **FastAPI** - Modern web framework for building APIs
- **Uvicorn** - ASGI server for running FastAPI
- **Pydantic** - Data validation using Python type annotations
- **Scikit-learn** - Machine learning library
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing
- **Faker** - Generate realistic mock data

## 🔧 Configuration

### CORS Settings
The API is configured to accept requests from:
- http://localhost:3000 (Next.js default)
- http://localhost:3001

To add more origins, edit `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "YOUR_FRONTEND_URL"],
    ...
)
```

### Model Files
The service expects these pickle files in the project root:
- `best_matchmaking_model.pkl` - Trained ML model
- `feature_scaler.pkl` - Feature scaler
- `label_encoders (1).pkl` - Label encoders

## 🧩 Matching Algorithm

The matching system uses a weighted scoring algorithm:

1. **Specialization Match (40%)** - Does the lawyer specialize in the required area?
2. **Location Match (15%)** - Is the lawyer in the preferred location?
3. **Budget Match (20%)** - Does the fee fit within the client's budget?
4. **Experience Match (15%)** - Does the lawyer meet experience requirements?
5. **Rating Bonus (10%)** - Higher ratings get bonus points

## 🔄 Mock vs Real Data

### Current Setup: Mock Data
The service currently uses generated mock data (`mock_lawyers.json`) for testing.

### Switching to Real Data
To use real lawyer data:

1. **Option A: Database Integration**
   - Add database connection (PostgreSQL, MySQL, MongoDB)
   - Create database models
   - Update the data loading logic in `main.py`

2. **Option B: External API**
   - Connect to your lawyer database API
   - Update endpoints to fetch real-time data

3. **Option C: Replace Mock File**
   - Export real lawyer data in the same JSON format
   - Replace `mock_lawyers.json`

## 🚀 Production Deployment

### Docker Deployment (Recommended)

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t turn2law-ml-service .
docker run -p 8000:8000 turn2law-ml-service
```

### Cloud Deployment

**AWS Elastic Beanstalk:**
```bash
eb init -p python-3.11 turn2law-ml-service
eb create turn2law-ml-env
eb deploy
```

**Google Cloud Run:**
```bash
gcloud run deploy turn2law-ml-service --source .
```

**Azure App Service:**
```bash
az webapp up --name turn2law-ml-service --runtime "PYTHON:3.11"
```

## 📊 Monitoring & Logging

The service includes built-in logging:
```python
# View logs
tail -f logs/service.log  # If file logging is configured
```

## 🔒 Security Considerations

For production:
1. Add API key authentication
2. Implement rate limiting
3. Use HTTPS only
4. Add input sanitization
5. Set up monitoring and alerts

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Module not found:**
```bash
# Reinstall dependencies
pip3 install -r requirements.txt --force-reinstall
```

**CORS errors:**
- Add your frontend URL to `allow_origins` in `main.py`
- Restart the server after changes

## 📝 License

Copyright © 2024 Turn2Law. All rights reserved.

## 🤝 Support

For issues or questions:
- Check the logs for error messages
- Review API docs at http://localhost:8000/docs
- Contact the development team
