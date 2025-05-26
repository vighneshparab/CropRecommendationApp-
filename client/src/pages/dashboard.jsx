import { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiHeart,
  FiMessageSquare,
  FiClock,
  FiSun,
  FiDroplet,
  FiThermometer,
  FiWind,
  FiCloud,
  FiCheckCircle,
  FiPackage,
  FiDollarSign,
  FiUsers,
} from "react-icons/fi";
import { Link } from 'react-router-dom';
import ProfileEditForm from "../components/profileEditForm";
import profile from "../assets/images/profile.jpeg";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState("activities");
  const [loading, setLoading] = useState({
    profile: true,
    activities: true,
    posts: true,
    recommendations: true,
  });
  const [error, setError] = useState(null);

  const handleProfileUpdate = (updatedUser) => {
    setUserProfile(updatedUser);
    setIsEditing(false);
  };

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setUserProfile(data.user);
      } catch (err) {
        console.error("Profile Error:", err);
        setError(
          err.message || "An error occurred while fetching the profile."
        );
      } finally {
        setLoading((prev) => ({ ...prev, profile: false }));
      }
    };

    fetchProfile();
  }, []);

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/activity`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch activities");
        const data = await response.json();
        setActivities(data.activities);
      } catch (err) {
        console.error("Activities Error:", err);
        setError(err.message || "An error occurred while fetching activities.");
      } finally {
        setLoading((prev) => ({ ...prev, activities: false }));
      }
    };

    fetchActivities();
  }, []);

  // Fetch user posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/community/posts/mine`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        setPosts(data.posts);
      } catch (err) {
        console.error("Posts Error:", err);
        setError(err.message || "An error occurred while fetching posts.");
      } finally {
        setLoading((prev) => ({ ...prev, posts: false }));
      }
    };

    fetchPosts();
  }, []);

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/suggestions/history`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch recommendations");
        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        console.error("Recommendations Error:", err);
        setError(
          err.message || "An error occurred while fetching recommendations."
        );
      } finally {
        setLoading((prev) => ({ ...prev, recommendations: false }));
      }
    };

    fetchRecommendations();
  }, []);

  const handleDeleteActivity = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/activity/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete activity");
      setActivities((prev) => prev.filter((activity) => activity._id !== id));
    } catch (err) {
      console.error("Delete Activity Error:", err);
      setError(err.message || "An error occurred while deleting activity.");
    }
  };

  const handleDeletePost = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/community/posts/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((post) => post._id !== id));
    } catch (err) {
      console.error("Delete Post Error:", err);
      setError(err.message || "An error occurred while deleting post.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getWeatherIcon = (conditions) => {
    switch (conditions.toLowerCase()) {
      case "sunny":
        return <FiSun className="text-yellow-500" />;
      case "rainy":
        return <FiDroplet className="text-blue-500" />;
      case "cloudy":
        return <FiCloud className="text-gray-500" />;
      case "windy":
        return <FiWind className="text-gray-400" />;
      default:
        return <FiThermometer className="text-orange-500" />;
    }
  };

  if (loading.profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:flex-shrink-0 p-6 flex justify-center">
                <div className="relative">
                  <img
                    className="h-32 w-32 rounded-full object-cover border-4 border-green-100"
                    src={profile}
                    alt="Profile picture"
                  />

                  <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition duration-200">
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {userProfile?.name}
                    </h1>
                    <p className="text-gray-600 capitalize">
                      {userProfile?.role || "farmer"}
                    </p>
                  </div>
                  {/* Replace the existing button with this */}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200 flex items-center"
                  >
                    <FiEdit2 className="mr-2" />
                    Edit Profile
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center text-gray-700">
                    <FiMail className="mr-2 text-green-600" />
                    <span>{userProfile?.email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FiCalendar className="mr-2 text-green-600" />
                    <span>Joined {formatDate(userProfile?.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FiMapPin className="mr-2 text-green-600" />
                    <span>{userProfile?.location || "Not specified"}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FiCheckCircle className="mr-2 text-green-600" />
                    <span>{userProfile?.activityCount || 0} Activities</span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <div className="bg-green-50 px-4 py-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">
                      {recommendations.length}
                    </p>
                    <p className="text-sm text-gray-600">Recommendations</p>
                  </div>
                  <div className="bg-green-50 px-4 py-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">
                      {posts.length}
                    </p>
                    <p className="text-sm text-gray-600">Community Posts</p>
                  </div>
                  <div className="bg-green-50 px-4 py-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">
                      {activities.length}
                    </p>
                    <p className="text-sm text-gray-600">Activities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Add this right before the final closing </div> */}
          {isEditing && (
            <ProfileEditForm
              userProfile={userProfile}
              onSave={handleProfileUpdate}
              onCancel={() => setIsEditing(false)}
            />
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("activities")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "activities"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Activities
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "posts"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Community Posts
              </button>
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "recommendations"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Crop Recommendations
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Activities Tab */}
            {activeTab === "activities" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Farm Activities
                  </h2>
                  <Link
                    to="/activities"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200 flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    Add Activity
                  </Link>
                </div>

                {loading.activities ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No activities recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activities.map((activity) => (
                      <div
                        key={activity._id}
                        className="border border-gray-200 rounded-lg p-6 hover:bg-green-50 transition duration-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 capitalize">
                                {activity.activityType}
                              </span>
                              <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {activity.status}
                              </span>
                            </div>
                            <h3 className="mt-2 text-lg font-semibold text-gray-800">
                              {activity.crop}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {activity.fieldLocation}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-green-600 hover:text-green-800">
                              <FiEdit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(activity._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Activity Details */}
                          <div>
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-500 mb-2">
                                Plot Size
                              </h4>
                              <p className="text-gray-800">
                                {activity.plotSize.value}{" "}
                                {activity.plotSize.unit}
                              </p>
                            </div>

                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-500 mb-2">
                                Weather Conditions
                              </h4>
                              <div className="flex items-center space-x-2">
                                {getWeatherIcon(
                                  activity.weatherConditions.conditions
                                )}
                                <span>
                                  {activity.weatherConditions.conditions}
                                </span>
                                <span className="text-gray-500">|</span>
                                <FiThermometer className="text-gray-500" />
                                <span>
                                  {activity.weatherConditions.temperature}°C
                                </span>
                                <span className="text-gray-500">|</span>
                                <FiDroplet className="text-gray-500" />
                                <span>
                                  {activity.weatherConditions.humidity}%
                                </span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-500 mb-2">
                                Duration
                              </h4>
                              <p className="text-gray-800">
                                {formatDuration(activity.duration)}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">
                                Workers
                              </h4>
                              <p className="text-gray-800">
                                {activity.workers} people
                              </p>
                            </div>
                          </div>

                          {/* Resources Used */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                              Resources Used
                            </h4>
                            <div className="space-y-2">
                              {activity.resourcesUsed.map((resource, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center bg-gray-50 p-3 rounded"
                                >
                                  <div className="flex items-center">
                                    <FiPackage className="mr-2 text-green-600" />
                                    <span className="font-medium">
                                      {resource.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">
                                      {resource.quantity} {resource.unit}
                                    </span>
                                    {resource.cost && (
                                      <span className="flex items-center text-sm text-green-700">
                                        <FiDollarSign className="mr-1" />
                                        {resource.cost}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {activity.notes && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                              Notes
                            </h4>
                            <p className="text-gray-700">{activity.notes}</p>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                          <span>Created: {formatDate(activity.createdAt)}</span>
                          <span>Updated: {formatDate(activity.updatedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === "posts" && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Your Community Posts
                </h2>

                {loading.posts ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>You haven't posted in the community yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className="border border-gray-200 rounded-lg p-6 hover:bg-green-50 transition duration-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                              {post.category}
                            </span>
                            <h3 className="mt-2 font-bold text-lg text-gray-800">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(post.createdAt)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="text-gray-700 mb-4">{post.content}</p>

                        {post.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {post.attachments?.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {post.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className="border rounded-lg overflow-hidden"
                              >
                                {attachment.fileType === "image" ? (
                                  <img
                                    src={attachment.url}
                                    alt={`Attachment ${index + 1}`}
                                    className="w-full h-40 object-cover"
                                  />
                                ) : (
                                  <div className="bg-gray-100 p-4 flex items-center justify-center h-40">
                                    <span className="text-gray-500">
                                      Video Attachment
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-gray-500 text-sm border-t border-gray-200 pt-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <FiHeart className="mr-1" />
                              <span>{post.likeCount || 0} likes</span>
                            </div>
                            <div className="flex items-center">
                              <FiMessageSquare className="mr-1" />
                              <span>{post.commentCount || 0} comments</span>
                            </div>
                            <div className="flex items-center">
                              <FiUsers className="mr-1" />
                              <span>{post.viewCount || 0} views</span>
                            </div>
                          </div>
                          {post.isEdited && (
                            <span className="text-xs text-gray-400">
                              Edited
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === "recommendations" && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Your Crop Recommendations
                </h2>

                {loading.recommendations ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>You haven't generated any crop recommendations yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((recommendation) => (
                      <div
                        key={recommendation._id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-green-50 transition duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {recommendation.recommendations.map(
                                (rec, idx) => (
                                  <span key={idx}>
                                    {rec.cropName}
                                    {idx <
                                    recommendation.recommendations.length - 1
                                      ? ", "
                                      : ""}
                                  </span>
                                )
                              )}
                            </h3>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <FiCalendar className="mr-1" />
                              <span>
                                {formatDate(recommendation.createdAt)}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`/crop-recommendations/${recommendation._id}`}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            View Details
                          </a>
                        </div>

                        {recommendation.recommendations[0]?.factorId && (
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center">
                              <FiThermometer className="mr-1 text-gray-500" />
                              <span>
                                {
                                  recommendation.recommendations[0].factorId
                                    .temperature
                                }
                                °C
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FiDroplet className="mr-1 text-gray-500" />
                              <span>
                                {
                                  recommendation.recommendations[0].factorId
                                    .rainfall
                                }
                                mm
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FiSun className="mr-1 text-gray-500" />
                              <span>
                                {
                                  recommendation.recommendations[0].factorId
                                    .soilType
                                }
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FiCheckCircle className="mr-1 text-gray-500" />
                              <span>
                                pH{" "}
                                {
                                  recommendation.recommendations[0].factorId
                                    .soilPH
                                }
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
