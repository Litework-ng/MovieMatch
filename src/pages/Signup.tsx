import { useState, FormEvent } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../services/supabase';
import { useNavigate,  Link } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signup successful. Please check your email to confirm.');
      navigate('/');
    }
  };

  return (
    <div className="signup-container">
      <h1 className="login-header">FlicksMatch</h1>
      <p className="login-subheader">Connect with Movie lovers like you</p>
      <form onSubmit={handleSignup} className="signup-form">
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
        <button type="submit"  className="login-button">Sign Up</button>
      </form>
      <p>
      Already have an account? <Link to="/">Log in</Link>
    </p>

    </div>
  );
};

export default Signup;
