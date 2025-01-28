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
        console.log("Setting up connection with callId", callId);
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
    <div className="fixed top-20 right-5 w-64 bg-white shadow-lg rounded-lg p-4 border border-gray-300 z-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {isListening ? "Listening to Live Stream" : "Start Listening"}
        </h3>
        {isListening && (
          <div className="flex items-center">
            <span className="animate-pulse w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-sm font-medium text-green-600">LIVE</span>
          </div>
        )}
      </div>

      {/* Thumbnail, Name, and Description */}
      <div className="mt-4 space-y-2">
        <img
          src={currentRemoteAudio?.thumbnail || "https://via.placeholder.com/150x150"}
          alt="Stream Thumbnail"
          className="w-full h-32 object-cover rounded-lg"
        />
        <p className="text-s text-gray-400 cursor-pointer" onClick={handleUserSelect}>{currentRemoteAudio?.ownerInfo[0].fullName || "Artist"}</p>
        <h4 className="text-md font-semibold text-gray-700">
          {currentRemoteAudio?.title || "Stream Title"}
        </h4>
        <p className="text-sm text-gray-600">
          {currentRemoteAudio?.description || "Stream Description"}
        </p>
      </div>

      {/* Audio */}
      <div className="mt-4 hidden">
        <audio ref={remoteAudioRef} autoPlay controls />
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
        {!isListening ? (
          <button
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            onClick={() => setCallId(currentRemoteAudio.streamId)}
          >
            Start Listening
          </button>
        ) : (
          <button
            className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
            onClick={() => setIsStopConfirmOpen(true)}
          >
            Stop Listening
          </button>
        )}
      </div>

      {/* Confirmation Popup */}
      {isStopConfirmOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Stop Listening?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to stop listening to the live stream? This action cannot be undone.
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
                  stopListening();
                  setIsStopConfirmOpen(false);
                }}
              >
                Stop Listening
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamListener;
