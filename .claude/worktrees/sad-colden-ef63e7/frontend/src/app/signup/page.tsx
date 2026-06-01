"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ValidatedInput } from '@/components/ui/validated-input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { validateFile } from '@/utils/validation';
import { useNotification } from '@/contexts/notification-context';

const Logo = () => (
  <>
    {/* Black logo for Light Mode */}
    <svg
      width="32"
      height="40"
      viewBox="0 0 23 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="dark:hidden transition-all duration-300"
    >
      <path
        d="M17.2048 0L11.4096 6.19541L13.4028 8.16545L15.8223 5.57886V20.2762L2.51237 6.72721C1.58129 5.77941 0 6.45738 0 7.80434V30H2.76506V10.9846L16.075 24.5337C17.006 25.4814 18.5874 24.8036 18.5874 23.4565V5.57886L21.0069 8.16545L23 6.19541L17.2048 0Z"
        fill="black"
      />
    </svg>
    {/* White logo for Dark Mode */}
    <svg
      width="32"
      height="40"
      viewBox="0 0 62 79"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="hidden dark:block transition-all duration-300"
    >
      <path
        d="M46.3782 0L30.7564 16.3146L36.1293 21.5024L42.6514 14.691V53.3941L6.77247 17.715C4.26262 15.2191 0 17.0044 0 20.5514V79H7.45364V28.9262L43.3326 64.6053C45.8423 67.1011 50.105 65.316 50.105 61.7689V14.691L56.6272 21.5024L62 16.3146L46.3782 0Z"
        fill="white"
      />
    </svg>
  </>
);

