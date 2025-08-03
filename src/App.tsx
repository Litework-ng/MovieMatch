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
import EditProfile from './pages/EditProfile';
import Discussion from './pages/Discussion';
import AppToastContainer from './components/AppToastContainer';
import AuthRedirectHandler from './pages/AuthRedirectHandler';
import PrivateRoute from './components/PrivateRoute';
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/profile-setup" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
          <Route path="/match-list" element={<PrivateRoute><MatchList /></PrivateRoute>} />
          <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/chat/:userId" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path = "/edit-profile" element={<PrivateRoute><EditProfile/></PrivateRoute>}/>
          <Route path="/discussion/:movieId" element={<PrivateRoute><Discussion /></PrivateRoute>} />
          <Route path="/auth-redirect" element={<AuthRedirectHandler />} />
        </Routes>
      </Router>
      <AppToastContainer />
    </>
  );
}

export default App;
