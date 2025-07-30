import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile: React.FC = () => {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bio: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('Profiles')
        .select('name, age, bio')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile({
        name: data.name || '',
        age: data.age || '',
        bio: data.bio || '',
      });
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('Profiles')
      .update(profile)
      .eq('id', user.id);

    if (error) {
      console.error('Error saving profile:', error);
      return;
    }

    navigate('/profile'); // Go back to profile view or wherever appropriate
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <div className="form-group">
        <label>Name</label>
        <input name="name" value={profile.name} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Age</label>
        <input name="age" type="number" value={profile.age} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Bio</label>
        <textarea name="bio" value={profile.bio} onChange={handleChange} />
      </div>
      <button className="save-button" onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default EditProfile;