const Turn2LawTextLogo = () => (
  <svg width="145" height="24" viewBox="0 0 290 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.4854 6.83972L21.4854 38.9618H11.5L13.5147 6.08386L23.4854 6.83972Z" fill="#E09D47"/>
    <g filter="url(#filter0_d_1067_3976)">
      <path d="M33.5001 4.70593L33.1291 11.7059L4 11.9618V4.70593H33.5001Z" fill="#E09D47"/>
    </g>
    <path d="M67.5 4.54675L65.751 26.1522C65.0994 33.9709 58.4614 39.9236 50.6182 39.7225C42.1868 39.5061 36.2295 34.9618 36.2295 23.8866L37.5 4.96179H47.5L46.2051 24.5868C46 30.4618 47.5 31.4618 50.5 31.4618C54 31.4618 55.5 29.9618 55.7861 25.3221L57.5176 4.54675H67.5Z" fill="#E09D47"/>
    <g filter="url(#filter1_d_1067_3976)">
      <path d="M65.751 26.0673C65.7469 26.1162 65.5045 26.413 65.5 26.4618C64.0137 29.59 60.8547 31.4617 57.3379 31.4618H50V31.455C50.0888 31.4571 50.1789 31.4618 50.2705 31.4618C53.7705 31.4618 55.2705 29.8768 55.5566 25.2372L57.2881 4.46179H67.5L65.751 26.0673Z" fill="#E09D47"/>
    </g>
    <path d="M100 38.9618H89.5L83.4375 26.0067L92.5625 21.9169L100 38.9618Z" fill="#E09D47"/>
    <g filter="url(#filter2_d_1067_3976)">
      <path d="M79 22H94V25.5L79 26V22Z" fill="#D9D9D9"/>
    </g>
    <path d="M89.9648 4.46179L90.5039 4.47449C96.0433 4.73455 100.605 8.97817 101.336 14.4628C101.469 15.4605 101.466 16.484 101.322 17.4891C100.546 22.9244 95.8909 26.9617 90.4004 26.9618H81.6973L80.9912 39.2509H71L73 4.46179H89.9648ZM82.1572 18.9618H90.4004C91.9098 18.9617 93.1899 17.8515 93.4033 16.3573C93.4419 16.0867 93.4425 15.8 93.4053 15.5204C93.1785 13.8197 91.7594 12.5436 90.123 12.4657L89.9648 12.4618H82.5312L82.1572 18.9618Z" fill="#E09D47"/>
    <path d="M141 4.46179L138.113 39.4618H128.576L110.316 10.2001L118.5 4.46179L129.5 22.4618L131.033 4.38269L141 4.46179Z" fill="#E09D47"/>
    <g filter="url(#filter3_d_1067_3976)">
      <path d="M118.5 4.46179L115.98 39.4618H106L108.52 4.46179H118.5Z" fill="#E09D47"/>
    </g>
    <path d="M200 31.4618V39.4618H182V31.4618H200Z" fill="#E09D47"/>
    <g filter="url(#filter4_d_1067_3976)">
      <path d="M187.5 4.96179L185.5 39.4618H175.182L177.583 4.96179H187.5Z" fill="#E09D47"/>
    </g>
    <path d="M226 25.9618V32.9618H214V25.9618H226Z" fill="#E09D47"/>
    <g filter="url(#filter5_d_1067_3976)">
      <path d="M226 4.46179L213 39.4618H203L216 4.46179H226Z" fill="#E09D47"/>
    </g>
    <path d="M237 39.4618H226.5L221.5 4.46179H230L237 39.4618Z" fill="#E09D47"/>
    <path d="M267.17 15.4618L259.5 39.4618H251.83L259.5 15.4618H267.17Z" fill="#E09D47"/>
    <path d="M268.17 15.4618L271.67 39.4618H264L260.5 15.4618H268.17Z" fill="#E09D47"/>
    <path d="M289.33 4.46179L277.5 39.4618H267.5L279.33 4.46179H289.33Z" fill="#E09D47"/>
    <g filter="url(#filter6_d_1067_3976)">
      <path d="M254.5 39.4618H245L239.5 4.46179H249.5L254.5 39.4618Z" fill="#E09D47"/>
    </g>
    <path d="M153.75 4.35818C157.423 3.59598 164.294 3.60815 168 8.96176C169.478 11.0964 170.306 13.1727 170 15.4618C170.064 17.875 169.006 20.1266 167.802 21.9998C165.541 25.5158 161.577 28.1247 157.405 29.99C156.396 30.6315 155.596 31.3042 154.961 31.9617H168.5V39.9617H144.12L144.517 35.5994L148.5 35.9617C144.59 35.6062 144.518 35.5978 144.517 35.5955L144.518 35.5906L144.521 35.5613C144.522 35.547 144.524 35.5306 144.525 35.5135C144.529 35.4792 144.533 35.4394 144.539 35.3943C144.551 35.3039 144.567 35.1919 144.589 35.0603C144.633 34.7971 144.701 34.453 144.806 34.0447C145.015 33.2293 145.373 32.1455 145.984 30.9226C147.221 28.449 149.457 25.4841 153.403 23.0554L153.642 22.909L153.896 22.7967C157.614 21.1703 160.013 19.3225 161.073 17.6736C161.556 16.922 161.696 16.6221 161.696 15.739C161.696 14.7852 161.073 13.7624 160.711 13.239C160.343 12.7074 158.327 11.5784 155.375 12.1912C154.048 12.4666 152.787 12.9172 151.833 13.3162C151.364 13.5124 150.988 13.6881 150.738 13.8103C150.614 13.8711 150.522 13.9183 150.467 13.947C150.44 13.9607 147.512 15.953 147.503 15.9578C147.495 15.9407 147.5 10.4618 147.5 10.4618V6.46175L147.503 6.46078C147.503 6.46078 147.507 6.45799 147.509 6.45687C147.513 6.45462 147.518 6.45198 147.523 6.44906C147.535 6.44303 147.549 6.43538 147.565 6.4266C147.599 6.40895 147.643 6.38611 147.696 6.35824C147.804 6.3023 147.315 6.55219 147.5 6.46175C147.869 6.28125 148.113 6.20094 148.745 5.9363C149.995 5.41349 151.765 4.77024 153.75 4.35818Z" fill="#E09D47"/>
    <g filter="url(#filter7_d_1067_3976)">
      <path d="M153.75 4.46173C157.423 3.69954 164.294 3.71163 168 9.06525C169.478 11.1999 170.306 13.2762 170 15.5652C170.012 16.0322 169.981 16.4928 169.916 16.9461C169.066 13.1558 165.264 10.439 161.121 11.3397L157.998 12.1035H156.998C156.343 12.0575 156.186 12.1264 155.375 12.2947C154.048 12.5702 152.787 13.0207 151.833 13.4197C151.364 13.6159 150.988 13.7917 150.738 13.9139C150.614 13.9746 150.522 14.0218 150.467 14.0506C150.433 14.0695 147.512 16.0565 147.503 16.0613C147.495 16.0442 147.5 10.6049 147.5 10.5652V6.56525L147.503 6.56427L147.504 6.56232C147.871 6.38327 148.115 6.30345 148.745 6.03986C149.995 5.51705 151.765 4.8738 153.75 4.46173ZM147.509 6.56036L147.504 6.56232L147.5 6.56525L147.509 6.56036ZM147.509 6.56036C147.513 6.55813 147.518 6.55546 147.523 6.55255C147.535 6.54653 147.549 6.53885 147.565 6.53009L147.509 6.56036Z" fill="#E09D47"/>
    </g>
    <defs>
      <filter id="filter0_d_1067_3976" x="0" y="3.70593" width="37.5001" height="15.2559" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="3"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1067_3976"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1067_3976" result="shape"/>
      </filter>
      <filter id="filter1_d_1067_3976" x="48" y="0.461792" width="25.5" height="35" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="2"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.8 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1067_3976"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1067_3976" result="shape"/>
      </filter>
      <filter id="filter2_d_1067_3976" x="77" y="19" width="23" height="12" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="2" dy="1"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.8 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1067_3976"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1067_3976" result="shape"/>
      </filter>
      <filter id="filter3_d_1067_3976" x="106" y="0.461792" width="20.5" height="43" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1067_3976"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1067_3976" result="shape"/>
      </filter>
      <filter id="filter4_d_1067_3976" x="175.182" y="0.961792" width="20.3179" height="42.5" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1067_3976"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1067_3976" result="shape"/>
      </filter>
      <filter id="filter5_d_1067_3976" x="199" y="4.46179" width="31" height="43" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1067_3976"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1067_3976" result="shape"/>
      </filter>
      <filter id="filter6_d_1067_3976" x="239.5" y="0.461792" width="23" height="43" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1067_3976"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1067_3976" result="shape"/>
      </filter>
      <filter id="filter7_d_1067_3976" x="143.498" y="4.10352" width="30.5648" height="20.8426" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1067_3976"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1067_3976" result="shape"/>
      </filter>
    </defs>
  </svg>
);

