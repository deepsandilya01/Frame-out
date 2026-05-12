import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  details: { type: String },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  target: { type: String }, // e.g. userId or taskTitle
  type: { 
    type: String, 
    enum: ['user_management', 'task_assignment', 'system', 'security'],
    default: 'system'
  }
}, { timestamps: true });

const auditModel = mongoose.model("AuditLog", auditSchema);
export default auditModel;
