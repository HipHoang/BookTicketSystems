import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MyProvider } from './configs/MyContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/ProfileForm';
import Companies from './components/companies/CompanyList';
import Buses from './components/buses/BusList';
import RoutesPage from './components/routes/RouteList';
import Schedules from './components/schedules/ScheduleList';
import Reservations from './components/reservations/ReservationList';
import Chat from './components/chat/ChatBox';

function App() {
  return (
    <MyProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/buses" element={<Buses />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<h1>Page not found</h1>} />
        </Routes>
      </Router>
    </MyProvider>
  );
}

export default App;
