import { useState, FormEvent } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    alert(loginError.message);
    return;
  }

  const userId = authData?.user?.id;

  if (!userId) {
    alert("User ID not found after login.");
    return;
  }

  // Check if user profile exists
  const { data: profile, error: profileError } = await supabase
    .from('Profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    // Something went wrong (not just missing row)
    console.error('Error fetching profile:', profileError);
    alert('Error fetching profile.');
    return;
  }

  if (profile) {
    // Existing user
    navigate('/home');
  } else {
    // New user
    navigate('/profile-setup');
  }
};


  return (
    <div className="login-container">
       <h1 className="login-header">CineMatch</h1>
      <p className="login-subheader">Connect with Movie lovers like you</p>

      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <button type="submit"  className="login-button">Log In</button>
      </form>
    </div>
  );
};

export default Login;
