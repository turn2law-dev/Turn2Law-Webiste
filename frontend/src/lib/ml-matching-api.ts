/**
 * Turn2Law ML Matchmaking API Client
 * Frontend service for communicating with the ML-powered lawyer matching backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ClientMatchRequest {
  case_type: string;
  case_description: string;
  location?: string;
  budget?: number;
  urgency?: 'Low' | 'Medium' | 'High';
  preferred_experience?: number;
  language_preference?: string;
}

export interface LawyerProfile {
  id: number;
  name: string;
  specialization: string;
  category: string;
  rating: number;
  reviews: number;
  experience: string;
  years_experience: number;
  location: string;
  city: string;
  court: string;
  phone: string;
  email: string;
  consultation_fee: number;
  consultation_fee_formatted: string;
  about: string;
  education: string;
  additional_degree: string;
  bar_council: string;
  bar_number: string;
  languages: string[];
  practice_areas: string[];
  achievements: string[];
  success_rate: number;
  cases_handled: number;
  availability: string;
  response_time: string;
  image: string;
  verified: boolean;
  available_now: boolean;
  match_score?: number;
  match_reasons?: string[];
}

export interface MatchResponse {
  success: boolean;
  matched_lawyers: LawyerProfile[];
  total_matches: number;
  request_summary: {
    case_type: string;
    location: string;
    urgency: string;
    budget?: number;
  };
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  scaler_loaded: boolean;
  encoders_loaded: boolean;
  mock_data_loaded: boolean;
}

class MLMatchingAPIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Check if the API service is healthy
   */
  async healthCheck(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  /**
   * Match lawyers based on client requirements
   */
  async matchLawyers(request: ClientMatchRequest): Promise<MatchResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Match lawyers error:', error);
      throw error;
    }
  }

  /**
   * Get all lawyers or filter by category
   */
  async getAllLawyers(category?: string, limit: number = 50): Promise<LawyerProfile[]> {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseURL}/api/lawyers?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch lawyers: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get all lawyers error:', error);
      throw error;
    }
  }

  /**
   * Get a specific lawyer by ID
   */
  async getLawyerById(lawyerId: number): Promise<LawyerProfile> {
    try {
      const response = await fetch(`${this.baseURL}/api/lawyers/${lawyerId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch lawyer: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get lawyer by ID error:', error);
      throw error;
    }
  }

  /**
   * Convert legacy lawyer format to new format
   * For backward compatibility with existing frontend code
   */
  convertToLegacyFormat(lawyer: LawyerProfile): any {
    return {
      id: lawyer.id,
      name: lawyer.name,
      specialization: lawyer.specialization,
      category: lawyer.category,
      rating: lawyer.rating,
      reviews: lawyer.reviews,
      experience: lawyer.experience,
      location: lawyer.location,
      phone: lawyer.phone,
      email: lawyer.email,
      consultationFee: lawyer.consultation_fee_formatted,
      about: lawyer.about,
      image: lawyer.image,
    };
  }
}

// Export singleton instance
export const mlMatchingAPI = new MLMatchingAPIClient();

// Export class for custom instances
export default MLMatchingAPIClient;
