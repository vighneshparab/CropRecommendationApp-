import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCalendar,
  FiThermometer,
  FiDroplet,
  FiSun,
  FiWind,
  FiCloud,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiX,
} from "react-icons/fi";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const ActivityManagement = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    activityType: "planting",
    crop: "",
    fieldLocation: "",
    date: new Date().toISOString().split("T")[0],
    plotSize: { value: 0, unit: "acres" },
    notes: "",
    duration: 0,
    status: "completed",
    workers: 1,
    weatherConditions: {
      temperature: 25,
      humidity: 50,
      conditions: "sunny",
    },
    resourcesUsed: [],
    images: [],
  });

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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleResourceChange = (index, field, value) => {
    const updatedResources = [...formData.resourcesUsed];
    updatedResources[index][field] = value;
    setFormData((prev) => ({ ...prev, resourcesUsed: updatedResources }));
  };

  const addResource = () => {
    setFormData((prev) => ({
      ...prev,
      resourcesUsed: [
        ...prev.resourcesUsed,
        { name: "", quantity: 0, unit: "kg", cost: 0 },
      ],
    }));
  };

  const removeResource = (index) => {
    const updatedResources = formData.resourcesUsed.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, resourcesUsed: updatedResources }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = currentActivity
        ? `${import.meta.env.VITE_API_BASE_URL}/activity/${currentActivity._id}`
        : `${import.meta.env.VITE_API_BASE_URL}/activity`;

      const method = currentActivity ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save activity");

      const data = await response.json();

      if (currentActivity) {
        setActivities(
          activities.map((act) =>
            act._id === currentActivity._id ? data.activity : act
          )
        );
      } else {
        setActivities([...activities, data.activity]);
      }

      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity) => {
    setCurrentActivity(activity);
    setFormData({
      ...activity,
      date: activity.date.split("T")[0],
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?"))
      return;

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

      setActivities(activities.filter((act) => act._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      activityType: "planting",
      crop: "",
      fieldLocation: "",
      date: new Date().toISOString().split("T")[0],
      plotSize: { value: 0, unit: "acres" },
      notes: "",
      duration: 0,
      status: "completed",
      workers: 1,
      weatherConditions: {
        temperature: 25,
        humidity: 50,
        conditions: "sunny",
      },
      resourcesUsed: [],
      images: [],
    });
    setCurrentActivity(null);
    setIsCreating(false);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  if (loading && !isCreating && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Farm Activity Management
            </h1>
            <button
              onClick={() => {
                resetForm();
                setIsCreating(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200 flex items-center"
            >
              <FiPlus className="mr-2" />
              Add Activity
            </button>
          </div>

          {/* Activity Form Modal */}
          {(isCreating || isEditing) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      {currentActivity ? "Edit Activity" : "Add New Activity"}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Activity Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Activity Type
                        </label>
                        <select
                          name="activityType"
                          value={formData.activityType}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        >
                          <option value="planting">Planting</option>
                          <option value="harvesting">Harvesting</option>
                          <option value="fertilizing">Fertilizing</option>
                          <option value="irrigation">Irrigation</option>
                          <option value="pest_control">Pest Control</option>
                          <option value="pruning">Pruning</option>
                          <option value="soil_treatment">Soil Treatment</option>
                          <option value="weeding">Weeding</option>
                          <option value="transplanting">Transplanting</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Crop */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Crop
                        </label>
                        <input
                          type="text"
                          name="crop"
                          value={formData.crop}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter crop name"
                          required
                        />
                      </div>

                      {/* Field Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field Location
                        </label>
                        <input
                          type="text"
                          name="fieldLocation"
                          value={formData.fieldLocation}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter field location"
                        />
                      </div>

                      {/* Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>

                      {/* Plot Size */}
                      <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Plot Size (Value)
                          </label>
                          <input
                            type="number"
                            value={formData.plotSize.value}
                            onChange={(e) =>
                              handleNestedChange(
                                "plotSize",
                                "value",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit
                          </label>
                          <select
                            value={formData.plotSize.unit}
                            onChange={(e) =>
                              handleNestedChange(
                                "plotSize",
                                "unit",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="acres">Acres</option>
                            <option value="hectares">Hectares</option>
                            <option value="square meters">Square Meters</option>
                          </select>
                        </div>
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          min="1"
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="planned">Planned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Workers */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Workers
                        </label>
                        <input
                          type="number"
                          name="workers"
                          value={formData.workers}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          min="1"
                        />
                      </div>

                      {/* Weather Conditions */}
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          Weather Conditions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Temperature (°C)
                            </label>
                            <input
                              type="number"
                              value={formData.weatherConditions.temperature}
                              onChange={(e) =>
                                handleNestedChange(
                                  "weatherConditions",
                                  "temperature",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Humidity (%)
                            </label>
                            <input
                              type="number"
                              value={formData.weatherConditions.humidity}
                              onChange={(e) =>
                                handleNestedChange(
                                  "weatherConditions",
                                  "humidity",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Conditions
                            </label>
                            <select
                              value={formData.weatherConditions.conditions}
                              onChange={(e) =>
                                handleNestedChange(
                                  "weatherConditions",
                                  "conditions",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            >
                              <option value="sunny">Sunny</option>
                              <option value="cloudy">Cloudy</option>
                              <option value="rainy">Rainy</option>
                              <option value="windy">Windy</option>
                              <option value="stormy">Stormy</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          placeholder="Additional notes about the activity"
                          maxLength="500"
                        />
                      </div>

                      {/* Resources Used */}
                      <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-800">
                            Resources Used
                          </h3>
                          <button
                            type="button"
                            onClick={addResource}
                            className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                          >
                            <FiPlus className="mr-1" /> Add Resource
                          </button>
                        </div>

                        {formData.resourcesUsed.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No resources added
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {formData.resourcesUsed.map((resource, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
                              >
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Name
                                  </label>
                                  <input
                                    type="text"
                                    value={resource.name}
                                    onChange={(e) =>
                                      handleResourceChange(
                                        index,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                    placeholder="Resource name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Quantity
                                  </label>
                                  <input
                                    type="number"
                                    value={resource.quantity}
                                    onChange={(e) =>
                                      handleResourceChange(
                                        index,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Unit
                                  </label>
                                  <select
                                    value={resource.unit}
                                    onChange={(e) =>
                                      handleResourceChange(
                                        index,
                                        "unit",
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                  >
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                    <option value="L">L</option>
                                    <option value="mL">mL</option>
                                    <option value="bags">bags</option>
                                    <option value="units">units</option>
                                  </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                      Cost
                                    </label>
                                    <input
                                      type="number"
                                      value={resource.cost}
                                      onChange={(e) =>
                                        handleResourceChange(
                                          index,
                                          "cost",
                                          e.target.value
                                        )
                                      }
                                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeResource(index)}
                                    className="text-red-500 hover:text-red-700 p-2"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                      >
                        {currentActivity ? "Update Activity" : "Add Activity"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Activities List */}
          {activities.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">No activities recorded yet.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200 flex items-center mx-auto"
              >
                <FiPlus className="mr-2" />
                Add Your First Activity
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 capitalize">
                            {activity.activityType.replace("_", " ")}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {activity.status.replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {activity.crop}
                        </h3>
                        {activity.fieldLocation && (
                          <p className="text-gray-600 flex items-center mt-1">
                            <FiMapPin className="mr-1" />{" "}
                            {activity.fieldLocation}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(activity)}
                          className="text-green-600 hover:text-green-800 p-2"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(activity._id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Date
                          </h4>
                          <p className="text-gray-800 flex items-center">
                            <FiCalendar className="mr-2" />
                            {formatDate(activity.date)}
                          </p>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Plot Size
                          </h4>
                          <p className="text-gray-800">
                            {activity.plotSize.value} {activity.plotSize.unit}
                          </p>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Duration
                          </h4>
                          <p className="text-gray-800 flex items-center">
                            <FiClock className="mr-2" />
                            {formatDuration(activity.duration)}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Workers
                          </h4>
                          <p className="text-gray-800">
                            {activity.workers} people
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Weather Conditions
                        </h4>
                        <div className="flex items-center space-x-2 mb-2">
                          {getWeatherIcon(
                            activity.weatherConditions.conditions
                          )}
                          <span className="capitalize">
                            {activity.weatherConditions.conditions}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Temperature</p>
                            <p className="text-gray-800 flex items-center">
                              <FiThermometer className="mr-1" />
                              {activity.weatherConditions.temperature}°C
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Humidity</p>
                            <p className="text-gray-800 flex items-center">
                              <FiDroplet className="mr-1" />
                              {activity.weatherConditions.humidity}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {activity.resourcesUsed.length > 0 && (
                      <div className="mt-6">
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
                    )}

                    {activity.notes && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Notes
                        </h4>
                        <p className="text-gray-700">{activity.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ActivityManagement;
