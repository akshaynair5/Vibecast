import React, { useContext, useEffect, useRef, useState } from "react";
import db from "../services/firebaseConfig.js";
import { collection, doc, getDoc, onSnapshot, query, updateDoc } from "firebase/firestore";
import { Authcontext } from "../contextProvider.jsx";
import axiosInstance from "../services/axiosInstance.js";
import Likes from "./likeFormatter.jsx";
import Like from '../assets/like.png'
import unLike from '../assets/unlike.png'
import { useNavigate } from "react-router-dom";

const LiveStreamListener = () => {
  const { currentRemoteAudio, setCurrentRemoteAudio, currentUser, setCurrentLiveStream, setCollectUser  } = useContext(Authcontext);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callId, setCallId] = useState(null);
  const remoteAudioRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const pcRef = useRef(null);

//   useEffect(() => {
//     if (currentRemoteAudio !== null) {
//       setCallId(currentRemoteAudio.streamId);
//     }
//   }, [currentRemoteAudio]);

const toggleLike = async(e) => {
    e.preventDefault();
    try{
      const res = await axiosInstance.post(`/like/toggle/s/${currentRemoteAudio._id}`)
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
        { params: { streamId: currentRemoteAudio._id, likedBy: currentUser._id } }
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
    if(currentRemoteAudio.ownerInfo[0].username === currentUser.username){
      navigate('/profile')
    }
    setCollectUser(currentRemoteAudio.ownerInfo[0])
    navigate(`/${currentRemoteAudio.ownerInfo[0].username}`); 
  }

  useEffect(() => {

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
      pcRef.current = pc; // Store the connection in the ref
    
      const stream = new MediaStream();
      setRemoteStream(stream);
    
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          stream.addTrack(track);
        });
      };
    
      const callDocRef = doc(db, "calls", callId);
      const offerCandidates = collection(db, "calls", callId, "offerCandidates");
      const answerCandidates = collection(db, "calls", callId, "answerCandidates");
    
      const callDocSnapshot = await getDoc(callDocRef);
      if (!callDocSnapshot.exists()) {
        alert("Live stream not found!");
        return;
      }
    
      const callData = callDocSnapshot.data();
      if (callData.offer) {
        const offerDescription = new RTCSessionDescription(callData.offer);
        await pc.setRemoteDescription(offerDescription);
      } else {
        alert("No live stream available!");
        return;
      }
    
      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);
    
      const answer = {
        sdp: answerDescription.sdp,
        type: answerDescription.type,
      };
    
      await updateDoc(callDocRef, { answer });
    
      const offerCandidatesQuery = query(offerCandidates);
      onSnapshot(offerCandidatesQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
          }
        });
      });
    
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addDoc(answerCandidates, event.candidate.toJSON());
          addViewer();
        }
      };
    
      setIsListening(true);
    };
    

    if (callId !== null) {
      setupConnection();
    }
  }, [callId]);

  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const stopListening = () => {
    setIsListening(false);
  
    // Stop all tracks in the remote stream
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
  
    // Close the peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null; // Clear the ref
    }
    removeViewer();
    // Clear references
    setRemoteStream(null);
    setCallId(null);
  };

  const addViewer = async () =>{
    try{
        const res = await axiosInstance.patch(`/stream/${currentRemoteAudio._id}/add-viewer`);
        setCurrentRemoteAudio((prev)=>({...prev, views : prev.views + 1} ))
    }
    catch(err){
        console.error(err);
    }
  }

  const removeViewer = async () =>{
    try{
        const res = await axiosInstance.patch(`/stream/${currentRemoteAudio._id}/remove-viewer`);
        setCurrentRemoteAudio((prev)=>({...prev, views : prev.views - 1} ))
    }
    catch(err){
        console.error(err);
    }
  }

  return (
<div className="fixed top-20 right-5 w-72 bg-gray-900 text-white shadow-xl rounded-lg p-4 border border-gray-700 z-50">
  {/* Thumbnail */}
  <div className="relative w-full h-40">
    <img
      src={currentLiveStream?.thumbnail || "https://via.placeholder.com/300"}
      alt="Stream Thumbnail"
      className="w-full h-full object-cover rounded-lg"
    />
    {isLive && (
      <div className="absolute top-2 left-2 flex items-center bg-red-600 text-white text-xs px-2 py-1 rounded-md">
        <span className="animate-pulse w-2 h-2 rounded-full bg-white mr-2"></span> LIVE
      </div>
    )}
  </div>

  {/* Stream Info */}
  <div className="mt-4">
    <h4 className="text-lg font-semibold">{currentLiveStream?.title || "Stream Title"}</h4>
    <p className="text-sm text-gray-400">{currentLiveStream?.description || "Stream Description"}</p>

    <p
      className="text-sm text-gray-300 mt-2 cursor-pointer hover:text-white"
      onClick={handleUserSelect}
    >
      {currentLiveStream?.ownerInfo[0].fullName || "Artist"}
    </p>
  </div>

  {/* Like & Audio */}
  <div className="mt-4 flex items-center justify-between">
    <audio ref={localAudioRef} autoPlay muted className="hidden" />
    <button
      className="flex items-center bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-700"
      onClick={(e) => { currentLiveStream?.isLiked ? toggleUnLike(e) : toggleLike(e) }}
    >
      <img
        src={currentLiveStream?.isLiked ? Like : unLike}
        alt="Like"
        className="h-5 mr-2"
      />
      <Likes likes={currentLiveStream?.likeCount} />
    </button>
  </div>

  {/* Start/Stop Buttons */}
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

  {/* Stop Confirmation Popup */}
  {isStopConfirmOpen && (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-80">
        <h3 className="text-lg font-semibold mb-4">Stop Stream?</h3>
        <p className="text-sm mb-6">Are you sure you want to stop the live stream? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
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

export default LiveStreamListener;
