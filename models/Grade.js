const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  studentEmail: { type: String, required: true },
  subject: { type: String, required: true },
  grades: [
    {
      date:{ type: String},
      grade: { type: Number, required: true, min: 1, max: 5 },
      note: { type: String, default: "" },
    },
  ],
});

module.exports = mongoose.model("Grade", gradeSchema);
