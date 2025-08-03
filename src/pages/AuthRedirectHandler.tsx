import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { toast } from 'react-toastify';

const AuthRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        toast.error('Invalid or expired confirmation link. Please log in.');
        navigate('/');
        return;
      }
      // Optionally, fetch profile or do onboarding
      toast.success('Email confirmed! Welcome.');
      navigate('/home');
    };
    handleAuthRedirect();
  }, [navigate]);

  return null;
};

export default AuthRedirectHandler;