const SignupPage = () => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [signupType, setSignupType] = useState<'user' | 'lawyer'>('user');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  // Validation state tracking
  const [validationState, setValidationState] = useState<{ [key: string]: boolean }>({
    name: false,
    email: false,
    password: false,
    mobile: false,
    city: false,
    barNumber: false,
    experience: false,
    consultationFee: false,
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    countryCode: '+91',
    mobile: '',
    // User specific
    city: '',
    // Lawyer specific
    barNumber: '',
    experience: '',
    specialization: '',
    education: '',
    courtPractice: '',
    languages: '',
    bio: '',
    consultationFee: ''
  });

  const handleValidatedInputChange = (field: string, value: string, isValid: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationState(prev => ({ ...prev, [field]: isValid }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file using utility
      const validation = validateFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        required: false
      });
      
      if (!validation.isValid) {
        showNotification(validation.error, 'error');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Validate all required fields before submission
      const requiredFields = signupType === 'lawyer'
        ? ['name', 'email', 'password', 'mobile', 'barNumber', 'experience', 'consultationFee']
        : ['name', 'email', 'password', 'mobile', 'city'];
      
      const invalidFields = requiredFields.filter(field => !validationState[field]);
      
      if (invalidFields.length > 0) {
        setError(`Please correctly fill in: ${invalidFields.join(', ')}`);
        setIsLoading(false);
        return;
      }
      
      console.log('[Signup] Starting Supabase Auth registration...');
      
      // Import Supabase auth functions
      const { signUpWithEmail } = await import('@/lib/supabase-auth');
      const { supabase } = await import('@/lib/supabase');
      
      // Prepare user data for Supabase Auth
      const userType = signupType === 'lawyer' ? 'lawyer' : 'client';
      const phone = formData.countryCode + formData.mobile;
      
      // Sign up with Supabase Auth
      const { user, session } = await signUpWithEmail({
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        userType: userType,
        phone: phone,
        city: formData.city || undefined
      });

      if (!user) {
        throw new Error('Registration failed - no user returned');
      }

      console.log('[Signup] Supabase Auth successful, user ID:', user.id);
      
      // Store user type for redirect decision
      const finalUserType = signupType === 'lawyer' ? 'lawyer' : 'client';
      
      // If lawyer, create lawyer_profiles entry with additional data
      if (signupType === 'lawyer') {
        console.log('[Signup] Creating lawyer_profiles entry with additional data...');
        
        const lawyerData = {
          user_id: user.id,
          bar_number: formData.barNumber,
          experience_years: parseInt(formData.experience) || 0,
          specialization: formData.specialization,
          education: formData.education,
          court_practice: formData.courtPractice,
          languages: formData.languages, // Store as comma-separated string
          bio: formData.bio,
          consultation_fee: parseFloat(formData.consultationFee) || 0,
          profile_image_url: null, // Will be updated after image upload
        };
        
        const { error: insertError } = await supabase
          .from('lawyer_profiles')
          .insert(lawyerData);
        
        if (insertError) {
          console.error('[Signup] Error creating lawyer profile:', insertError);
          throw new Error('Failed to create lawyer profile: ' + insertError.message);
        }
        
        console.log('[Signup] Lawyer profile created successfully');
        
        // TODO: Handle profile image upload to Supabase Storage
        // For now, we'll skip the image upload (can be added later)
        if (profileImage) {
          console.log('[Signup] Profile image upload to be implemented with Supabase Storage');
        }
      }
      
      // Redirect to email OTP verification page 
      // The verify-email-otp page will automatically send OTP when it loads
      console.log('[Signup] Registration successful, redirecting to email verification');
      showNotification(`${finalUserType === 'lawyer' ? 'Lawyer' : 'Client'} registration successful! Check your email for the verification code.`, 'success');
      router.push(`/verify-email-otp?email=${encodeURIComponent(formData.email)}`);
      
    } catch (error: any) {
      console.error('[Signup] Registration error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Image and branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-background relative overflow-hidden rounded-r-3xl">
        <div className="absolute inset-0 bg-background flex flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo />
              <Turn2LawTextLogo />
            </Link>
          </div>
          
          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-5xl font-bold text-foreground mb-8 leading-tight">
              We Simplify Legal<br />
              Access for <span className="text-primary">Everyone</span>.
            </h1>
            
            {/* Hero section image */}
            <div className="relative">
              <Image
                src="/images/landingpagephoto.png"
                alt="Legal Justice"
                width={500}
                height={300}
                className="w-full h-80 object-contain object-left rounded-lg"
              />
            </div>
          </div>
          
          {/* Terms */}
          <div className="text-muted-foreground text-sm">
            By Signing in, You accept our Terms & Condition and Privacy Policy
          </div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-12">
        <div className="max-w-md mx-auto w-full">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Link href="/" className="flex items-center gap-3">
              <Logo />
              <Turn2LawTextLogo />
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-8">Sign up</h2>
          
          {/* Signup type selector */}
          <div className="mb-8">
            <div className="flex gap-4 mb-6">
              <Button
                type="button"
                variant={signupType === 'user' ? 'default' : 'outline'}
                onClick={() => setSignupType('user')}
                className="flex-1"
              >
                Sign up as User
              </Button>
              <Button
                type="button"
                variant={signupType === 'lawyer' ? 'default' : 'outline'}
                onClick={() => setSignupType('lawyer')}
                className="flex-1"
              >
                Sign up as Lawyer
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common fields */}
            <ValidatedInput
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onValueChange={(value, isValid) => handleValidatedInputChange('name', value, isValid)}
              validationType="text"
              textOptions={{ minLength: 2, maxLength: 100 }}
              className="bg-background border-border text-foreground placeholder-muted-foreground"
              required
              label="Full Name"
            />

            <ValidatedInput
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onValueChange={(value, isValid) => handleValidatedInputChange('email', value, isValid)}
              validationType="email"
              className="bg-background border-border text-foreground placeholder-muted-foreground"
              required
              label="Email Address"
            />

            <ValidatedInput
              type="password"
              placeholder="Create Strong Password"
              value={formData.password}
              onValueChange={(value, isValid) => handleValidatedInputChange('password', value, isValid)}
              validationType="password"
              showPasswordStrength={true}
              className="bg-background border-border text-foreground placeholder-muted-foreground"
              required
              label="Password"
            />

            {/* Mobile number */}
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="+91"
                value={formData.countryCode}
                onChange={(e) => handleInputChange('countryCode', e.target.value)}
                className="w-20 bg-background border-border text-foreground placeholder-muted-foreground text-center"
                required
              />
              <ValidatedInput
                type="tel"
                placeholder="Mobile Number"
                value={formData.mobile}
                onValueChange={(value, isValid) => handleValidatedInputChange('mobile', value, isValid)}
                validationType="phone"
                countryCode={formData.countryCode}
                className="flex-1 bg-background border-border text-foreground placeholder-muted-foreground"
                required
              />
            </div>

            {/* User specific fields */}
            {signupType === 'user' && (
              <>
                <ValidatedInput
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onValueChange={(value, isValid) => handleValidatedInputChange('city', value, isValid)}
                  validationType="text"
                  textOptions={{ minLength: 2, maxLength: 50, allowSpecialChars: false }}
                  className="bg-background border-border text-foreground placeholder-muted-foreground"
                  required
                  label="City"
                />
              </>
            )}

            {/* Lawyer specific fields */}
            {signupType === 'lawyer' && (
              <>
                <ValidatedInput
                  type="text"
                  placeholder="Bar Council Registration Number"
                  value={formData.barNumber}
                  onValueChange={(value, isValid) => handleValidatedInputChange('barNumber', value, isValid)}
                  validationType="barNumber"
                  className="bg-background border-border text-foreground placeholder-muted-foreground"
                  required
                  label="Bar Council Number"
                />
                
                <ValidatedInput
                  type="number"
                  placeholder="Years of Experience"
                  value={formData.experience}
                  onValueChange={(value, isValid) => handleValidatedInputChange('experience', value, isValid)}
                  validationType="experience"
                  className="bg-background border-border text-foreground placeholder-muted-foreground"
                  required
                  label="Years of Experience"
                />
                
                <Select onValueChange={(value) => handleInputChange('specialization', value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family Law</SelectItem>
                    <SelectItem value="criminal">Criminal Law</SelectItem>
                    <SelectItem value="corporate">Corporate Law</SelectItem>
                    <SelectItem value="property">Property Law</SelectItem>
                    <SelectItem value="labor">Labor Law</SelectItem>
                    <SelectItem value="tax">Tax Law</SelectItem>
                    <SelectItem value="constitutional">Constitutional Law</SelectItem>
                    <SelectItem value="intellectual">Intellectual Property Law</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="text"
                  placeholder="Educational Background"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="bg-background border-border text-foreground placeholder-muted-foreground"
                  required
                />
                
                <Input
                  type="text"
                  placeholder="Court Practice Location"
                  value={formData.courtPractice}
                  onChange={(e) => handleInputChange('courtPractice', e.target.value)}
                  className="bg-background border-border text-foreground placeholder-muted-foreground"
                  required
                />
                
                <Input
                  type="text"
                  placeholder="Languages Spoken (comma-separated)"
                  value={formData.languages}
                  onChange={(e) => handleInputChange('languages', e.target.value)}
                  className="bg-background border-border text-foreground placeholder-muted-foreground"
                  required
                />
                
                <ValidatedInput
                  type="number"
                  placeholder="Consultation Fee (₹)"
                  value={formData.consultationFee}
                  onValueChange={(value, isValid) => handleValidatedInputChange('consultationFee', value, isValid)}
                  validationType="consultationFee"
                  className="bg-background border-border text-foreground placeholder-muted-foreground"
                  required
                  label="Consultation Fee (₹)"
                />
                
                {/* Profile Image Upload */}
                <div className="space-y-3">
                  <label className="block text-foreground text-sm font-medium">
                    Profile Picture (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProfileImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                        <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="profile-image"
                      />
                      <label
                        htmlFor="profile-image"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-muted border border-border text-foreground text-sm rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Image
                      </label>
                      <p className="text-muted-foreground text-xs mt-1">
                        Max 5MB, JPG/PNG only
                      </p>
                    </div>
                  </div>
                </div>
                
                <Textarea
                  placeholder="Professional Bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="bg-background border-border text-foreground placeholder-muted-foreground min-h-[100px]"
                  required
                />
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-3 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Continue'}
            </Button>
          </form>

          {/* Additional Auth Options */}
          <div className="mt-6 space-y-4">
            {/* Only show Google sign-up for clients, not lawyers */}
            {signupType === 'user' && (
              <>
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-background text-muted-foreground">Or sign up with</span>
                  </div>
                </div>

                {/* Google Sign-up */}
                <GoogleSignInButton mode="signup" />
              </>
            )}

            {/* Login Link */}
            <p className="text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
