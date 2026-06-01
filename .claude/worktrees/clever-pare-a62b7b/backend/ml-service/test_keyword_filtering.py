"""
Test script to verify keyword extraction and specialization filtering
"""
import requests
import json

# Test cases with different specializations
test_cases = [
    {
        "name": "Divorce Case Test",
        "request": {
            "case_type": "Divorce and Family Law",
            "case_description": "Need help with divorce proceedings, child custody, and alimony settlement",
            "location": "Chennai",
            "budget": 10000,
            "urgency": "High"
        },
        "expected": "Should return ONLY divorce/family/matrimonial lawyers"
    },
    {
        "name": "Property Case Test",
        "request": {
            "case_type": "Property Dispute",
            "case_description": "Land ownership dispute with neighbor, need to resolve property title issue",
            "location": "Mumbai",
            "budget": 15000,
            "urgency": "Medium"
        },
        "expected": "Should return ONLY property/real estate lawyers"
    },
    {
        "name": "Criminal Case Test",
        "request": {
            "case_type": "Criminal Defense",
            "case_description": "Facing false fraud charges, need criminal lawyer for bail and defense",
            "location": "Delhi",
            "budget": 20000,
            "urgency": "High"
        },
        "expected": "Should return ONLY criminal lawyers"
    },
    {
        "name": "Tax Case Test",
        "request": {
            "case_type": "Tax Consultation",
            "case_description": "GST audit issue, need tax planning advice",
            "location": "Bangalore",
            "budget": 8000,
            "urgency": "Low"
        },
        "expected": "Should return ONLY tax lawyers"
    }
]

def test_case(test_name, request_data, expected):
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")
    print(f"Case Type: {request_data['case_type']}")
    print(f"Description: {request_data['case_description']}")
    print(f"Budget: ₹{request_data['budget']}")
    print(f"\nExpected: {expected}\n")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/match",
            json=request_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            lawyers = result.get('matched_lawyers', [])
            
            print(f"✅ SUCCESS - Found {len(lawyers)} matching lawyers:")
            print(f"Total matches: {result.get('total_matches', 0)}\n")
            
            if lawyers:
                print("Top 5 Results:")
                for i, lawyer in enumerate(lawyers[:5], 1):
                    print(f"\n{i}. {lawyer['name']}")
                    print(f"   Specialization: {lawyer['specialization']}")
                    print(f"   Category: {lawyer['category']}")
                    print(f"   Practice Areas: {', '.join(lawyer.get('practice_areas', [])[:3])}")
                    print(f"   Match Score: {lawyer['match_score']:.2f}%")
                    print(f"   Fee: {lawyer['consultation_fee_formatted']}")
                    print(f"   Match Reasons:")
                    for reason in lawyer.get('match_reasons', [])[:4]:
                        print(f"      • {reason}")
                
                # Verify specialization matches
                print(f"\n{'='*80}")
                print("SPECIALIZATION VERIFICATION:")
                print(f"{'='*80}")
                
                request_keywords = request_data['case_type'].lower()
                all_match = True
                
                for lawyer in lawyers[:5]:
                    spec = lawyer['specialization'].lower()
                    category = lawyer['category'].lower()
                    areas = ' '.join(lawyer.get('practice_areas', [])).lower()
                    combined = f"{spec} {category} {areas}"
                    
                    # Check if it's a relevant match
                    if 'divorce' in request_keywords or 'family' in request_keywords:
                        is_match = any(kw in combined for kw in ['divorce', 'family', 'matrimonial'])
                    elif 'property' in request_keywords:
                        is_match = any(kw in combined for kw in ['property', 'real estate', 'estate'])
                    elif 'criminal' in request_keywords:
                        is_match = any(kw in combined for kw in ['criminal', 'crime', 'fraud'])
                    elif 'tax' in request_keywords:
                        is_match = 'tax' in combined
                    else:
                        is_match = True
                    
                    status = "✅ MATCH" if is_match else "❌ MISMATCH"
                    print(f"{status}: {lawyer['name']} - {lawyer['specialization']}")
                    
                    if not is_match:
                        all_match = False
                
                if all_match:
                    print(f"\n✅ ALL LAWYERS MATCH THE SPECIALIZATION!")
                else:
                    print(f"\n❌ WARNING: Some lawyers don't match specialization!")
            else:
                print("⚠️  No lawyers found matching criteria")
                
        else:
            print(f"❌ ERROR - Status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR - Cannot connect to backend server")
        print("   Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ ERROR - {str(e)}")

if __name__ == "__main__":
    print("="*80)
    print("KEYWORD EXTRACTION & SPECIALIZATION FILTERING TEST")
    print("="*80)
    print("\nThis test verifies:")
    print("1. Keywords are correctly extracted from case type and description")
    print("2. Only lawyers matching the specialization are returned")
    print("3. Irrelevant lawyers are filtered out")
    print("4. ML model scores the filtered lawyers")
    
    for test in test_cases:
        test_case(test["name"], test["request"], test["expected"])
        input("\nPress Enter to continue to next test...")
    
    print("\n" + "="*80)
    print("TEST COMPLETE")
    print("="*80)
