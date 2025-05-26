import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/home";
import NotFound from "../pages/notfoundpage";
import About from "../pages/about";
import WeatherReport from "../pages/weatherreport";
import LoginPage from "../pages/login";
import Register from "../pages/register";
import Post from "../pages/post";
import PostForm from "../pages/postform";
import SinglePost from "../pages/singlepost";
import ContactUs from "../pages/contactus";
import Dashboard from "../pages/dashboard";
import CropRecommendationForm from "../pages/cropRecommendation";
import CropRecommendationDetail from "../pages/cropRecommendationDetails";
import ProtectedRoute from "../components/ProtectedRoute";
import ActivityManagement from "../pages/activitymanagement";
import AdminDashboard from "../pages/admindashboard";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/weatherreport" element={<WeatherReport />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/blog" element={<Post />} />
      <Route path="/contact" element={<ContactUs />} />

      <Route
        path="/community/posts/create"
        element={
          <ProtectedRoute>
            <PostForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/community/posts/:id"
        element={
          <ProtectedRoute>
            <SinglePost />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/crop-recommendations"
        element={
          <ProtectedRoute>
            <CropRecommendationForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <ActivityManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/crop-recommendations/:id"
        element={
          <ProtectedRoute>
            <CropRecommendationDetail />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
