const mongoose = require("mongoose");

const absenceSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Email učenika
  date: { type: String, required: true }, // Datum izostanka (npr. "2024-02-28")
  hours: { type: Number, required: true, min: 1 }, // Broj sati izostanka
  type: { 
    type: String, 
    required: true, 
    enum: ["Opravdano", "Neopravdano"] // Ograničava unos na samo ove dvije opcije
  },
  note: { type: String, default: "" } // Dodatna napomena (opcionalno)
});

module.exports = mongoose.model("Absence", absenceSchema);
