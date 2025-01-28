import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import axiosInstance from '../services/axiosInstance';
import AudioCard from './audioCard';
import { Authcontext } from '../contextProvider';
import { useNavigate } from 'react-router-dom';
import StreamCard from './liveAudioCard';

const SearchAudioComponent = () => {
  const { setCollectUser} = useContext(Authcontext);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('All categories');
  const [results, setResults] = useState({ users: [], audios: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [view, setView] = useState('audios');

  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const fetchResults = async () => {
    if (!query) {
      setShowPopup(false);
      return;
    }
  
    setLoading(true);
    setError('');
    try {
        console.log(category, query)
      const response = await axiosInstance.post('/video/search', {
          query,
          category,
          page: 1,
          limit: 5,
      });
  
      // Access the correct response structure
      const { videos, users, liveStreams } = response.data.data;
      console.log(response.data.data);
      setResults({
        users: users?.data || [], // Handle empty or missing values gracefully
        audios: videos?.data || [],
        streams: liveStreams?.data || [],
      });
      setShowPopup(true);
    } catch (err) {
      console.error(err);
      setError('Error fetching results');
      setShowPopup(false);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSearch = async (e) => {
    e.preventDefault();
    // Optional: Perform a full search here if needed
    await fetchResults();
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 300); // Debounce the query by 300ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleChannelOpen = (channel) => {
    setCollectUser(channel)
    navigate(`/${channel.username}`); 
  }
  

  return (
    <form onSubmit={handleSearch} className="w-[40vw] justify-center items-center align-middle relative">
        <div className="flex">
            {/* Search Input */}
            <div className="relative w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="absolute w-5 h-5 top-2.5 left-2.5 text-slate-600">
              <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd" />
            </svg>  
            <input
              type="search"
              id="search-dropdown"
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border-2 border-gray-700 rounded-md pl-10 pr-3 py-2 transition duration-300 ease focus:border-slate-400 hover:border-gray-500 shadow-sm focus:shadow focus:ring-0 focus:outline-none active:outline-none"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            </div>
        </div>

        {/* Popup Menu */}
        {showPopup && (
            <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-2 z-20">
            {/* Toggle Option */}
            <div className="flex justify-around py-2 bg-gray-100 border-b border-gray-200">
                <button
                className={`px-4 py-2 ${view === 'users' ? 'font-semibold text-blue-700' : 'text-gray-600'}`}
                onClick={() => setView('users')}
                >
                Users
                </button>
                <button
                className={`px-4 py-2 ${view === 'audios' ? 'font-semibold text-blue-700' : 'text-gray-600'}`}
                onClick={() => setView('audios')}
                >
                Audio/Video
                </button>
                <button
                className={`px-4 py-2 ${view === 'streams' ? 'font-semibold text-blue-700' : 'text-gray-600'}`}
                onClick={() => setView('streams')}
                >
                Live Streams
                </button>
            </div>

            {/* Users Results */}
            {view === 'users' && (
                <div className="p-4 max-h-64 overflow-y-auto">
                <p className="font-medium text-gray-700">Users</p>
                {results.users.length > 0 ? (
                    results.users.map((user, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-md"
                        >
                            <img
                            src={user.avatar}
                            alt={`${user.fullName}'s profile`}
                            className="w-16 h-16 rounded-full mb-4"
                            />
                            <h4 className="text-lg font-semibold">{user.fullName}</h4>
                            <p className="text-gray-500">@{user.username}</p>
                            <button
                            onClick={() => handleChannelOpen(user)}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                            View Channel
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">No users found</p>
                )}
                </div>
            )}

            {/* Audio/Video Results */}
            {view === 'audios' && (
                <div className="p-4 grid grid-cols-4 gap-4 max-h-64 overflow-y-auto">
                {results.audios.length > 0 ? (
                    results.audios.map((audio) => (
                    <AudioCard key={audio._id} audio={audio} />
                    ))
                ) : (
                    <p className="col-span-4 text-sm text-gray-500">No audios found</p>
                )}
                </div>
            )}

            {view === 'streams' && (
                <div className="p-4 grid grid-cols-4 gap-4 max-h-64 overflow-y-auto">
                {results.streams.length > 0 ? (
                    results.streams.map((stream) => (
                    <StreamCard key={stream._id} stream={stream} />
                    ))
                ) : (
                    <p className="col-span-4 text-sm text-gray-500">No Live Streams found</p>
                )}
                </div>
            )}

            </div>
        )}

        {/* Loading/Error Messages */}
        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        </form>

  );
};

export default SearchAudioComponent;
