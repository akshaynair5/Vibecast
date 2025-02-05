import { useContext, useEffect, useRef, useState } from 'react';
import '../App.css';
import logout from '../services/logout';
import axiosInstance from '../services/axiosInstance';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';
import MusicPlayer from '../components/currentPlayer';
import AudioCard from '../components/audioCard';
import { Authcontext } from '../contextProvider';
import StreamCard from '../components/liveAudioCard';
import { set } from 'date-fns';
import exploreTopics from '../assets/exploreTopics.avif';
import Button1 from '../components/buttonHome';

function Home() {
  const { curentUser, currentAudio } = useContext(Authcontext);
  const [forYouContent, setForYouContent] = useState([]);
  const [exploreContent, setExploreContent] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [topicsContent, setTopicsContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State to manage active section
  const [activeSection, setActiveSection] = useState('All');
  
  // State for screen size
  const [isMobile, setIsMobile] = useState(false);

  const forYouRef = useRef(null);
  const exploreRef = useRef(null);
  const liveStreamsRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
        setActiveSection('forYou');  // Default to 'forYou' for mobile
      } else {
        setIsMobile(false);
        setActiveSection('All');  // Reset to 'All' for larger screens
      }
    };
  
    window.addEventListener('resize', checkScreenSize);
    checkScreenSize(); // Check screen size on initial load
  
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);  

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/users/home');
        console.log('API Response:', response.data); // Debug API response
        setExploreContent(response.data?.explore || []);
        setForYouContent(response.data?.forYou || []);
        setLiveStreams(response.data?.liveStreams || []);
        setTopicsContent(response.data?.topics || []);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Error fetching Content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // If there's an error
  if (error) return <p className="text-red-500">{error}</p>;

  // Handle button clicks to toggle sections
  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleScrollRight = (scrollContainerRef) => {
    if (scrollContainerRef.current) {
      // Scroll the container by 25% of its width
      if(!isMobile){
        const scrollAmount = scrollContainerRef.current.clientWidth * 0.25;
        scrollContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: 'smooth',
        });
      }
      else{
        const scrollAmount = 100;
        scrollContainerRef.current.scrollBy({
          top: scrollAmount,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 bg-slate-700 w-screen h-screen overflow-y-scroll  scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent"
         style={{
          backgroundImage: 'linear-gradient(to bottom, #515151, #3d3d3d, #2a2a2a, #191919, #000000)',
         }}
    >
      <Navbar />
      <Sidebar />

      <div className="container mx-auto px-4 mt-10">
        {/* Section Navigation Buttons */}
        <div className="flex space-x-4 mb-6">
          {
            !isMobile && (
              <Button1 content="All" activeSection={activeSection} active={activeSection === 'All'} onClick={() => handleSectionClick('All')} />
            )
          }
          <Button1 content="For You" activeSection={activeSection} active={activeSection === 'forYou'} onClick={() => handleSectionClick('forYou')} />
          <Button1 content="Live Streams" activeSection={activeSection} active={activeSection === 'liveStreams'} onClick={() => handleSectionClick('liveStreams')} />
          <Button1 content="Explore" activeSection={activeSection} active={activeSection === 'explore'} onClick={() => handleSectionClick('explore')} />
          <Button1 content="Topics" activeSection={activeSection} active={activeSection === 'topics'} onClick={() => handleSectionClick('topics')} />
        </div>
          

        {/* Live Streams Section */}
        {(activeSection === 'liveStreams' || (liveStreams.length > 0 && activeSection === 'All')) && (
          <section className="mb-8">
            
              <div className="relative bg-cover bg-center rounded-lg h-48 flex items-center justify-between p-4 mb-4"
                   style={{
                     backgroundImage: 'linear-gradient(to right top, #3d1229, #361312, #281703, #191705, #0e140d)',
                   }}
              >
                <h2 className="text-2xl font-bold text-white">Live Streams</h2>
                <button className="flex items-center text-white bg-black bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-70" onClick={()=>{handleScrollRight(liveStreamsRef)}}>
                  Explore <span className="ml-2">→</span>
                </button>
              </div>
            

            <div className="flex overflow-x-auto space-x-4 p-2 z-0 scrollbar-none"   
              style={{
                  scrollSnapType: 'x mandatory',
                  flexDirection: isMobile ? 'column' : 'row', // Change flex direction based on screen size
                }}
                ref={liveStreamsRef}
              >
              {liveStreams.length > 0 ? (
                liveStreams.map((stream) => 
                  <div 
                    style={{
                      minWidth: isMobile ? '100%' : '25%',
                      maxWidth: isMobile ? '100%' : '25%',
                      marginLeft: isMobile ? '0' : '2%'
                    }}
                  >
                    <StreamCard key={stream._id} stream={stream} />
                  </div>
                )
              ) : (
                <p className="text-center text-gray-500">No content available</p>
              )}
            </div>
          </section>
        )}

        {/* For You Section */}
        {(activeSection === 'forYou' || activeSection === 'All') && (
          <section
            className="relative bg-cover bg-center bg-no-repeat rounded-lg h-auto flex flex-col justify-between p-4 mb-8"
            style={{
              backgroundImage: 'linear-gradient(to right, #387174, #386365, #375556, #354848, #323b3b)',
              backgroundOpacity: '60',
              minHeight: '400px',
            }}
          >
            <div className="section-overlay"></div>
            <div className="flex flex-col items-start justify-center text-white space-y-4">
              <h2 className="text-4xl font-bold">For You</h2>
              <button className="flex items-center text-white bg-black bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-70" onClick={()=>{handleScrollRight(forYouRef)}}>
                Explore <span className="ml-2">→</span>
              </button>
            </div>

            <div
              className="flex overflow-x-auto p-2 z-0 relative scrollbar-none"
              style={{
                scrollSnapType: 'x mandatory',
                flexDirection: isMobile ? 'column' : 'row',
              }}
              ref={forYouRef}
            >
              {forYouContent.length > 0 ? (
                forYouContent.map((audio) => (
                  <div
                    key={audio._id}
                    style={{
                      minWidth: isMobile ? '100%' : '25%',
                      maxWidth: isMobile ? '100%' : '25%',
                      marginLeft: isMobile ? '0' : '2%',
                    }}
                  >
                    <AudioCard audio={audio} />
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No content available</p>
              )}
            </div>
          </section>

        )}

        {/* Explore Section */}
        {(activeSection === 'explore' || activeSection === 'All') && (
            <section
              className="relative bg-cover bg-center bg-no-repeat rounded-lg h-auto flex flex-col justify-between p-4 mb-4"
              style={{
                backgroundImage: 'linear-gradient(to right top, #1d615e, #204c44, #1e382e, #18261d, #0e140d)',
                minHeight: '400px', // Adjust height as per your needs,
                backgroundOpacity: '0.5',
              }}
            >
              <div className="flex flex-col items-start justify-center text-white space-y-4">
                <h2 className="text-4xl font-bold">Now Trending</h2>
                <button className="flex items-center text-white bg-black bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-70" onClick={()=>{handleScrollRight(exploreRef)}}>
                  Explore <span className="ml-2">→</span>
                </button>
              </div>

              <div
                className="flex overflow-x-auto p-2 z-0 relative first-line scrollbar-none"
                style={{
                  scrollSnapType: 'x mandatory',
                  flexDirection: isMobile ? 'column' : 'row', // Change flex direction based on screen size
                }}
                ref={exploreRef}
              >
                {exploreContent.length > 0 ? (
                  exploreContent.map((audio) => (
                    <div
                      key={audio._id}
                      style={{
                        minWidth: isMobile ? '100%' : '25%',
                        maxWidth: isMobile ? '100%' : '25%',
                        marginLeft: isMobile ? '0' : '2%',
                      }}
                    >
                      <AudioCard audio={audio} />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No content available</p>
                )}
              </div>
            </section>
          )}

        {/* Topics Section */}
        {(activeSection === 'topics' || activeSection === 'All') && (
          <section className="mb-2 mt-10">
          <h2 className="text-4xl font-extrabold text-white text-center my-12 tracking-wide">
             Discover & Explore <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400  font-extrabold tracking-wide drop-shadow-lg">
              Trending Topics
            </span>
          </h2>

            
            {topicsContent.length > 0 ? (
              topicsContent.map((topic) => {
                // Topic-specific gradients
                const topicGradients = {
                  "Arts & Culture": "linear-gradient(to right, #ff7eb3, #ff758c, #ff6d67)",
                  Comedy: "linear-gradient(to right, #f3a183, #e86d6d, #d52c58)",
                  Education: "linear-gradient(to right, #5d9cec, #4a77d4, #3b5998)",
                  "Health & Wellness": "linear-gradient(to right, #72c2d1, #5aa5b7, #417f95)",
                  "News & Politics": "linear-gradient(to right, #f8b195, #f67280, #c06c84)",
                  "Science & Technology": "linear-gradient(to right, #81ecec, #74b9ff, #6c5ce7)",
                  "Society & Culture": "linear-gradient(to right, #fab1a0, #e17055, #d63031)",
                  Music: "linear-gradient(to right, #d1c4e9, #b39ddb, #9575cd)",
                  "True Crime": "linear-gradient(to right, #b7d5d4, #80cbc4, #4db6ac)",
                  History: "linear-gradient(to right, #ffeaa7, #fdcb6e, #e17055)",
                  Sports: "linear-gradient(to right, #55efc4, #00cec9, #00b894)",
                  "Travel & Places": "linear-gradient(to right, #ffeaa7, #fab1a0, #ff7675)",
                };

                const gradient = topicGradients[topic._id] || "linear-gradient(to right, #3d1229, #361312, #281703)"; // Default gradient

                return (
                  <div
                    key={topic._id}
                    className="mb-8 relative bg-cover bg-center rounded-lg p-4"
                    style={{
                      backgroundImage: gradient,
                      minHeight: '300px',
                    }}
                  >
                    {/* Overlay for Readability */}
                    <div className="absolute inset-0 bg-black bg-opacity-70 rounded-lg"></div>

                    {/* Topic Content */}
                    <div className="relative z-0">
                      <h3 className="text-lg font-semibold text-white mb-2">{topic._id}</h3> {/* Topic Name */}
                      <div
                        className="flex overflow-x-auto space-x-4 p-2 scrollbar-none"
                        style={{ scrollSnapType: 'x mandatory' }}
                      >
                        {topic.videos.map((audio) => (
                          <div
                            key={audio._id}
                            style={{
                              minWidth: isMobile ? '100%' : '25%',
                              maxWidth: isMobile ? '100%' : '25%',
                              marginLeft: isMobile ? '0' : '2%',
                            }}
                          >
                            <AudioCard audio={audio} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">No topics available</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default Home;
