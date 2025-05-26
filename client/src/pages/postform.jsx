import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const PostForm = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPost, setCurrentPost] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [removedAttachments, setRemovedAttachments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const categories = [
    "General",
    "Crop Help",
    "Soil Issues",
    "Weather Discussion",
    "Market Updates",
    "Pest Control",
    "Irrigation",
    "Equipment",
    "Success Stories",
  ];

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch user's posts
  const fetchPostForm = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/community/posts/mine`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts(response.data.posts);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages,
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch your posts");
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Handle input changes for form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  // Remove selected file
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing attachment
  const removeExistingAttachment = (attachmentId) => {
    setExistingAttachments((prev) =>
      prev.filter((a) => a._id !== attachmentId)
    );
    setRemovedAttachments((prev) => [...prev, attachmentId]);
  };

  // Initialize form for creating new post
  const initCreateForm = () => {
    setCurrentPost({
      title: "",
      content: "",
      category: "General",
      tags: "",
    });
    setFiles([]);
    setShowForm(true);
  };

  // Initialize form for editing post
  const initEditForm = (post) => {
    setCurrentPost({
      ...post,
      tags: post.tags.join(", "),
    });
    setExistingAttachments(post.attachments || []);
    setFiles([]);
    setRemovedAttachments([]);
    setShowForm(true);
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", currentPost.title);
      formData.append("content", currentPost.content);
      formData.append("category", currentPost.category);
      formData.append("tags", currentPost.tags);

      files.forEach((file) => {
        formData.append("attachments", file);
      });

      if (currentPost._id) {
        // Update existing post
        if (removedAttachments.length > 0) {
          formData.append(
            "removedAttachments",
            JSON.stringify(removedAttachments)
          );
        }

        await axios.put(
          `${BASE_URL}/community/posts/${currentPost._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Create new post
        await axios.post(`${BASE_URL}/community/posts`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setShowForm(false);
      fetchPostForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  // Delete a post
  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`${BASE_URL}/community/posts/${postId}`, config);
        fetchPostForm();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete post");
      }
    }
  };

  // View post details
  const viewPost = (postId) => {
    navigate(`/community/posts/${postId}`);
  };

  useEffect(() => {
    fetchPostForm();
  }, [pagination.page]);

  if (loading && !showForm) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
        role="alert"
      >
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={fetchPostForm}
          className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">My Posts</h1>
          <button
            onClick={initCreateForm}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Create New Post
          </button>
        </div>

        {/* Post Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-green-800">
                    {currentPost._id ? "Edit Post" : "Create Post"}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={currentPost.title}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-gray-300 p-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content*
                    </label>
                    <textarea
                      name="content"
                      value={currentPost.content}
                      onChange={handleInputChange}
                      required
                      rows={8}
                      className="w-full rounded-md border border-gray-300 p-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        value={currentPost.category}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-green-500 focus:border-green-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={currentPost.tags}
                        onChange={handleInputChange}
                        placeholder="Separate tags with commas"
                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  {/* Existing Attachments */}
                  {existingAttachments.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Attachments
                      </label>
                      <div className="space-y-2">
                        {existingAttachments.map((attachment) => (
                          <div
                            key={attachment._id}
                            className="flex items-center justify-between bg-gray-100 p-2 rounded"
                          >
                            <div className="flex items-center">
                              <span className="mr-2">
                                {attachment.fileType === "image"
                                  ? "📷"
                                  : attachment.fileType === "video"
                                  ? "🎥"
                                  : "📄"}
                              </span>
                              <span>{attachment.originalName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeExistingAttachment(attachment._id)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Attachments */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Attachments
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-50 file:text-green-700
                      hover:file:bg-green-100"
                    />
                    {files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-100 p-2 rounded"
                          >
                            <span>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 rounded-md text-white ${
                        loading
                          ? "bg-green-400"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {loading ? "Saving..." : "Save Post"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">You haven't created any posts yet.</p>
            <button
              onClick={initCreateForm}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <li key={post._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {post.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            {moment(post.createdAt).format("MMM D, YYYY")}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {post.content}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => viewPost(post._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          View
                        </button>
                        <button
                          onClick={() => initEditForm(post)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-2 rounded-l-md border ${
                      pagination.page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border-t border-b ${
                        page === pagination.page
                          ? "bg-green-50 text-green-600 border-green-500"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`px-3 py-2 rounded-r-md border ${
                      pagination.page === pagination.totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PostForm;
