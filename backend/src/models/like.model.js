import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      default: undefined,
    },
    stream: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      default: undefined,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: undefined,
    },
  },
  { timestamps: true }
);

// Pre-save hook to ensure only one field is populated

likeSchema.pre("save", function (next) {
  const fields = [this.video, this.stream, this.comment];
  const populatedFields = fields.filter((field) => field !== undefined && field !== null);

  if (populatedFields.length !== 1) {
    return next(
      new Error("Exactly one of video, tweet, or comment must be provided.")
    );
  }

  next();
});

// // Add unique indexes for each type of like
// likeSchema.index({ likedBy: 1, video: 1 }, { unique: true, sparse: true });
// likeSchema.index({ likedBy: 1, stream: 1 }, { unique: true, sparse: true });
// likeSchema.index({ likedBy: 1, comment: 1 }, { unique: true, sparse: true });

export const Like = mongoose.model("Like", likeSchema);
