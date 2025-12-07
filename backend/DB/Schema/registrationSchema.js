import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const registrationSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
    
  },
    email: {
    type: String,
    required: true,
    unique: true,
  },    
    password: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: false,
  },
    createdAt: {
    type: Date,
    default: Date.now,
  },
});


registrationSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return ;
    }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

registrationSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}


const Registration = mongoose.model("Registration", registrationSchema);


export default Registration;