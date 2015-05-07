"use strict";

var NotesStorage = {
  load: function () {
    var values = Promise.all([
      localforage.getItem("notes"),
      localforage.getItem("iv")
    ]);

    return values.then(function (values) {
      var enc_notes = hexStringToUint8Array(values[0]);
      var iv = values[1];
      if (!enc_notes || !iv) {
        return null;
      }

      return retrieveKey().then(function (key) {
        var alg = {name: "AES-GCM", iv: iv};

        // Decrypt our notes using the stored |nonce|.
        return crypto.subtle.decrypt(alg, key, enc_notes)
		  .then(function (result) {
		 
           document.getElementById("text").value= decode(result);

          })
          .then(decode, function (err) {
		 
            throw "Integrity/Authenticity check failed! Invalid password?";
          });
      });
    });
  },

  save: function (notes) {
    var buffer = encode(notes);

    return retrieveKey().then(function (key) {
      // Set up parameters.
      var iv = crypto.getRandomValues(new Uint8Array(16));
      var alg = {name: "AES-GCM", iv: iv};

      // Encrypt |notes| under |key| using AES-GCM.
      return crypto.subtle.encrypt(alg, key, buffer)
        .then(function (notes_enc) {
          return Promise.all([
		  
            localforage.setItem("notes", bytesToHexString(notes_enc)),
            localforage.setItem("iv", iv)
          ]);
        });
    });
  }
};

function retrieveKey() {
  var params = Promise.all([
    // Get base key and salt.
    retrievePWKey(), getSalt()
  ]);

  return params.then(function (values) {
    var pwKey = values[0];
    var salt = values[1];

    // Do the PBKDF2 dance.
    return deriveKey(pwKey, salt);
  });
}

function deriveKey(pwKey, salt) {
  var params = {
    name: "PBKDF2",

    // TODO NSS does unfortunately not support PBKDF2 with anything
    // other than SHA-1 for now. Update this to SHA-256 once we support it.
    hash: "SHA-1",
    salt: salt,

    // The more iterations the slower, but also more secure.
    iterations: 5000
  };

  // The derived key will be used to encrypt with AES.
  var alg = {name: "AES-GCM", length: 256};
  var usages = ["encrypt", "decrypt"];

  return crypto.subtle.deriveKey(params, pwKey, alg, false, usages);
}

function retrievePWKey() {
  // We will derive a new key from it.
  var usages = ["deriveKey"];

  // TODO Use .generateKey() as soon as that's supported for PBKDF2.
  var buffer = encode(prompt("Please enter your password"));
  return crypto.subtle.importKey("raw", buffer, "PBKDF2", false, usages);
}

function getSalt() {
  // Try to read a stored salt.
  return localforage.getItem("salt")
    .then(function (salt) {
      if (salt) {
        return salt;
      }

      // We should generate at least 8 bytes
      // to allow for 2^64 possible variations.
      var salt = crypto.getRandomValues(new Uint8Array(8));
      return localforage.setItem("salt", salt);
    });
}

function encode(str) {
  return new TextEncoder("utf-8").encode(str);
}

function decode(buf) {
  return new TextDecoder("utf-8").decode(new Uint8Array(buf));
}

function bytesToHexString(bytes)
{
    if (!bytes)
        return null;

    bytes = new Uint8Array(bytes);
    var hexBytes = [];

    for (var i = 0; i < bytes.length; ++i) {
        var byteString = bytes[i].toString(16);
        if (byteString.length < 2)
            byteString = "0" + byteString;
        hexBytes.push(byteString);
    }

    return hexBytes.join("");
}

  function hexStringToUint8Array(hexString)
{
	if (!hexString)
        return null;
		
    if (hexString!=null && hexString.length % 2 != 0)
        throw "Invalid hexString";
   
	if (hexString!=null){
	
		var arrayBuffer = new Uint8Array(hexString.length / 2);
	
		for (var i = 0; i < hexString.length; i += 2) {
			var byteValue = parseInt(hexString.substr(i, 2), 16);
			if (byteValue == NaN)
				throw "Invalid hexString";
			arrayBuffer[i/2] = byteValue;
		}
	}

    return arrayBuffer;
}