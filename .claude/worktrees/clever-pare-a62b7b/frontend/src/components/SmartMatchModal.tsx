"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Search, X, AlertCircle } from 'lucide-react';
import { mlMatchingAPI, ClientMatchRequest, LawyerProfile } from '@/lib/ml-matching-api';

interface SmartMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchComplete: (lawyers: LawyerProfile[]) => void;
}

export default function SmartMatchModal({ isOpen, onClose, onMatchComplete }: SmartMatchModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    caseType: 'Property and Estate',
    caseDescription: '',
    location: 'Chennai',
    budget: '',
    urgency: 'Medium' as 'Low' | 'Medium' | 'High',
    preferredExperience: '',
    languagePreference: 'English'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const request: ClientMatchRequest = {
        case_type: formData.caseType,
        case_description: formData.caseDescription,
        location: formData.location,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        urgency: formData.urgency,
        preferred_experience: formData.preferredExperience ? parseInt(formData.preferredExperience) : undefined,
        language_preference: formData.languagePreference
      };

      const response = await mlMatchingAPI.matchLawyers(request);
      
      if (response.success && response.matched_lawyers.length > 0) {
        onMatchComplete(response.matched_lawyers);
        onClose();
      } else {
        setError('No matching lawyers found. Please try adjusting your criteria.');
      }
    } catch (err) {
      console.error('Match error:', err);
      setError('Unable to connect to matching service. Please try again or browse lawyers manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">AI-Powered Lawyer Match</h2>
              <p className="text-muted-foreground text-sm">Get personalized lawyer recommendations based on your needs</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-destructive text-sm font-medium">Error</p>
                <p className="text-destructive/80 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Case Type */}
          <div>
            <Label htmlFor="caseType" className="text-foreground mb-2 block">
              Legal Category *
            </Label>
            <Select value={formData.caseType} onValueChange={(value) => handleInputChange('caseType', value)}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Property and Estate">Property and Estate</SelectItem>
                <SelectItem value="Divorce">Divorce & Family Law</SelectItem>
                <SelectItem value="Tax & Corporate">Tax & Corporate</SelectItem>
                <SelectItem value="Criminal">Criminal</SelectItem>
                <SelectItem value="Civil Law">Civil Law</SelectItem>
                <SelectItem value="Consumer Protection">Consumer Protection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Case Description */}
          <div>
            <Label htmlFor="caseDescription" className="text-foreground mb-2 block">
              Describe Your Legal Issue *
            </Label>
            <Textarea
              id="caseDescription"
              value={formData.caseDescription}
              onChange={(e) => handleInputChange('caseDescription', e.target.value)}
              placeholder="Please provide details about your legal situation..."
              className="min-h-[100px] bg-background border-border text-foreground placeholder-muted-foreground resize-none"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Be specific to get the best matches</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-foreground mb-2 block">
                Preferred Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Chennai, Mumbai"
                className="bg-background border-border text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Budget */}
            <div>
              <Label htmlFor="budget" className="text-foreground mb-2 block">
                Budget (₹)
              </Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="e.g., 3000"
                className="bg-background border-border text-foreground placeholder-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Urgency */}
            <div>
              <Label htmlFor="urgency" className="text-foreground mb-2 block">
                Urgency Level
              </Label>
              <Select value={formData.urgency} onValueChange={(value: any) => handleInputChange('urgency', value)}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low - Within a month</SelectItem>
                  <SelectItem value="Medium">Medium - Within a week</SelectItem>
                  <SelectItem value="High">High - ASAP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Experience */}
            <div>
              <Label htmlFor="experience" className="text-foreground mb-2 block">
                Min. Experience (years)
              </Label>
              <Input
                id="experience"
                type="number"
                value={formData.preferredExperience}
                onChange={(e) => handleInputChange('preferredExperience', e.target.value)}
                placeholder="e.g., 10"
                className="bg-background border-border text-foreground placeholder-muted-foreground"
              />
            </div>
          </div>

          {/* Language Preference */}
          <div>
            <Label htmlFor="language" className="text-foreground mb-2 block">
              Language Preference
            </Label>
            <Select value={formData.languagePreference} onValueChange={(value) => handleInputChange('languagePreference', value)}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="Tamil">Tamil</SelectItem>
                <SelectItem value="Telugu">Telugu</SelectItem>
                <SelectItem value="Bengali">Bengali</SelectItem>
                <SelectItem value="Marathi">Marathi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !formData.caseDescription}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-primary-foreground font-semibold disabled:opacity-50 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Finding Best Matches...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find Matching Lawyers
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground hover:bg-muted hover:text-primary hover:border-primary"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Our AI analyzes your requirements to match you with the most suitable lawyers
          </p>
        </form>
      </div>
    </div>
  );
}
