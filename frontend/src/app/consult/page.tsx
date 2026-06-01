"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send, CheckCircle2, Loader2 } from "lucide-react";
import Header from "@/components/layout/header";
import { FlipWords } from "@/components/ui/flip-words";
import { useNotification } from "@/contexts/notification-context";

const TypingEffect = () => (
  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-tight text-center px-2">
    Find the best{" "}
    <span className="text-primary">
      <FlipWords
        className="*:text-primary"
        words={["lawyers", "attorneys", "advocates"]}
      />
    </span>
  </h1>
);

const ConsultPage = () => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [userQuery, setUserQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!userQuery.trim()) return;

    setIsSubmitting(true);

    try {
      // Check if user is logged in using Supabase Auth
      const { getSession, getUserProfile } = await import('@/lib/supabase-auth');
      const session = await getSession();
      
      if (!session || !session.user) {
        // User is not logged in - prompt them to login/signup
        showNotification(
          "Please login or sign up to submit your query. You will be redirected to the login page.",
          'info'
        );
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        setIsSubmitting(false);
        return;
      }
      
      // Get user profile for submission
      const profile = await getUserProfile(session.user.id);
      const userId = profile.id;
      
      // Use backend URL from environment
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const apiUrl = `${backendUrl}/api/submit-query`;
      
      console.log('🔍 Backend URL:', backendUrl);
      console.log('🔍 API URL:', apiUrl);
      console.log('🔍 User ID:', userId);
      console.log('🔍 Profile:', profile);
      
      const requestBody = {
        query: userQuery,
        timestamp: new Date().toISOString(),
        userId: userId
      };
      
      console.log('📤 Sending request:', requestBody);
      
      // Get session token for authorization
      const token = session.access_token;
      
      // Send query to backend API
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include Supabase auth token
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // Try to parse error message
        let errorMessage = 'Failed to submit query';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Use default message if JSON parse fails
        }
        
        showNotification(`Error: ${errorMessage}`, 'error');
        throw new Error(`Failed to submit query: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      console.log("✅ Query submitted successfully:", data);

      // Show success message with animation
      setShowSuccess(true);

      // Wait 5 seconds then redirect to landing page
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (error) {
      console.error("❌ Error submitting query:", error);
      setIsSubmitting(false);
      showNotification("Failed to submit query. Please try again.", 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs - Yellow/Green Theme */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#E8B931]/20 rounded-full filter blur-[120px] opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#10B981]/15 rounded-full filter blur-[100px] opacity-25"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#E8B931]/10 rounded-full filter blur-[80px] opacity-20"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <Header />

      {/* Main Content */}
      <div className="relative z-10 pt-20 sm:pt-24 pb-8 px-4 sm:px-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 space-y-3 sm:space-y-4">
            {/* Title with FlipWords */}
            <TypingEffect />

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Describe your case and we'll connect you with the right lawyer
            </p>
          </div>

          {/* Query Input - Mobile-Optimized */}
          <div className="relative">
            {!showSuccess ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Mobile-Friendly Textarea */}
                <div className="relative">
                  <textarea
                    id="query"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your legal case here..."
                    disabled={isSubmitting}
                    className="w-full min-h-[250px] sm:h-64 md:h-80 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-base sm:text-lg text-foreground placeholder-muted-foreground bg-muted/50 backdrop-blur-sm border border-border hover:border-primary/40 rounded-xl sm:rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Mobile-Optimized Submit Button */}
                <div className="flex justify-center pt-2 sm:pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!userQuery.trim() || isSubmitting}
                    className="group w-full sm:w-auto bg-gradient-to-r from-[#E8B931] to-[#F4D03F] hover:from-[#F4D03F] hover:to-[#E8B931] text-foreground font-medium text-base sm:text-sm py-3.5 sm:py-3 px-8 rounded-full shadow-md shadow-[#E8B931]/20 hover:shadow-lg hover:shadow-[#E8B931]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Case</span>
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 sm:space-y-8 py-8 sm:py-12 px-4">
                {/* Simple Checkmark Animation */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-[#10B981]/10 border-2 border-[#10B981] animate-scale-in">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#10B981] animate-check" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-3 sm:space-y-4 max-w-xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Request Received!
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    Thank you for your query. We've received your case details and will contact you back soon with the right lawyer for your needs.
                  </p>
                </div>

                {/* Redirect Info */}
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Redirecting to homepage in a moment...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simple Animations */}
      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes check {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-check {
          animation: check 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
        }
      `}</style>
    </div>
  );
};

export default ConsultPage;
