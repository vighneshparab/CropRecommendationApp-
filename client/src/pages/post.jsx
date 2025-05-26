import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    sortBy: "newest",
    userId: "",
    page: 1,
    limit: 12, // Increased default limit for better grid layout
  });
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedPost, setExpandedPost] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "popular", label: "Most Popular" },
    { value: "comments", label: "Most Comments" },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        const response = await axios.get(
          `${BASE_URL}/community/posts?${queryParams.toString()}`
        );
        setPosts(response.data.posts);
        setTotalPosts(response.data.totalPosts);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch posts");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchPosts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, BASE_URL]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return postDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return postDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const renderAttachment = (attachment) => {
    if (!attachment) return null;

    const { url, fileType } = attachment;
    const isImage = fileType?.startsWith("image");
    const isVideo = fileType?.startsWith("video");

    if (isImage) {
      return (
        <div className="relative aspect-video overflow-hidden rounded-lg mb-3 bg-gray-100">
          <img
            src={url}
            alt="Post attachment"
            className="absolute inset-0 w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(url, "_blank")}
            loading="lazy"
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="relative aspect-video overflow-hidden rounded-lg mb-3 bg-gray-800">
          <video
            className="absolute inset-0 w-full h-full object-contain"
            controls
            preload="metadata"
          >
            <source src={url} type={fileType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return (
      <div className="flex items-center bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200">
        <span className="text-xl mr-3">📄</span>
        <div className="truncate">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline block truncate"
            title={attachment.originalName}
          >
            {attachment.originalName || "View Attachment"}
          </a>
          <span className="text-xs text-gray-500">
            {fileType?.split("/").pop()?.toUpperCase()}
          </span>
        </div>
      </div>
    );
  };

  const handleLike = async (postId) => {
    try {
      await axios.put(
        `${BASE_URL}/community/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Optimistic UI update
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes + 1,
                isLiked: true,
              }
            : post
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const toggleExpandPost = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  if (loading && !posts.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community posts...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-red-50 rounded-xl p-6 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Community Forum
              </h1>
              <p className="text-gray-600 mt-1">
                Connect with other farmers and share knowledge
              </p>
            </div>
            <button
              onClick={() => navigate("/community/posts/create")}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-md transition-all flex items-center whitespace-nowrap"
            >
              <svg
                className="w-5 h-5 mr-2 -ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Post
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative col-span-1 md:col-span-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={filters.search}
                  onChange={handleFilterChange}
                  name="search"
                />
              </div>

              {/* Category */}
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg bg-gray-50 px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg bg-gray-50 px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {(filters.page - 1) * filters.limit + 1}-
                {Math.min(filters.page * filters.limit, totalPosts)}
              </span>{" "}
              of <span className="font-medium">{totalPosts}</span> posts
            </p>
            {filters.search || filters.category ? (
              <button
                onClick={() =>
                  setFilters({ ...filters, search: "", category: "" })
                }
                className="text-sm text-green-600 hover:text-green-700 hover:underline flex items-center"
              >
                Clear filters
                <svg
                  className="w-4 h-4 ml-1"
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
            ) : null}
          </div>

          {/* Posts List */}
          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  {/* Post header */}
                  <div className="p-4 pb-0">
                    <div className="flex items-center mb-3">
                      <div
                        className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mr-3 cursor-pointer hover:bg-green-200 transition-colors"
                        onClick={() => navigate(`/profile/${post.userId?._id}`)}
                      >
                        {post.userId?.credentials?.name?.[0]?.toUpperCase() ||
                          "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium text-sm truncate hover:text-green-600 cursor-pointer"
                          onClick={() =>
                            navigate(`/profile/${post.userId?._id}`)
                          }
                        >
                          {post.userId?.credentials?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(post.createdAt)}
                          {post.isEdited && " • Edited"}
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 whitespace-nowrap border border-green-100">
                        {post.category}
                      </span>
                    </div>

                    {post.attachments?.length > 0 && (
                      <div className="mb-3">
                        {renderAttachment(post.attachments[0])}
                        {post.attachments.length > 1 && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{post.attachments.length - 1} more
                          </div>
                        )}
                      </div>
                    )}

                    <h3
                      className="text-lg font-semibold mb-2 hover:text-green-600 cursor-pointer line-clamp-2"
                      onClick={() => navigate(`/community/posts/${post._id}`)}
                    >
                      {post.title}
                    </h3>

                    <div
                      className={`text-sm text-gray-600 mb-3 ${
                        expandedPost === post._id ? "" : "line-clamp-3"
                      }`}
                      onClick={() => toggleExpandPost(post._id)}
                    >
                      {post.content}
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="px-4 pb-3">
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 px-2.5 py-1 rounded-full hover:bg-gray-200 text-gray-700 cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="bg-gray-100 px-2.5 py-1 rounded-full text-gray-500">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Post footer */}
                  <div className="mt-auto px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between text-gray-500 text-sm">
                      <button
                        className={`flex items-center space-x-1.5 px-2 py-1 rounded-md ${
                          post.isLiked
                            ? "text-red-500 bg-red-50"
                            : "hover:text-red-500 hover:bg-gray-100"
                        }`}
                        onClick={() => handleLike(post._id)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill={post.isLiked ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>{post.likes?.length || 0}</span>
                      </button>
                      <button
                        className="flex items-center space-x-1.5 px-2 py-1 rounded-md hover:text-blue-500 hover:bg-gray-100"
                        onClick={() => navigate(`/community/posts/${post._id}`)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span>{post.comments?.length || 0}</span>
                      </button>
                      <button
                        className="flex items-center space-x-1.5 px-2 py-1 rounded-md hover:text-gray-600 hover:bg-gray-100"
                        onClick={() => navigate(`/community/posts/${post._id}`)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>{post.viewCount || 0}</span>
                      </button>
                      <button
                        className="flex items-center space-x-1.5 px-2 py-1 rounded-md hover:text-green-600 hover:bg-gray-100"
                        onClick={() => navigate(`/community/posts/${post._id}`)}
                      >
                        <span>View</span>
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No posts found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/community/posts/create")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Create your first post
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between">
              <div className="hidden sm:block text-sm text-gray-700">
                Page <span className="font-medium">{filters.page}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </div>
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handlePageChange(Math.max(1, filters.page - 1))
                  }
                  disabled={filters.page === 1}
                  className="px-3.5 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (filters.page <= 3) {
                      pageNum = i + 1;
                    } else if (filters.page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = filters.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3.5 py-2 rounded-lg text-sm font-medium ${
                          filters.page === pageNum
                            ? "bg-green-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, filters.page + 1))
                  }
                  disabled={filters.page === totalPages}
                  className="px-3.5 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
                >
                  Next
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Floating Create Button (mobile) */}
        <button
          onClick={() => navigate("/community/posts/create")}
          className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 md:hidden flex items-center justify-center"
          aria-label="Create post"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="sr-only">Create Post</span>
        </button>
      </div>
      <Footer />
    </>
  );
};

export default Post;
