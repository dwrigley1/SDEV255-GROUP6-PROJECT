const mongoose = require("mongoose");

const userSchema = new mongoose.Schema

(
  {
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  first_name: String,
  last_name: String,
  role: { type: String, enum: ["teacher", "student"], required: true }

}
);

const courseSchema = new mongoose.Schema(
  
  {
  name: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  credits: { type: Number, required: true },
  creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }

}

);

const cartSchema = new mongoose.Schema(

  {
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  order_num: { type: String, required: true }
}

);

const enrollmentSchema = new mongoose.Schema(
  
  {
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }
}

);

module.exports ={
  User: mongoose.model("User",userSchema),
  Course: mongoose.model("Course",courseSchema),
  Cart: mongoose.model("Cart", cartSchema),

  Enrollment: mongoose.model("Enrollment",enrollmentSchema)
};