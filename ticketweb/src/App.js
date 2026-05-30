// src/App.js
import { BrowserRouter, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from "react-bootstrap";

// Layout
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Home
import Home from "./components/Home";

// Auth
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Profile from "./components/auth/Profile";
import UpdateProfile from "./components/auth/UpdateProfile";
import ChangePassword from "./components/auth/ChangePassword";

// Companies
import Company from "./components/companies/Company";
import CompanyDetail from "./components/companies/CompanyDetail";
import CompanyForm from "./components/companies/CompanyForm";
import CompanyApproval from "./components/companies/CompanyApproval";

// Buses
import Bus from "./components/buses/Bus";
import BusDetail from "./components/buses/BusDetail";
import BusForm from "./components/buses/BusForm";

// Routes
import RouteList from "./components/routes/Route";
import RouteDetail from "./components/routes/RouteDetail";
import RouteForm from "./components/routes/RouteForm";

// Stops
import Stop from "./components/stops/Stop";
import StopDetail from "./components/stops/StopDetail";
import StopForm from "./components/stops/StopForm";

// Schedules
import Schedule from "./components/schedules/Schedule";
import ScheduleDetail from "./components/schedules/ScheduleDetail";
import ScheduleForm from "./components/schedules/ScheduleForm";

//Checkout
import Checkout from "./components/checkouts/Checkout";

// Reservations
import ReservationForm from "./components/reservations/ReservationForm";
import ReservationDetail from "./components/reservations/ReservationDetail";

// Payments
import PaymentReturn from "./components/payments/PaymentReturn";

// Promotions
import Promotion from "./components/promotions/Promotion";
import CheckPromotion from "./components/promotions/CheckPromotion";

// Reviews
import Review from "./components/reviews/Review";
import ReviewForm from "./components/reviews/ReviewForm";

// Notifications
import Notification from "./components/notifications/Notification";

// Chats
import ChatWindow from "./components/chats/ChatWindow";
import ChatAI from "./components/chats/ChatAI";

// GPS
import GPSMap from "./components/gps/GPSMap";

// Contexts + Reducers (user state)
//import { MyUserContext, MyDispatchContext } from "./configs/MyContexts";
//import { useContext } from "react";

const App = () => {
//  const [user, dispatch] = useContext(MyUserContext, MyDispatchContext);

  return (
    <BrowserRouter>
      <Header />
      <Container>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Companies */}
          <Route path="/companies" element={<Company />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/companies/add" element={<CompanyForm />} />
          <Route path="/companies/approval" element={<CompanyApproval />} />

          {/* Buses */}
          <Route path="/buses" element={<Bus />} />
          <Route path="/buses/:id" element={<BusDetail />} />
          <Route path="/buses/add" element={<BusForm />} />

          {/* Routes */}
          <Route path="/routes" element={<RouteList />} />
          <Route path="/routes/:id" element={<RouteDetail />} />
          <Route path="/routes/add" element={<RouteForm />} />

          {/* Checkout */}
          <Route path="/checkout" element={<Checkout />} />

          {/* Stops */}
          <Route path="/stops" element={<Stop />} />
          <Route path="/stops/:id" element={<StopDetail />} />
          <Route path="/stops/add" element={<StopForm />} />

          {/* Schedules */}
          <Route path="/schedules" element={<Schedule />} />
          <Route path="/schedules/:id" element={<ScheduleDetail />} />
          <Route path="/schedules/add" element={<ScheduleForm />} />

          {/* Reservations */}
          <Route path="/reservations/add" element={<ReservationForm />} />
          <Route path="/reservations/code/:code" element={<ReservationDetail />} />

          {/* Payments */}
          <Route path="/payments/:id" element={<PaymentReturn />} />

          {/* Promotions */}
          <Route path="/promotions" element={<Promotion />} />
          <Route path="/promotions/check" element={<CheckPromotion />} />

          {/* Reviews */}
          <Route path="/reviews" element={<Review />} />
          <Route path="/reviews/add" element={<ReviewForm />} />

          {/* Notifications */}
          <Route path="/notifications" element={<Notification />} />

          {/* Chats */}
          <Route path="/chat" element={<ChatWindow />} />
          <Route path="/chat/ai" element={<ChatAI />} />

          {/* GPS */}
          <Route path="/gps" element={<GPSMap />} />
        </Routes>
      </Container>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
