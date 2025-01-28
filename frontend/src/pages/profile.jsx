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

function Profile() {
    const {currentUser, setCurrentUser, currentAudio, setCurrentLiveStream} = useContext(Authcontext)
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

  return (
    <div className='fixed top-0 left-0 w-screen h-screen overflow-y-scroll scrollbar-thin scrollbar-thumb-scrollbar scrollbar-track-transparent z-10'
          style={{
           backgroundImage: 'linear-gradient(to right top, #0a0908, #080706, #050404, #030202, #000000)',
         }}
    >
      <Navbar/>
      <Sidebar/>

     <div className="min-h-screen bg-transparent text-white container mx-auto px-4">
      {/* Cover Image Section */}
      <div className="relative w-full h-64 bg-transparent">
      {/* Cover Image */}
      <img
        src={previewCoverImage}
        alt="Cover"
        className="object-cover w-full h-full rounded-b-lg cursor-pointer z-0 opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Edit Cover Image
            </h3>

            {/* Cover Image Preview */}
            <div className="mb-4">
              {previewCoverImage && (
                <img
                  src={previewCoverImage}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                />
              )}
            </div>

            {/* File Input for Cover Image */}
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
              onChange={handleCoverFileChange}
            />

            {/* Error or Success Message */}
            {errorImageUpload && <p className="text-red-500 text-sm mb-4">{errorImageUpload}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

            {/* Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {setErrorImageUpload(""); setSuccess(""); setIsCoverModalOpen(false)}}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
                {/* Upload Button */}
                <button
                    onClick={handleCoverSave}
                    disabled={uploading}
                    className={`w-full py-2 rounded-md text-white font-bold ${
                    uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {uploading ? "Uploading..." : "Upload Avatar"}
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
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <img
            src={previewProfileImage}
            alt="Profile"
            className="w-36 h-36 rounded-full border-4 border-white shadow-lg cursor-pointer"
            onClick={() => setIsModalOpen(true)} // Open modal on click
          />
        </div>

        {/* User Info */}
        <div className="flex flex-col justify-center space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {currentUser.fullName}
          </h2>
          <p className="text-sm text-gray-400">
            Description or bio about the user goes here.
          </p>
        <div>
          <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 m-2"
                onClick={() => setShowAddPodcastModal(true)}
            >
                Add Podcast
          </button>
         <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setIsOpen(true)}
          >
            Start Live Podcast
          </button>
        </div>

          {isOpen && (
          <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-500">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Start a Live Podcast</h2>
              <form onSubmit={handleLiveStreamSubmit} className="space-y-4">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formDataLiveStream.title}
                    onChange={handleLiveStreamInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formDataLiveStream.description}
                    onChange={handleLiveStreamInputChange}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  ></textarea>
                </div>

                {/* Stream ID Input */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">Stream ID</label>
                  <input
                    type="text"
                    name="streamId"
                    value={formDataLiveStream.streamId}
                    onChange={handleLiveStreamInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div> */}

                {/* Thumbnail Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                  <input
                    type="file"
                    accept="image/*"
                    name="thumbnail"
                    onChange={handleLiveFileChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                  >
                    Start Podcast
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        </div>
      </div>

      {showAddPodcastModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 text-black">
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h2 className="text-xl font-semibold mb-4">Add Podcast</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-medium">Audio File</label>
                <input
                  type="file"
                  name="video"
                  accept="audio/*"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Thumbnail</label>
                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              {/* <div className="mb-4">
                <label className="block font-medium">Duration (in seconds)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div> */}
              {/* <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                />
                <label className="ml-2 font-medium">Published</label>
              </div> */}
              <div className="mb-4">
                <label className="block font-medium">Topics</label>
                <Select
                  options={topics}
                  isMulti
                  value={formData.topics}
                  onChange={handleTopicChange}
                  placeholder="Select or type to search topics"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={() => setShowAddPodcastModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Edit Profile Picture
            </h3>

            {/* Image Preview */}
            <div className="mb-4">
              {previewProfileImage && (
                <img
                  src={previewProfileImage}
                  alt="Preview"
                  className="w-36 h-36 rounded-full mx-auto border-2 border-gray-300 shadow-md"
                />
              )}
            </div>

            {/* File Input */}
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
              onChange={handleAvatarChange}
            />

            {/* Error or Success Message */}
            {errorImageUpload && <p className="text-red-500 text-sm mb-4">{errorImageUpload}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

            {/* Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {setErrorImageUpload(""); setSuccess(""); setIsModalOpen(false)}}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
                {/* Upload Button */}
                <button
                    onClick={handleAvatarSave}
                    disabled={uploading}
                    className={`w-full py-2 rounded-md text-white font-bold ${
                    uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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
      className="relative bg-cover bg-center bg-no-repeat rounded-lg h-auto flex flex-col justify-between p-4 mb-4"
      style={{
        backgroundImage: 'linear-gradient(to right top, #1d615e, #204c44, #1e382e, #18261d, #0e140d)',
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
        className="flex overflow-x-auto p-2 z-0 relative first-line scrollbar-none"
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
          <p className="text-center text-gray-500">No live streams available at the moment.</p>
        )}
      </div>
    </section>


    <section
      className="relative bg-cover bg-center bg-no-repeat rounded-lg h-auto flex flex-col justify-between p-4 mb-8"
      style={{
        backgroundImage: 'linear-gradient(to right top, #2d004a, #2f0031, #27001e, #1c000e, #000000)',
        minHeight: '400px',
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
        className="flex overflow-x-auto p-2 z-0 relative first-line scrollbar-none"
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
          <div className="bg-gray-50 p-4 rounded-lg shadow-md relative z-0">
            <img
              src="https://via.placeholder.com/300x200"
              alt="Audio/Podcast"
              className="w-full h-40 object-cover rounded-md"
            />
            <h4 className="mt-2 text-lg font-semibold text-gray-800">Podcast Title</h4>
            <p className="text-sm text-gray-600">Short description of the podcast goes here.</p>
          </div>
        )}
      </div>
    </section>

      
    </div>
  </div>
  )
}

export default Profile;