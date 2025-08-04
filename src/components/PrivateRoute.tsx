import React, { useEffect, useState, PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';

type PrivateRouteProps = PropsWithChildren<{}>;

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setAuthenticated(!!data.user);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return <></>;
  if (authenticated) return <>{children}</>;
  // Redirect to home with hash to trigger alert
  return <Navigate to={{ pathname: '/', hash: '#unauth' }} state={{ from: location }} replace />;
};

export default PrivateRoute;
