import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Student from "./Student";
import Teacher from "./Teacher";

function AppRoutes() {
  return (
    <Routes>
    
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student-form" element={<Student />} />
      <Route path="/teacher-dashboard" element={<Teacher />} />
    </Routes>
  );
}

export default AppRoutes;