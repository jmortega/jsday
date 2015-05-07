"use strict";

var EXAMPLE_NOTES =
  "You can insert any text you want here.\n" +
  "Save it to storage and reload the page.\n";

function value(val) {

  var text = document.getElementById("text");
  if (val) {
    text.value = val;
  } else {
    return text.value;
  }
}

function updateStatus(val) {
  document.getElementById("status").innerHTML = "<b>Status:</b> " + val;
}

var Buttons = {
  load: function () {
	  var notes= NotesStorage.load();
      if (notes) {
        value(notes);
        updateStatus("Notes loaded.");
      } else {
        updateStatus("No saved notes found!");
      }
    },

  save: function () {
    var notes = value();

    NotesStorage.save(notes);
  },

  paste: function () {
    value(EXAMPLE_NOTES);
    updateStatus("Example notes pasted.");
  },

  clear: function () {
    localStorage.clear();
    Buttons.paste();
    updateStatus("Example notes pasted. (Storage cleared.)");
  }
};

addEventListener("DOMContentLoaded", function () {
  var notes= NotesStorage.load();
    if (notes) {
      value(notes);
      updateStatus("Notes loaded.");
    } else {
      Buttons.paste();
      updateStatus("Example notes pasted. (No saved notes found.)");
    }
});

addEventListener("click", function (event) {
  switch (event.target.id) {
    case "load":
      Buttons.load();
      break;
    case "save":
      Buttons.save();
      break;
    case "paste":
      Buttons.paste();
      break;
    case "clear":
      Buttons.clear();
      break;
  }
});
