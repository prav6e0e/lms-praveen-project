
import { BrowserRouter , Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PlannerDetails from "./pages/PlannerDetails";
import CreatePlan from "./pages/CreatePlan";
import CoursePage from "./pages/CoursePage";
import LessonPage from "./pages/LessonPage";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Instructor from "./pages/Instructor";
import Grievance from "./pages/Grievance";
import Doubt from "./pages/Doubt";
import Notification from "./pages/Notification";
import Performance from "./pages/Performance";
import RecieveNotification from "./pages/RecieveNotification";



function App() {
  return (
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* normal dashboard student dashboard hai */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/planner/:id" element={<PlannerDetails />} />
        <Route path="/create-plan" element={<CreatePlan />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/grievance" element={<Grievance />} />
        <Route path="/doubt" element={<Doubt />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/recievenotification" element={<RecieveNotification />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;