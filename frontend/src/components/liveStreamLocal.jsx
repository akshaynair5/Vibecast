import React, { useContext, useEffect, useRef, useState } from "react";
import { Authcontext } from "../contextProvider.jsx";
import db from "../services/firebaseConfig.js";
import { addDoc, collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import axiosInstance from "../services/axiosInstance.js";
import Likes from "./likeFormatter.jsx";
import Like from '../assets/like.png'
import unLike from '../assets/unlike.png'
import { useNavigate } from "react-router-dom";

const LiveStream = () => {
  const { currentLiveStream, currentUser, setCurrentLiveStream, setCollectUser } = useContext(Authcontext);
  const [isLive, setIsLive] = useState(false);
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const localAudioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Current live stream:", currentLiveStream);
    if (isLive) {
      try{
        setupConnection();
      }
      catch(error){
        console.error("Error setting up connection:", error);
        alert("Failed to start live stream. Please try again later.");
        setIsLive(false);
      }
    }
  }, [isLive]);

  useEffect(() => {
    if (localStream && localAudioRef.current) {
      localAudioRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const toggleLike = async(e) => {
    e.preventDefault();
    try{
      const res = await axiosInstance.post(`/like/toggle/s/${currentLiveStream._id}`)
      setCurrentLiveStream((prev) => {
        prev.isLiked = true;
        prev.likeCount += 1;
        return { ...prev };
      });
      
    }
    catch(err){
      console.log(err)
    }
  }
  const toggleUnLike = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.delete(
        `/like/toggleDislike`,
        { params: { streamId: currentLiveStream._id, likedBy: currentUser._id } }
      );
      setCurrentLiveStream((prev) => {
        prev.isLiked = false;
        prev.likeCount -= 1;
        return { ...prev };
      }); 
    } catch (err) {
      console.log(err);
    }
  };

  const handleUserSelect = () =>{
    if(currentLiveStream.ownerInfo[0].username === currentUser.username){
      navigate('/profile')
    }
    setCollectUser(currentLiveStream.ownerInfo[0])
    navigate(`/${currentLiveStream.ownerInfo[0].username}`); 
  }
  

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isLive) {
        stopStream();
        // Optionally add a confirmation dialog for the user (not supported in all browsers)
        event.preventDefault();
        event.returnValue = ""; // Some browsers require this to show a confirmation dialog.
      }
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLive]);
  

  const setupConnection = async () => {
    const servers = {
      iceServers: [
        {
          urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
      ],
      iceCandidatePoolSize: 10,
    };
  
    const pc = new RTCPeerConnection(servers);
  
    // Capture audio from the microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Audio stream captured:", stream);
      setLocalStream(stream);
  
      // Add audio tracks to the RTCPeerConnection
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Failed to access microphone. Please check your permissions.");
      return;
    }
  
    // Reference Firestore collections for signaling
    const callDocRef = doc(collection(db, "calls"));
    try{
      const res = await axiosInstance.patch(`/stream/${currentLiveStream._id}/set-stream-id`, {streamId: callDocRef.id})
      console.log("Stream ID set:", res.data.message);
    }
    catch(error){
      console.error("Error setting stream ID:", error);
      alert("Failed to start live stream. Please try again later.");
      return;
    }

    // Create references for "offerCandidates" and "answerCandidates"
    const offerCandidates = collection(db, "calls", callDocRef.id, "offerCandidates");
    const answerCandidates = collection(db, "calls", callDocRef.id, "answerCandidates");
  
    // Get ICE candidates for the caller and save them to Firestore
    pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Save the ICE candidate to Firestore using addDoc
          addDoc(offerCandidates, event.candidate.toJSON())
            .catch((err) => console.error("Error adding ICE candidate:", err));
        }
    };
  
    // Create an offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);
  
    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
  
    // Save the offer to Firestore
    await setDoc(callDocRef, { offer });
  
    // Listen for remote answer
    const callDocSnapshot = doc(db, "calls", callDocRef.id);  // Ensure to pass the correct document ID
    onSnapshot(callDocSnapshot, (snapshot) => {
      const data = snapshot.data();
      if (data?.answer && !pc.currentRemoteDescription) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });
  
    // Listen for remote ICE candidates
    const answerCandidatesQuery = query(answerCandidates, orderBy("timestamp"));
    onSnapshot(answerCandidatesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };
  
  
  

  const startStream = () => {
    console.log("Starting live stream...");
    setupConnection();
    setIsLive(true);
  };

  const stopStream = async () => {
    console.log("Stopping live stream...");
    try {
      const res = await axiosInstance.patch(`/stream/${currentLiveStream._id}`);
      console.log(res.data.dat);
    } catch (error) {
      console.error("Error setting stream ID:", error);
      return;
    }
  
    // Stop live status
    setIsLive(false);
  
    // Stop local media tracks (audio and video)
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          track.stop(); // Stop the track, including the microphone
        }
      });
      setLocalStream(null); // Clear the stream reference
    }
  
    console.log("Microphone and camera stopped.");
  };  

  return (
    <div className="fixed top-20 right-5 w-64 bg-white shadow-lg rounded-lg p-4 border border-gray-300 z-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {isLive ? "Live Stream" : "Start Stream"}
        </h3>
        {isLive && (
          <div className="flex items-center">
            <span className="animate-pulse w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span className="text-sm font-medium text-red-600">LIVE</span>
          </div>
        )}
      </div>

      {/* Thumbnail, Name, and Description */}
      <div className="mt-4 space-y-2">
        <img
          src={currentLiveStream?.thumbnail || "https://via.placeholder.com/150x150"}
          alt="Stream Thumbnail"
          className="w-full h-32 object-cover rounded-lg"
        />
        <p className="text-s text-gray-400 cursor-pointer" onClick={handleUserSelect}>{currentLiveStream?.ownerInfo[0].fullName || "Artist"}</p>
        <h4 className="text-md font-semibold text-gray-700">
          {currentLiveStream?.title || "Stream Title"}
        </h4>
        <p className="text-sm text-gray-600">
          {currentLiveStream?.description || "Stream Description"}
        </p>
      </div>

      {/* Audio */}
      <div className="mt-4">
        <audio ref={localAudioRef} autoPlay muted />
      </div>

      <button className="bg-slate-700 px-4 py-2 rounded-full hover:bg-slate-600 h-10 w-15 flex items-center justify-center" onClick={(e)=>{currentLiveStream?.isLiked? toggleUnLike(e) : toggleLike(e)}}>
                  {
                    currentLiveStream?.isLiked 
                      ? <img src={Like} alt="Unlike" className="h-6 mr-3" />
                      : <img src={unLike} alt="Like" className="h-6 mr-3"  />
                  }
                  <Likes likes = {currentLiveStream.likeCount} />
              </button>


      {/* Buttons */}
      <div className="mt-4">
        {!isLive ? (
          <button
            className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
            onClick={startStream}
          >
            Start Live
          </button>
        ) : (
          <button
            className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
            onClick={() => setIsStopConfirmOpen(true)}
          >
            Stop Live
          </button>
        )}
      </div>

      {/* Confirmation Popup */}
      {isStopConfirmOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Stop Stream?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to stop the live stream? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                onClick={() => setIsStopConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={() => {
                  stopStream();
                  setIsStopConfirmOpen(false);
                }}
              >
                Stop Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStream;
