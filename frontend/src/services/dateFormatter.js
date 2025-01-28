import { format } from "date-fns";

export const getFormattedCreationDate = (audio) => {
    let creationDate;
  
    if (audio.createdAt) {
      // If `createdAt` exists, use it directly
      creationDate = new Date(audio.createdAt);
    } else if (audio._id) {
      // Extract the timestamp from the ObjectId
      const timestamp = parseInt(audio._id.toString().substring(0, 8), 16) * 1000;
      creationDate = new Date(timestamp);
    } else {
      throw new Error("No valid timestamp found.");
    }
  
    // Format the date (use any format you prefer)
    return format(creationDate, "MMM dd, yyyy");
  };