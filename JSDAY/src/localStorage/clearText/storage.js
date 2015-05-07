"use strict";

var NotesStorage = {
  load: function () {
    return localStorage.getItem("notes");
  },

  save: function (notes) {
    return localStorage.setItem("notes", notes);
  }
};
