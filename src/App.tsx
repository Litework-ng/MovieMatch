import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import MatchList from './pages/MatchList';
import Messages from './pages/Message';
import Chat from './pages/Chat';
import Profile from './pages/ProfileScreen';
import Matches from './pages/Matches';
import EditProfile from './pages/EditProfile'
import Discussion from './pages/Discussion'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/match-list" element={<MatchList />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/chat/:userId" element={<Chat />} />
        <Route path="/home" element={<Home />} />
        <Route path = "/edit-profile" element={<EditProfile/>}/>
        <Route path="/discussion/:movieId" element={<Discussion />} />

      </Routes>
    </Router>
  );
}

export default App;
