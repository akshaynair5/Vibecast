import { useContext, useEffect, useState } from 'react';
import '../App.css'
import logout from '../services/logout';
import axiosInstance from '../services/axiosInstance';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';
import MusicPlayer from '../components/currentPlayer';
import { Authcontext } from '../contextProvider';
import AudioCard from '../components/audioCard';
import StreamCard from '../components/liveAudioCard';
import Select from "react-select";
import { Mic, PlusCircle, XCircle, Upload, Pencil } from "lucide-react";
import Subscribers from '../components/subscriberFormatter';
import defaultCoverImage from '../assets/default-cover.png'
import defaultAvatar from '../assets/default-avatar.jpg' 
import { desc } from 'framer-motion/client';
import { set } from 'date-fns';

function Profile() {
    const {currentUser, setCurrentUser, currentAudio, setCurrentLiveStream} = useContext(Authcontext)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [userAudioData, setUserAudioData] = useState([]);
    const [liveStreams, setLiveStreams] = useState([]);
    const [userProfileData, setUserProfileData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAvatarImage, setSelectedAvatarImage] = useState(null);
    const [previewProfileImage, setPreviewProfileImage] = useState(currentUser.avatar);
    const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
    const [selectedCoverImage, setSelectedCoverImage] = useState(null);
    const [previewCoverImage, setPreviewCoverImage] = useState(currentUser.coverImage);
    const [uploading, setUploading] = useState(false);
    const [errorImageUpload, setErrorImageUpload] = useState("");
    const [success, setSuccess] = useState("");
    const [showAddPodcastModal, setShowAddPodcastModal] = useState(false);
    const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
    const [editedUserDetails, setEditedUserDetails] = useState({
      fullName: currentUser.fullName,
      username: currentUser.username,
      description: currentUser.description || "",
    })
    const [userNameError, setUserNameError] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [formData, setFormData] = useState({
      video: "",
      thumbnail: "",
      title: "",
      description: "",
      duration: "",
      topic:"",
      isPublished: false,
    });

    const topics = [
      { value: "Arts & Culture", label: "Arts & Culture" },
      { value: "Comedy", label: "Comedy" },
      { value: "Education", label: "Education" },
      { value: "Health & Wellness", label: "Health & Wellness" },
      { value: "News & Politics", label: "News & Politics" },
      { value: "Science & Technology", label: "Science & Technology" },
      { value: "Society & Culture", label: "Society & Culture" },
      { value: "Music", label: "Music" },
      { value: "True Crime", label: "True Crime" },
      { value: "History", label: "History" },
      { value: "Sports", label: "Sports" },
      { value: "Travel & Places", label: "Travel & Places" },
    ];

    useEffect(() => {
      const checkScreenSize = () => {
        if (window.innerWidth <= 768) {
          setIsMobile(true);
        } else {
          setIsMobile(false);
        }
      };
    
      window.addEventListener('resize', checkScreenSize);
      checkScreenSize(); // Check screen size on initial load
    
      return () => window.removeEventListener('resize', checkScreenSize);
    }, []);  

    const [isOpen, setIsOpen] = useState(false);
    const [formDataLiveStream, setFormDataLiveStream] = useState({
      title: "",
      description: "",
      thumbnail: "",
    });
  
    const handleLiveStreamInputChange = (e) => {
      const { name, value } = e.target;
      setFormDataLiveStream((prev) => ({ ...prev, [name]: value }));
    };

    const handleLiveFileChange = (e) => {
      const { name } = e.target;
      setFormDataLiveStream((prevData) => ({
        ...prevData,
        [name]: e.target.files[0], // Store file object
      }));
    };
  
    const handleLiveStreamSubmit = async (e) => {
      e.preventDefault();
      // Call your function here
      const data = new FormData();
      data.append("title", formDataLiveStream.title);
      data.append("description", formDataLiveStream.description);
      data.append("thumbnail", formDataLiveStream.thumbnail);
      try{
        const response = await axiosInstance.post(
          "/stream/",
          data
        );
        console.log(response.data)
        setCurrentLiveStream(response.data.data);
        setFormDataLiveStream({
          title: "",
          description: "",
          thumbnail: "",
        })
      }
      catch(err){
        console.log(err)
      }
      // Example: startLivePodcast(formData);
      setIsOpen(false); // Close the popup after submission
    };

    useEffect(()=>{
       const fetchUserProfileData = async ()=>{
            try{
                const result = await axiosInstance.get(`/users/c/${currentUser.username}`)
                console.log(result.data)
                setUserProfileData(result.data.message[0]);
                setUserAudioData(result.data.message[0].videos);
                setLiveStreams(result.data.message[0].liveStreams);
            }
            catch(err){
                console.log(err)
            }
        }
        fetchUserProfileData();
    },[])

    const onAudioUpdate = async (updatedInfo, videoId) => {
        try {
          const response = await axiosInstance.patch(`/video/${videoId}`, updatedInfo);
          console.log("Video updated successfully:", response.data);
      
          // Update the UI or state if necessary
          // Example: Refresh the list of videos or update the specific video in state
        } catch (error) {
          console.error("Error updating video:", error.response?.data || error.message);
          alert("Failed to update video. Please try again.");
        }
      };
    
      const onAudioDelete = async (videoId) => {
        // if (!window.confirm("Are you sure you want to delete this video?")) return;
      
        try {
          const response = await axiosInstance.delete(`/video/${videoId}`);
          console.log("Video deleted successfully:", response.data);
      
          // Update the UI or state if necessary
          // Example: Remove the deleted video from the list
        } catch (error) {
          console.error("Error deleting video:", error.response?.data || error.message);
          alert("Failed to delete video. Please try again.");
        }
      };

      
    const onLiveAudioUpdate = async (updatedInfo, streamId) => {
      try {
        const response = await axiosInstance.patch(`/stream/${streamId}/update`, updatedInfo);
        console.log("Video updated successfully:", response.data);
    
        // Update the UI or state if necessary
        // Example: Refresh the list of videos or update the specific video in state
      } catch (error) {
        console.error("Error updating video:", error.response?.data || error.message);
        alert("Failed to update video. Please try again.");
      }
    };
  
    const onLiveAudioDelete = async (streamId) => {
      // if (!window.confirm("Are you sure you want to delete this video?")) return;
    
      try {
        const response = await axiosInstance.delete(`/stream/${streamId}`);
        console.log("Video deleted successfully:", response.data);
    
        // Update the UI or state if necessary
        // Example: Remove the deleted video from the list
      } catch (error) {
        console.error("Error deleting video:", error.response?.data || error.message);
        alert("Failed to delete video. Please try again.");
      }
    };
    
    const handleEditedInput = (e) => {
      const { name, value } = e.target;
      setEditedUserDetails((prev) => ({...prev, [name]: value}));
    }

    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      }));
    };
    
    const handleFileChange = (e) => {
      const { name } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: e.target.files[0], // Store file object
      }));
    };

    const handleTopicChange = (selectedOptions) => {
      // Update the topics in the formData state
      setFormData({ ...formData, topics: selectedOptions });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }
  
      try {
        const response = await axiosInstance.post(
          `/video/`,
          formDataToSend
        );
        console.log("Podcast added:", response.data);
        setShowAddPodcastModal(false); // Close modal on success
      } catch (error) {
        console.error("Error adding podcast:", error);
      }
    };
  
    // Handle file selection
    const handleAvatarChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setSelectedAvatarImage(file);
        const reader = new FileReader();
        reader.onload = () => setPreviewProfileImage(reader.result);
        reader.readAsDataURL(file);
      }
    };
    
    const handleCoverFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          setSelectedCoverImage(file);
          const reader = new FileReader();
          reader.onload = () => setPreviewCoverImage(reader.result);
          reader.readAsDataURL(file);
        }
    };
  
    // Handle save action
    const handleAvatarSave = async () => {
        if (!selectedAvatarImage) {
            setErrorImageUpload("Please select an image to upload.");
            return;
          }
      
          setUploading(true);
          setErrorImageUpload("");
          setSuccess("");
      
          try {
            const formData = new FormData();
            formData.append("avatar", selectedAvatarImage);
      
            const response = await axiosInstance.patch(
              "/users/upload-avatar", // Your backend route for updating avatar
              formData
            );
      
            if (response.data) {
              setSuccess("Avatar updated successfully!");
              setPreviewProfileImage(response.data.data.avatar); // Update preview with the new avatar
              setCurrentUser((prevUser) => ({...prevUser, avatar: response.data.data.avatar}))
            }
          } catch (err) {
            setErrorImageUpload(
              err.response?.data?.message || "An error occurred while uploading."
            );
            console.log(err)
          } finally {
            setUploading(false);
            // setIsModalOpen(false);
          }
    };
    
    // Handle save action for cover image
    const handleCoverSave = async () => {
        if (!selectedCoverImage) {
            setErrorImageUpload("Please select an image to upload.");
            return;
          }
      
          setUploading(true);
          setErrorImageUpload("");
          setSuccess("");
      
          try {
            const formData = new FormData();
            formData.append("coverImage", selectedCoverImage);
      
            const response = await axiosInstance.patch(
              "/users/upload-cover-image", // Your backend route for updating avatar
              formData
            );
      
            if (response.data) {
              setSuccess("Cover Image updated successfully!");
              setPreviewCoverImage(response.data.data.avatar); // Update preview with the new avatar
              setCurrentUser((prevUser) => ({...prevUser, coverImage: response.data.data.coverImage})) // Update current user with new cover image
            }
          } catch (err) {
            setErrorImageUpload(
              err.response?.data?.message || "An error occurred while uploading."
            );
          } finally {
            setUploading(false);
            // setIsCoverModalOpen(false);
          }
    };

    const handleUserDetailsEdit = async (e) =>{
      e.preventDefault();

      setUserNameError(false);
      const updateData = {
        fullName: editedUserDetails.fullName,
        username: editedUserDetails.username,
        description: editedUserDetails.description,
      };

      try{
        const res = await axiosInstance.post('/users/check', updateData);

        if(res.data.data.isAvailable === false && updateData.username !== currentUser.username){
          setUserNameError(true);
          return;
        }
        const response = await axiosInstance.patch(`/users/update-user-details`, updateData);
        setCurrentUser((prev) => ({...prev, ...updateData}));
        setShowEditDetailsModal(false);
      }
      catch(err){
        console.log(err)
      }
    }

  return (
    <div className='fixed top-0 left-0 w-screen h-screen overflow-y-scroll scrollbar-thin scrollbar-thumb-scrollbar scrollbar-track-transparent z-10'
      style={{
        backgroundImage: `
          radial-gradient(circle at 30% 70%, rgba(255,255,255,0.06), transparent 35%),
          radial-gradient(circle at 70% 30%, rgba(255,255,255,0.04), transparent 30%),
          radial-gradient(circle at 90% 90%, rgba(255,255,255,0.03), transparent 25%),
          linear-gradient(to bottom, #1a1a1a, #141414, #0f0f0f, #0a0a0a, #000000)
        `,
        backgroundBlendMode: "overlay"
      }}
    >
      <Navbar/>
      <Sidebar/>

     <div className="min-h-screen bg-transparent text-white container mx-auto px-4">
      {/* Cover Image Section */}
      <div className="relative w-full h-64 bg-transparent">
      {/* Cover Image */}
      <img
        src={previewCoverImage ? previewCoverImage : defaultCoverImage}
        alt="Cover"
        className="object-cover w-full h-full rounded-lg cursor-pointer z-0 opacity-50"
        onClick={() => setIsCoverModalOpen(true)} // Open modal on click
      />

      {/* User Name */}
      <div className="absolute bottom-4 left-4 text-white">
        <h2 className="text-3xl font-semibold ml-4 text-white">
          @{currentUser.username}
        </h2>
      </div>

      {/* Modal for Editing Cover Image */}
      {isCoverModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-900 text-white rounded-lg p-6 max-w-md w-full shadow-lg">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Cover Image</h3>
                <button onClick={() => { setErrorImageUpload(""); setSuccess(""); setIsCoverModalOpen(false); }}>
                  <XCircle size={22} className="text-gray-400 hover:text-gray-300 transition" />
                </button>
              </div>

              {/* Cover Image Preview */}
              {previewCoverImage && (
                <div className="mb-4">
                  <img
                    src={previewCoverImage ? previewCoverImage : defaultCoverImage}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg border border-gray-700 shadow-md"
                  />
                </div>
              )}

              {/* File Input for Cover Image */}
              <label className="block w-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverFileChange}
                />
                <div className="flex items-center justify-center w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition">
                  <Upload size={18} className="mr-2" /> Choose Image
                </div>
              </label>

              {/* Error or Success Message */}
              {errorImageUpload && <p className="text-red-400 text-sm mt-2">{errorImageUpload}</p>}
              {success && <p className="text-green-400 text-sm mt-2">{success}</p>}

              {/* Buttons */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => { setErrorImageUpload(""); setSuccess(""); setIsCoverModalOpen(false); }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition w-40"
                >
                  Close
                </button>

                <button
                  onClick={handleCoverSave}
                  disabled={uploading}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-bold ${
                    uploading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 transition w-60"
                  }`}
                >
                  {uploading ? "Uploading..." : <><Upload size={18} /> Upload</>}
                </button>
              </div>
            </div>
          </div>
        )}

    </div>

      {/* User Info Section */}
    <div className="max-w-7xl mx-auto px-4 py-8 bg-transparent text-white">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
        {/* Profile Picture */}
        <div className="flex justify-center md:justify-start w-full md:w-auto mb-4 md:mb-0">
          <img
            src={previewProfileImage ? previewProfileImage : defaultAvatar}
            alt="Profile"
            className="w-36 h-36 rounded-full border-4 border-white shadow-lg cursor-pointer"
            onClick={() => setIsModalOpen(true)} // Open modal on click
          />
        </div>


        {/* User Info */}

        <div className="flex flex-col items-center text-center space-y-3 p-4 bg-transparent rounded-xl w-full sm:w-[80%] mx-auto">
          <div className='flex col-2 gap-1 items-center'>
            <h2 className="text-2xl font-semibold text-white">{currentUser.fullName}</h2>
            <button
              onClick={() => setShowEditDetailsModal(true)}
              className=" ml-[1vw] flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white shadow-md transition-all duration-200"
            >
              <Pencil size={16} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>

          {/* Subscriber count */}
          <Subscribers subscribers={currentUser.subscribersCount} />

          <p className="text-sm text-gray-400">{currentUser.description ? currentUser.description : "No description available."}</p>

          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 bg-gray-800 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              onClick={() => setShowAddPodcastModal(true)}
            >
              <PlusCircle size={18} /> Add Podcast
            </button>

            <button
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition"
              onClick={() => setIsOpen(true)}
            >
              <Mic size={18} /> Start Live Podcast
            </button>
          </div>


          {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-gray-900 text-white rounded-lg shadow-lg w-96 p-6 relative">
                
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-300 transition"
                >
                  <XCircle size={22} />
                </button>

                {/* Title */}
                <h2 className="text-lg font-semibold mb-4 text-center">🎙️ Start a Live Podcast</h2>

                {/* Form */}
                <form onSubmit={handleLiveStreamSubmit} className="space-y-4">
                  
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formDataLiveStream.title}
                      onChange={handleLiveStreamInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea
                      name="description"
                      value={formDataLiveStream.description}
                      onChange={handleLiveStreamInputChange}
                      rows="3"
                      className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                      required
                    ></textarea>
                  </div>

                  {/* Thumbnail Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Thumbnail</label>
                    <label className="block w-full cursor-pointer mt-1">
                      <input
                        type="file"
                        accept="image/*"
                        name="thumbnail"
                        onChange={handleLiveFileChange}
                        className="hidden"
                        required
                      />
                      <div className="flex items-center justify-center w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition">
                        <Upload size={18} className="mr-2" /> Choose Image
                      </div>
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition w-40"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition flex items-center gap-2 w-40"
                    >
                      🎤 Start Podcast
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {
        showEditDetailsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-gray-900 text-white rounded-lg shadow-lg w-96 p-6">
                <h2 className="text-lg font-semibold text-gray-100 mb-4">Edit Profile</h2>
                <form onSubmit={handleUserDetailsEdit} className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={editedUserDetails.fullName}
                      onChange={handleEditedInput}
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editedUserDetails.username}
                      onChange={handleEditedInput}
                      className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                        border ${userNameError ? 'border-red-500' : 'border-gray-600'}`}
                      required
                    />
                    {userNameError && (
                      <p className="mt-1 text-sm text-red-500">This username is already taken</p>
                    )}
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Profile Description</label>
                    <textarea
                      name="description"
                      value={editedUserDetails.description}
                      onChange={handleEditedInput}
                      rows="3"
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                      required
                    ></textarea>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg w-40"
                      onClick={() => setShowEditDetailsModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-40"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )
      }

      {showAddPodcastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Add Podcast</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
              </div>

              {/* Topics Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300">Topics</label>
                <Select
                  options={topics}
                  isMulti
                  value={formData.topics}
                  onChange={handleTopicChange}
                  className="mt-1 text-black bg-gray-800"
                  placeholder="Select or type to search topics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Audio File</label>
                <label className="block w-full cursor-pointer mt-1">
                  <input
                    type="file"
                    accept="audio/*"
                    name="video"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <div className="flex items-center justify-center w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition">
                    <Upload size={18} className="mr-2" /> Choose Image
                  </div>
                </label>
              </div>

              {/* Thumbnail Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300">Thumbnail</label>
                <label className="block w-full cursor-pointer mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    name="thumbnail"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <div className="flex items-center justify-center w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition">
                    <Upload size={18} className="mr-2" /> Choose Image
                  </div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg w-40"
                  onClick={() => setShowAddPodcastModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-40"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Modal */}
    
    {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-gray-900 text-white rounded-lg shadow-lg w-96 p-6">

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit Profile Image</h3>
            <button onClick={() => { setErrorImageUpload(""); setSuccess(""); setIsModalOpen(false); }}>
              <XCircle size={22} className="text-gray-400 hover:text-gray-300 transition" />
            </button>
          </div>

          {/* Image Preview */}
          <div className="mb-4 flex justify-center">
            {previewProfileImage && (
              <img
                src={previewProfileImage}
                alt="Preview"
                className="w-36 h-36 rounded-full border-2 border-gray-500 shadow-lg"
              />
            )}
          </div>

          {/* File Input */}
          <label className="block w-full cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div className="flex items-center justify-center w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition">
              <Upload size={18} className="mr-2" /> Choose Image
            </div>
          </label>

          {/* Error or Success Message */}
          {errorImageUpload && <p className="text-red-400 text-sm mt-2">{errorImageUpload}</p>}
          {success && <p className="text-green-400 text-sm mt-2">{success}</p>}

          {/* Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                setErrorImageUpload("");
                setSuccess("");
                setIsModalOpen(false);
              }}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 w-20"
            >
              Close
            </button>

            {/* Upload Button */}
            <button
              onClick={handleAvatarSave}
              disabled={uploading}
              className={`px-4 py-2 rounded-lg text-white font-bold ${
                uploading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 w-60"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Avatar"}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
      
    <section
      className="relative bg-cover bg-center bg-no-repeat rounded-lg h-auto flex flex-col justify-between p-4 mb-8"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #4a3038, #3d262c, #311d21, #251416, #1b0808)',
        minHeight: '400px',
        backgroundOpacity: '0.5',
      }}
    >
      <div className="flex flex-col items-start justify-center text-white space-y-4">
        <h2 className="text-4xl font-bold">Live Streams</h2>
        <button className="flex items-center text-white bg-black bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-70" 
          // onClick={() => { handleScrollRight(liveStreamRef); }}
        >
          Explore <span className="ml-2">→</span>
        </button>
      </div>

      <div
        className="flex overflow-x-auto p-2  relative first-line scrollbar-none"
        style={{
          scrollSnapType: 'x mandatory',
          flexDirection: isMobile ? 'column' : 'row',
        }}
        // ref={liveStreamRef}
      >
        {liveStreams?.length > 0 ? (
          liveStreams.map((stream, index) => (
            <div
              key={index}
              style={{
                minWidth: isMobile ? '100%' : '25%',
                maxWidth: isMobile ? '100%' : '25%',
                marginLeft: isMobile ? '0' : '2%',
              }}
            >
              <StreamCard stream={stream} onUpdate={onLiveAudioUpdate} onDelete={onLiveAudioDelete} />
            </div>
          ))
        ) : (
          <div className="w-full flex flex-col items-center justify-center text-center py-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553 2.276A1 1 0 0120 13.118v5.764a1 1 0 01-1.447.894L15 17m0-7V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h7a2 2 0 002-2v-4m0-7l-5 3"
              />
            </svg>
            <p className="text-lg font-semibold text-gray-300">No live streams yet</p>
            <p className="text-sm text-gray-400 mt-1">
             You haven't hosted any live streams yet. Click "Start Live Podcast" to go live and engage with your audience in real-time!
            </p>
          </div>
        )}
      </div>
    </section>


    <section
      className="relative bg-cover bg-center bg-no-repeat rounded-lg h-auto flex flex-col justify-between p-4 mb-8"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #436b69, #365958, #2a4847, #1f3737, #142727)',
        minHeight: '400px',
        backgroundOpacity: '0.5',
      }}
    >
      <div className="flex flex-col items-start justify-center text-white space-y-4">
        <h2 className="text-4xl font-bold">Audio/Podcasts</h2>
        <button
          className="flex items-center text-white bg-black bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-70"
          // onClick={() => { handleScrollRight(audioRef); }}
        >
          Explore <span className="ml-2">→</span>
        </button>
      </div>

      <div
        className="flex overflow-x-auto p-2 relative first-line scrollbar-none"
        style={{
          scrollSnapType: 'x mandatory',
          flexDirection: isMobile ? 'column' : 'row',
        }}
        // ref={audioRef}
      >
        {userAudioData?.length > 0 ? (
          userAudioData.map((audio, index) => (
            <div
              key={audio._id}
              style={{
                minWidth: isMobile ? '100%' : '25%',
                maxWidth: isMobile ? '100%' : '25%',
                marginLeft: isMobile ? '0' : '2%',
              }}
            >
              <AudioCard
                key={index}
                audio={audio}
                onUpdate={onAudioUpdate}
                onDelete={onAudioDelete}
              />
            </div>
          ))
        ) : (
          <div className="w-full flex flex-col items-center justify-center text-center py-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553 2.276A1 1 0 0120 13.118v5.764a1 1 0 01-1.447.894L15 17m0-7V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h7a2 2 0 002-2v-4m0-7l-5 3"
              />
            </svg>
            <p className="text-lg font-semibold text-gray-300">No audio/podcasts yet</p>
            <p className="text-sm text-gray-400 mt-1">
             You haven't uploaded any audio/podcasts yet. Click "Upload Audio/Podcast" to add your first one!
            </p>
          </div>
        )}
      </div>
    </section>

      
    </div>
  </div>
  )
}

export default Profile;