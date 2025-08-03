import React, { useEffect, useState, PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

type PrivateRouteProps = PropsWithChildren<{}>;

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setAuthenticated(!!data.user);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return <></>; // always return a valid React element
  if (authenticated) return <>{children}</>;
  return <Navigate to="/" replace />;
};

export default PrivateRoute;
