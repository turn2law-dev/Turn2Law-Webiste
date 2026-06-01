#!/usr/bin/env python3
"""
Final Comprehensive Test Suite for Keyword-Based Filtering
Tests that ONLY relevant lawyers are returned for each specialization
"""
import requests
import json
from typing import List, Dict

API_URL = "http://localhost:8000/api/match"

# ANSI color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

def print_header(text: str):
    print(f"\n{BOLD}{BLUE}{'='*80}{RESET}")
    print(f"{BOLD}{BLUE}{text}{RESET}")
    print(f"{BOLD}{BLUE}{'='*80}{RESET}\n")

def print_success(text: str):
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text: str):
    print(f"{RED}❌ {text}{RESET}")

def print_warning(text: str):
    print(f"{YELLOW}⚠️  {text}{RESET}")

def print_info(text: str):
    print(f"{BLUE}ℹ️  {text}{RESET}")

def test_case(name: str, request_data: Dict, expected_keywords: List[str], excluded_keywords: List[str] = None):
    """
    Test a specific case and verify results
    
    Args:
        name: Test case name
        request_data: Request payload
        expected_keywords: Keywords that SHOULD appear in results (e.g., ['divorce', 'family', 'matrimonial'])
        excluded_keywords: Keywords that should NOT appear (e.g., ['intellectual property', 'tax'])
    """
    if excluded_keywords is None:
        excluded_keywords = []
    
    print_header(f"TEST: {name}")
    print_info(f"Case Type: {request_data['case_type']}")
    print_info(f"Description: {request_data['case_description']}")
    print_info(f"Budget: ₹{request_data.get('budget', 'No limit')}")
    print_info(f"Expected keywords in results: {', '.join(expected_keywords)}")
    if excluded_keywords:
        print_info(f"Should NOT see: {', '.join(excluded_keywords)}")
    print()
    
    try:
        response = requests.post(API_URL, json=request_data, timeout=10)
        
        if response.status_code != 200:
            print_error(f"API returned status {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
        
        result = response.json()
        lawyers = result.get('matched_lawyers', [])
        total = result.get('total_matches', 0)
        
        print_success(f"Found {total} matching lawyers\n")
        
        if not lawyers:
            print_warning("No lawyers found matching criteria")
            return False
        
        # Show top 10 results
        print(f"{BOLD}Top {min(10, len(lawyers))} Results:{RESET}")
        all_pass = True
        
        for i, lawyer in enumerate(lawyers[:10], 1):
            spec = lawyer['specialization'].lower()
            category = lawyer['category'].lower()
            practice_areas = ' '.join(lawyer.get('practice_areas', [])).lower()
            combined = f"{spec} {category} {practice_areas}"
            
            # Check if ANY expected keyword is in lawyer's fields
            has_expected = any(kw.lower() in combined for kw in expected_keywords)
            
            # Check if ANY excluded keyword is in lawyer's fields
            has_excluded = any(kw.lower() in combined for kw in excluded_keywords)
            
            # Determine status
            if has_expected and not has_excluded:
                status = f"{GREEN}✅{RESET}"
            elif has_excluded:
                status = f"{RED}❌ EXCLUDED KEYWORD!{RESET}"
                all_pass = False
            else:
                status = f"{YELLOW}⚠️  NO MATCH{RESET}"
                all_pass = False
            
            print(f"{i:2}. {status} {lawyer['name']:<25} | {lawyer['specialization']:<30} | Score: {lawyer['match_score']:.2f}%")
        
        # Summary
        print(f"\n{BOLD}Verification:{RESET}")
        if all_pass:
            print_success(f"ALL lawyers match expected specialization!")
            print_success(f"NO excluded keywords found!")
            return True
        else:
            print_error("Some lawyers don't match expected criteria")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend server at http://localhost:8000")
        print_info("Make sure the server is running: python3 main.py")
        return False
    except Exception as e:
        print_error(f"Test failed: {str(e)}")
        return False

def main():
    print_header("🧪 KEYWORD-BASED FILTERING - COMPREHENSIVE TEST SUITE")
    print_info("This test verifies that ONLY relevant lawyers are returned for each specialization")
    print_info("Backend should filter out mismatches BEFORE ML scoring\n")
    
    test_results = []
    
    # Test 1: Divorce Case
    test_results.append(test_case(
        name="Divorce & Family Law Case",
        request_data={
            "case_type": "Divorce and Family Law",
            "case_description": "Need help with divorce proceedings, child custody disputes, and alimony settlement",
            "location": "Chennai",
            "budget": 10000,
            "urgency": "High"
        },
        expected_keywords=["divorce", "family", "matrimonial", "custody", "domestic violence"],
        excluded_keywords=["property", "tax", "corporate", "criminal", "intellectual property"]
    ))
    
    input("\nPress Enter to continue to next test...")
    
    # Test 2: Property Case
    test_results.append(test_case(
        name="Property & Real Estate Case",
        request_data={
            "case_type": "Property Dispute",
            "case_description": "Land ownership dispute with neighbor, need property lawyer for title verification",
            "location": "Mumbai",
            "budget": 15000,
            "urgency": "Medium"
        },
        expected_keywords=["property", "real estate", "land", "tenancy", "estate planning"],
        excluded_keywords=["intellectual property", "divorce", "criminal", "patent", "trademark"]
    ))
    
    input("\nPress Enter to continue to next test...")
    
    # Test 3: Criminal Case
    test_results.append(test_case(
        name="Criminal Defense Case",
        request_data={
            "case_type": "Criminal Defense",
            "case_description": "Facing fraud charges, need criminal lawyer for bail and defense strategy",
            "location": "Delhi",
            "budget": 20000,
            "urgency": "High"
        },
        expected_keywords=["criminal", "crime", "fraud", "bail", "cyber crime", "white collar"],
        excluded_keywords=["divorce", "property", "corporate", "tax"]
    ))
    
    input("\nPress Enter to continue to next test...")
    
    # Test 4: Corporate Case
    test_results.append(test_case(
        name="Corporate & Business Law Case",
        request_data={
            "case_type": "Corporate Law",
            "case_description": "Need help with company incorporation and contract drafting for startup",
            "location": "Bangalore",
            "budget": 12000,
            "urgency": "Low"
        },
        expected_keywords=["corporate", "business", "company", "contract", "startup"],
        excluded_keywords=["divorce", "criminal", "property dispute"]
    ))
    
    input("\nPress Enter to continue to next test...")
    
    # Test 5: Budget Filter Test
    test_results.append(test_case(
        name="Low Budget Filter Test",
        request_data={
            "case_type": "Property Law",
            "case_description": "Property consultation needed",
            "location": "Chennai",
            "budget": 2000,  # Very low budget
            "urgency": "Low"
        },
        expected_keywords=["property", "real estate"],
        excluded_keywords=["intellectual property"]
    ))
    
    # Final Summary
    print_header("📊 TEST SUMMARY")
    passed = sum(test_results)
    total = len(test_results)
    
    print(f"{BOLD}Results: {passed}/{total} tests passed{RESET}\n")
    
    test_names = [
        "Divorce & Family Law",
        "Property & Real Estate",
        "Criminal Defense",
        "Corporate & Business",
        "Budget Filter"
    ]
    
    for i, (name, result) in enumerate(zip(test_names, test_results), 1):
        if result:
            print_success(f"{i}. {name}")
        else:
            print_error(f"{i}. {name}")
    
    print()
    if passed == total:
        print_success(f"{BOLD}🎉 ALL TESTS PASSED! Keyword filtering is working perfectly!{RESET}")
    else:
        print_warning(f"{BOLD}Some tests failed. Review the results above.{RESET}")
    
    print_header("END OF TESTS")

if __name__ == "__main__":
    main()
