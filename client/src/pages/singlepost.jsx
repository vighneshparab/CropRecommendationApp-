import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const SinglePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    post: null,
    comment: "",
    isLiked: false,
    likeCount: 0,
    isLoading: true,
    error: null,
    relatedPosts: [],
    relatedLoading: false,
    relatedError: null,
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getResourceUrl = useCallback(
    (path) => {
      if (!path) return "";
      if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
      }
      return `${BASE_URL}${path}`;
    },
    [BASE_URL]
  );

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  // Function to generate random color based on user initials
  const getAvatarColor = (initials) => {
    const colors = [
      "bg-green-600",
      "bg-blue-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-red-600",
      "bg-yellow-600",
      "bg-indigo-600",
      "bg-teal-600",
    ];
    const charCode = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
    return colors[charCode % colors.length];
  };

  const fetchPost = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data } = await axios.get(`${BASE_URL}/community/posts/${id}`);

      const processAttachments = (attachments) =>
        attachments?.map((att) => ({
          ...att,
          url: getResourceUrl(att.url),
          isImage:
            att.fileType?.startsWith("image/") ||
            ["jpg", "jpeg", "png", "gif"].some((ext) =>
              att.originalName.toLowerCase().endsWith(ext)
            ),
        })) || [];

      const processedPost = {
        ...data.post,
        attachments: processAttachments(data.post.attachments),
        comments:
          data.post.comments?.map((comment) => ({
            ...comment,
            attachments: processAttachments(comment.attachments),
            userInitials: getInitials(comment.userId?.credentials?.name),
            userColor: getAvatarColor(
              getInitials(comment.userId?.credentials?.name)
            ),
          })) || [],
        userInitials: getInitials(data.post.userId?.credentials?.name),
        userColor: getAvatarColor(
          getInitials(data.post.userId?.credentials?.name)
        ),
      };

      setState((prev) => ({
        ...prev,
        post: processedPost,
        isLiked: data.post.likes?.some((user) => user._id === userId) || false,
        likeCount: data.post.likes?.length || 0,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err.response?.data?.message ||
          "Failed to load the post. Please try again later.",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [BASE_URL, id, getResourceUrl, userId]);

  const fetchRelatedPosts = useCallback(async () => {
    if (!state.post?.category) return;

    setState((prev) => ({ ...prev, relatedLoading: true, relatedError: null }));

    try {
      const response = await axios.get(`${BASE_URL}/community/posts`, {
        params: {
          category: state.post.category,
          limit: 3,
          exclude: id,
        },
      });

      const processedPosts = response.data.posts.map((post) => ({
        ...post,
        attachments:
          post.attachments?.map((att) => ({
            ...att,
            url: getResourceUrl(att.url),
            isImage:
              att.fileType?.startsWith("image/") ||
              ["jpg", "jpeg", "png", "gif"].some((ext) =>
                att.originalName.toLowerCase().endsWith(ext)
              ),
          })) || [],
      }));

      setState((prev) => ({
        ...prev,
        relatedPosts: processedPosts,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        relatedError:
          err.response?.data?.message || "Failed to load related posts",
      }));
    } finally {
      setState((prev) => ({ ...prev, relatedLoading: false }));
    }
  }, [BASE_URL, id, getResourceUrl, state.post?.category]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    if (state.post) {
      fetchRelatedPosts();
    }
  }, [state.post, fetchRelatedPosts]);

  const handleLike = async () => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/community/posts/${id}/like`,
        {},
        config
      );
      setState((prev) => ({
        ...prev,
        isLiked: data.isLiked,
        likeCount: data.likeCount,
      }));
    } catch (err) {
      console.error("Failed to like/unlike post:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!state.comment.trim()) return;

    try {
      await axios.post(
        `${BASE_URL}/community/posts/${id}/comments`,
        { content: state.comment },
        config
      );
      setState((prev) => ({ ...prev, comment: "" }));
      fetchPost();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-green-700 font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-red-50 rounded-lg border border-red-200 text-center">
        <h2 className="text-xl text-red-700 font-semibold">Oops!</h2>
        <p className="mt-2 text-red-600">{state.error}</p>
        <button
          onClick={fetchPost}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!state.post) return null;

  return (
    <>
      <Navbar className="sticky top-0 z-50" />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  {state.post.userId?.profile?.picture ? (
                    <img
                      src={getResourceUrl(state.post.userId.profile.picture)}
                      alt="Author"
                      className="w-12 h-12 rounded-full border-2 border-white mr-4 object-cover shadow-md"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentNode.innerHTML = `
                          <div class="w-12 h-12 rounded-full border-2 border-white mr-4 flex items-center justify-center ${state.post.userColor} text-white font-bold text-lg">
                            ${state.post.userInitials}
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full border-2 border-white mr-4 flex items-center justify-center ${state.post.userColor} text-white font-bold text-lg`}
                    >
                      {state.post.userInitials}
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-green-100">Posted by</h4>
                    <h3 className="text-lg font-bold">
                      {state.post.userId?.credentials?.name || "Unknown User"}
                    </h3>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
                  {state.post.title}
                </h1>

                <div className="flex flex-wrap gap-2 mt-2">
                  {state.post.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-green-700 text-white text-xs px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <p className="text-green-100 mt-2">
                  {moment(state.post.createdAt).format("MMMM D, YYYY • h:mm A")}
                  {state.post.isEdited && (
                    <span className="ml-2 text-green-200">(edited)</span>
                  )}
                </p>
              </div>

              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition font-medium ${
                    state.isLiked
                      ? "bg-white text-green-700 shadow-lg hover:bg-green-50"
                      : "bg-green-700 text-white border border-green-500 hover:bg-green-800"
                  }`}
                  aria-label={state.isLiked ? "Unlike post" : "Like post"}
                >
                  <span>{state.isLiked ? "❤️" : "🤍"}</span>
                  <span>{state.isLiked ? "Liked" : "Like"}</span>
                  <span className="font-bold ml-1">({state.likeCount})</span>
                </button>

                <a
                  href="#comments"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-700 text-white hover:bg-green-600 transition font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  <span>Comments ({state.post.comments?.length || 0})</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
          {/* Left Column - Post Content */}
          <div className="w-full lg:w-2/3">
            <article className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Featured Image */}
              {state.post.attachments?.length > 0 && (
                <figure className="w-full h-96 md:h-[500px] relative">
                  <img
                    src={state.post.attachments[0].url}
                    alt={state.post.attachments[0].originalName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                  <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <p className="text-white text-sm">
                      Featured Image: {state.post.attachments[0].originalName}
                    </p>
                  </figcaption>
                </figure>
              )}

              {/* Post Content */}
              <div className="p-6 md:p-10">
                <div className="prose max-w-none text-gray-700 lg:text-lg">
                  <p className="whitespace-pre-line leading-relaxed mb-8">
                    {state.post.content}
                  </p>
                </div>

                {/* Additional Attachments */}
                {state?.post?.attachments?.length > 1 && (
                  <section className="mt-10 border-t border-gray-100 pt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      More Attachments
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {state.post.attachments.slice(1).map((att, i) => (
                        <div
                          key={i}
                          className="rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition group"
                        >
                          {att.isImage ? (
                            <div className="relative h-56 overflow-hidden">
                              <img
                                src={att.url}
                                alt={att.originalName}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/placeholder-image.png";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
                                >
                                  View Full Image
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 bg-gray-50 flex items-center group-hover:bg-green-50 transition">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-green-600 mr-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <div>
                                <p className="text-gray-500 text-sm mb-1">
                                  Attachment
                                </p>
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 font-medium hover:underline text-lg"
                                >
                                  {att.originalName}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Post Stats */}
                <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between">
                  <div className="flex gap-6 items-center mb-4 md:mb-0">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
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
                      <span className="text-sm font-medium">
                        {state.post.viewCount || 0} views
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium">
                        Posted{" "}
                        {moment(state.post.createdAt).format("MMM D, YYYY")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Right Column - Comments Section */}
          <div className="w-full lg:w-1/3" id="comments">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-100 to-white flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">
                    Comments ({state.post.comments?.length || 0})
                  </h3>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {state.post.comments?.length > 0
                      ? "Active discussion"
                      : "No comments yet"}
                  </span>
                </div>

                {/* Scrollable Comments Container */}
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {state.post.comments?.length === 0 ? (
                    <div className="p-10 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-700 mb-2">
                        No comments yet
                      </h4>
                      <p className="text-gray-500 mb-6">
                        Be the first to start the conversation!
                      </p>
                      <a
                        href="#comment-form"
                        className="text-green-600 font-medium hover:text-green-700"
                      >
                        Add your comment &darr;
                      </a>
                    </div>
                  ) : (
                    state.post.comments?.map((cmt, idx) => (
                      <div
                        key={idx}
                        className="p-6 hover:bg-gray-50 transition animate-fadeIn"
                      >
                        <div className="flex items-start">
                          {cmt.userId?.profile?.picture ? (
                            <img
                              src={getResourceUrl(cmt.userId.profile.picture)}
                              alt="avatar"
                              className="w-10 h-10 rounded-full mr-4 object-cover border-2 border-green-100"
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.parentNode.innerHTML = `
                                  <div class="w-10 h-10 rounded-full mr-4 flex items-center justify-center ${cmt.userColor} text-white font-medium text-sm border-2 border-green-100">
                                    ${cmt.userInitials}
                                  </div>
                                `;
                              }}
                            />
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-full mr-4 flex items-center justify-center ${cmt.userColor} text-white font-medium text-sm border-2 border-green-100`}
                            >
                              {cmt.userInitials}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="mb-1 flex justify-between items-center">
                              <h4 className="font-semibold text-gray-800">
                                {cmt.userId?.credentials?.name || "Anonymous"}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {moment(cmt.createdAt).fromNow()}
                                {cmt.isEdited && (
                                  <span className="ml-1 text-gray-400">
                                    (edited)
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                              <p className="text-gray-700">{cmt.content}</p>
                            </div>

                            {/* Comment Attachments */}
                            {cmt.attachments?.length > 0 && (
                              <div className="mt-3 grid grid-cols-1 gap-2">
                                {cmt.attachments.map((att, i) => (
                                  <div
                                    key={i}
                                    className="overflow-hidden rounded-md shadow-sm border border-gray-200 hover:border-green-300 transition"
                                  >
                                    {att.isImage ? (
                                      <div className="relative group">
                                        <img
                                          src={att.url}
                                          alt="attachment"
                                          className="w-full h-32 object-cover"
                                          loading="lazy"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                              "/placeholder-image.png";
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                          <a
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm"
                                          >
                                            View Image
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-3 bg-green-50 border border-green-100 rounded-md hover:bg-green-100 transition">
                                        <a
                                          href={att.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-green-600 hover:underline flex items-center"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 mr-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                          </svg>
                                          {att.originalName}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-2 flex gap-4">
                              <button className="text-xs text-gray-500 hover:text-green-600 transition">
                                Reply
                              </button>
                              <button className="text-xs text-gray-500 hover:text-green-600 transition">
                                Like
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment */}
                <div
                  id="comment-form"
                  className="p-6 bg-green-50 border-t border-green-100"
                >
                  <div className="flex items-center mb-4">
                    {token ? (
                      <>
                        {localStorage.getItem("userPicture") ? (
                          <img
                            src={getResourceUrl(
                              localStorage.getItem("userPicture")
                            )}
                            alt="Your avatar"
                            className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              const initials = getInitials(
                                localStorage.getItem("userName")
                              );
                              const color = getAvatarColor(initials);
                              e.target.parentNode.innerHTML = `
                                <div class="w-10 h-10 rounded-full mr-3 flex items-center justify-center ${color} text-white font-medium text-sm border-2 border-white shadow-sm">
                                  ${initials}
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${getAvatarColor(
                              getInitials(localStorage.getItem("userName"))
                            )} text-white font-medium text-sm border-2 border-white shadow-sm`}
                          >
                            {getInitials(localStorage.getItem("userName"))}
                          </div>
                        )}
                        <h4 className="font-medium text-gray-800">
                          Add your comment
                        </h4>
                      </>
                    ) : (
                      <h4 className="font-medium text-gray-800">
                        Sign in to join the conversation
                      </h4>
                    )}
                  </div>
                  <form onSubmit={handleCommentSubmit}>
                    <textarea
                      rows="4"
                      name="comment"
                      className="w-full border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition shadow-sm"
                      placeholder="Share your thoughts..."
                      value={state.comment}
                      onChange={handleChange}
                      disabled={!token}
                    ></textarea>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {token
                          ? "Be respectful and thoughtful in your comment"
                          : "Please sign in to comment"}
                      </div>
                      <button
                        type="submit"
                        disabled={!state.comment.trim() || !token}
                        className={`px-6 py-2.5 rounded-lg font-medium transition ${
                          state.comment.trim() && token
                            ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Post Comment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts Suggestion */}
        {state.post.category && (
          <section className="bg-gray-50 py-12 mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                More in {state.post.category}
              </h2>

              {state.relatedLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                </div>
              ) : state.relatedError ? (
                <div className="text-center text-red-500">
                  {state.relatedError}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {state.relatedPosts.map((relatedPost) => (
                    <article
                      key={relatedPost._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                      onClick={() =>
                        navigate(`/community/posts/${relatedPost._id}`)
                      }
                    >
                      {relatedPost.attachments?.length > 0 && (
                        <figure className="h-48 bg-gray-200 overflow-hidden">
                          <img
                            src={relatedPost.attachments[0].url}
                            alt={relatedPost.attachments[0].originalName}
                            className="w-full h-full object-cover hover:scale-105 transition duration-300"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-image.png";
                            }}
                          />
                        </figure>
                      )}
                      <div className="p-5">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {relatedPost.content?.substring(0, 100)}...
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {moment(relatedPost.createdAt).fromNow()}
                          </span>
                          <span className="text-green-600 text-sm font-medium hover:text-green-700">
                            Read more
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <Footer className="bg-gray-800 text-white" />
    </>
  );
};

export default React.memo(SinglePost);
