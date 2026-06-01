#!/usr/bin/env python3
"""
Test script to verify strict budget filtering is working correctly
"""

import requests
import json

API_URL = "http://localhost:8000/api/match"

def test_query(description, payload):
    """Test a single query and display results"""
    print(f"\n{'='*80}")
    print(f"TEST: {description}")
    print(f"{'='*80}")
    print(f"Request: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(API_URL, json=payload)
        data = response.json()
        
        if data['success']:
            print(f"\n✅ Success: Found {data['total_matches']} matches")
            
            if data['total_matches'] > 0:
                print(f"\nTop matches:")
                for lawyer in data['matched_lawyers'][:5]:
                    fee = lawyer['consultation_fee']
                    budget = payload.get('budget', 'No limit')
                    within_budget = "✅" if (budget == 'No limit' or fee <= budget) else "❌"
                    print(f"  {within_budget} {lawyer['name']}: {lawyer['specialization']}")
                    print(f"     Fee: {lawyer['consultation_fee_formatted']} | Score: {lawyer['match_score']}")
                    print(f"     Reasons: {', '.join(lawyer['match_reasons'][:2])}")
                
                # Verify strict filtering
                if 'budget' in payload:
                    over_budget = [l for l in data['matched_lawyers'] if l['consultation_fee'] > payload['budget']]
                    if over_budget:
                        print(f"\n❌ ERROR: Found {len(over_budget)} lawyers OVER budget!")
                        for l in over_budget:
                            print(f"   - {l['name']}: {l['consultation_fee_formatted']}")
                    else:
                        print(f"\n✅ VERIFIED: All lawyers are within budget (≤ ₹{payload['budget']})")
            else:
                print("No lawyers found matching criteria")
        else:
            print(f"❌ Failed: {data}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

# Test 1: Divorce lawyer with no budget constraint
test_query(
    "Divorce lawyer in Chennai - No budget limit",
    {
        "case_type": "Divorce",
        "case_description": "Need a divorce lawyer in Chennai",
        "location": "Chennai",
        "urgency": "Medium"
    }
)

# Test 2: Divorce lawyer under ₹2000 (very strict - should find very few or none)
test_query(
    "Divorce lawyer under ₹2000 (STRICT)",
    {
        "case_type": "Divorce",
        "case_description": "Need a divorce lawyer under ₹2000",
        "location": "Chennai",
        "budget": 2000,
        "urgency": "Medium"
    }
)

# Test 3: Divorce lawyer under ₹3000
test_query(
    "Divorce lawyer under ₹3000",
    {
        "case_type": "Divorce",
        "case_description": "Need a divorce lawyer under ₹3000",
        "location": "Chennai",
        "budget": 3000,
        "urgency": "Medium"
    }
)

# Test 4: Property lawyer under ₹4000
test_query(
    "Property lawyer under ₹4000",
    {
        "case_type": "Property and Estate",
        "case_description": "Need a property lawyer for land dispute under ₹4000",
        "location": "Chennai",
        "budget": 4000,
        "urgency": "High"
    }
)

# Test 5: Criminal lawyer under ₹5000
test_query(
    "Criminal lawyer under ₹5000",
    {
        "case_type": "Criminal",
        "case_description": "Need criminal defense lawyer under ₹5000",
        "location": "Chennai",
        "budget": 5000,
        "urgency": "High"
    }
)

print(f"\n{'='*80}")
print("ALL TESTS COMPLETED")
print(f"{'='*80}\n")
