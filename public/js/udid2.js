/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

// Copyright (c) 2012 Michele Bini

// This program is free software: you can redistribute it and/or modify
// it under the terms of the version 3 of the GNU General Public License
// as published by the Free Software Foundation.

// This program is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


function emptyElement(e) {
    while (e.firstChild!==null)
        e.removeChild(e.firstChild);
}

function insertElementAfter(e, w) {
    w.parentNode.insertBefore(e, w.nextSibling);
}

function setTextContent(element, text) {
    emptyElement(element);
    if (text != null) {
  var node = document.createTextNode(text);
  element.appendChild(node);
    }
}

function documentElement(id) {
    return document.getElementById(id);
}

function setMessageAfterElement(elementName, message) {
    var msgid = elementName + ".msg";
    var msg = documentElement(msgid);
    if (msg == null) {
  msg = document.createElement("span");
  msg.className = "message";
  documentElement(elementName).parentNode.appendChild(msg);
  msg.id = msgid;
    }
    setTextContent(msg, message);
}

function resetform() {
    try {
  if (!confirm("Do you really want to reset the form?")) return false;
  documentElement("firstname").value  = "";
  documentElement("lastname").value   = "";
  documentElement("day").value  = "";
  documentElement("month").value   = "";
  documentElement("year").value  = "";
  documentElement("lastname").value   = "";
  documentElement("place").value   = "";
  documentElement("lat").value   = "";
  documentElement("lon").value   = "";
  documentElement("udid2clear").value = "";
  documentElement("coordmethod").value = "geonamesorg";
  if(documentElement("udid2hashed"))
    documentElement("udid2hashed").value = "";
  setMessageAfterElement("firstname");
  setMessageAfterElement("lastname");
  setMessageAfterElement("day");
  setMessageAfterElement("geonameslist");
  setMessageAfterElement("location");
  setMessageAfterElement("place");
  documentElement("placecell").className = "";
  documentElement("coordmethodcell").className = "hidden";
  documentElement("geonameslistcell").className = "hidden";
  documentElement("locationcell").className = "hidden";
  documentElement("generated").className = "hidden";
  emptyElement(documentElement("geonameslist"));
  documentElement("lat").disabled    = false;
  documentElement("lon").disabled    = false;
  documentElement("place").disabled  = false;
  return false;
   } catch (err) {
       alert("An error occurred: " + err.message);
       return false;
   }
}

function normalizeSign(n) {
    if (!(/^[+-]/.test(n))) {
  n = "+" + n;
    }
    return n;
}

function normalizeSpaces(n) {
    n = n.replace(/^\s\s*/, "");
    n = n.replace(/\s\s*$/, "");
    n = n.replace(/\s\s*/g, " ");
    return n;
}

function selectlatlon() {
    documentElement("place").value = "";
    documentElement("coordmethod").value = "latlon";
    documentElement("coordmethodcell").className = "";
    documentElement("locationcell").className = "";
    documentElement("lat").disabled = false;
    documentElement("lon").disabled = false;
    documentElement("placecell").className = "hidden";
    documentElement("geonameslistcell").className = "hidden";
}

function addoption(x, o) {
    try {
  // for IE earlier than version 8
  x.add(o,x.options[null]);
    } catch (e) {
  x.add(o,null);
    }
}

function showlatlon() {
    var x = documentElement("coordmethod");
    if (x.length > 2) {
  x.remove(2);
    }
    var o = document.createElement("option");
    o.text = "Use coordinates found via geonames.org";
    o.value = "usefound";
    addoption(x, o);
    x.value = "usefound";
    documentElement("coordmethodcell").className = "";
    documentElement("locationcell").className = "";
    documentElement("place").disabled = true;
    documentElement("lat").disabled = true;
    documentElement("lon").disabled = true;
}

function fullgeoname(t) {
    var n = (t.toponymName === undefined) ? t.name : t.toponymName;
    var v = function (x) { return ((x !== undefined) && (x !== "")  && (x != n)); };
    if (v(t.adminName5))   n += " (" + t.adminName5 + ")";
    if (v(t.adminName4))   n += " (" + t.adminName4 + ")";
    if (v(t.adminName3))   n += " (" + t.adminName3 + ")";
    if (v(t.adminName2))   n += " (" + t.adminName2 + ")";
    if (v(t.adminName1))   n += " (" + t.adminName1 + ")";
    if (v(t.countryName))  n += ", " + t.countryName;
    return n;
}

function showgeonameslist() {
    setMessageAfterElement("geonameslist", "Select your birthplace");
    documentElement("geonameslistcell").className = "";
    documentElement("coordmethodcell").className = "";
    documentElement("placecell").className = "hidden";
    documentElement("locationcell").className = "hidden";
}

function addselectlistoption(s) {
    if (s == null) s = documentElement("coordmethod");
    var o = document.createElement("option");
    o.text = "Select location found via geonames.org";
    o.value = "selectlist";
    o.name = "selectlist";
    addoption(s, o);
}

function setgeonameslist(l) {
    var i;
    var s = l.length;
    var sel = documentElement("geonameslist");
    var first;
    emptyElement(sel);
    for (i = 0; i < s; i++) {
  var t = l[i];
  var o = document.createElement("option");
  o.text = fullgeoname(t);
  o.value = t.geonameId + " " + t.lat + " " + t.lng;
  if (first == null) first = o.value;
  addoption(sel, o);
    }
    sel.value = first;
    var x = documentElement("coordmethod");
    if (x.length > 2) {
  x.remove(2);
    }
    addselectlistoption(x);
    x.value = "selectlist";
    showgeonameslist();
}

function selectgeonamesorg() {
    documentElement("place").disabled = false;
    documentElement("lat").value = "";
    documentElement("lon").value = "";
    documentElement("placecell").className = "";
    documentElement("coordmethodcell").className = "";
    documentElement("locationcell").className = "hidden";
    documentElement("geonameslistcell").className = "hidden";
}

function removeusefoundoption() {
    var x = documentElement("coordmethod");
    if ((x.length > 2) && (x.options[2].value == "usefound")) {
  x.remove(2);
  if (documentElement("geonameslist").firstChild != null)
      addselectlistoption();
    }
}

function coordmethodselect() {
    var x = documentElement("coordmethod");
    x = x.options[x.selectedIndex].value;
    if (x == "geonamesorg") {
  removeusefoundoption();
  selectgeonamesorg();
  return true;
    } else if (x == "latlon") {
  removeusefoundoption();
  selectlatlon();
  return true;
    } else if (x == "selectlist") {
  showgeonameslist();
  return true;
    }
    return false;
}

function showcoordmethod() {
    documentElement("coordmethodcell").className = "";
}

function geonamesclearmsg() {
    setMessageAfterElement("geonameslist");
    return true;
}

function useselectedgeoname() {
    geonamesclearmsg();
    setMessageAfterElement("location");
    var l = documentElement("geonameslist");
    var o = l.options[l.selectedIndex];
    var x = o.value.split(/ /g);
    var lat = x[1];
    var lon = x[2];
    documentElement("place").value = o.text;
    documentElement("lat").value = lat;
    documentElement("lon").value = lon;
    showlatlon();
}

function geonameselect() {
    try {
  useselectedgeoname();
  return true;
    } catch (err) {
  setMessageAfterElement("geonameslist", "An error occurred: " + err.message);
  return false;
    }
}

function jsonquery(u, f, p, e) {
    var r = new XMLHttpRequest;
    r.open("GET", u, true);
    r.send(null);
    r.onreadystatechange = function () {
  if (r.readyState == 4) {
      if (r.status == 200) {
    f(JSON.parse(r.responseText));
      } else {
    e(r);
      }
  } else if (r.readyState == 3) {
      p(r);
  }
    };
}

function birthplacechanged() {
    if (documentElement("coordmethod").value != "geonamesorg") {
        documentElement("coordmethodcell").className = "";
    }
    documentElement("lat").value   = "";
    documentElement("lon").value   = "";
    documentElement("coordmethod").value = "geonamesorg";    
    return true;
}

function generateudid2() {
    var no_focusing = false; // Set this in json callbacks, so we don't change focus asynchronously from user input
    var to_focus = null;

    var foc = function (id) {
  if (to_focus == null) to_focus = documentElement(id);
    };

    var checkfirstname = function (id) {
  var name =  documentElement(id).value;
  name = normalizeSpaces(name);
  name = name.toUpperCase();
  name = name.substring(0, 20);
  var matches = name.match(/[^-A-Z]/);
  if (/[, ][, ]*/.test(name)) {
      setMessageAfterElement(id, "Specify only the first of the names");
      foc(id);
      return null;
  }
  if (matches != null) {
      setMessageAfterElement(id, "Invalid character: " + matches.join(", "));
      foc(id);
      return null;
  }
  if (name.length == 0) {
      setMessageAfterElement(id, "Insert first name");
      foc(id);
      return null;
  }
  setMessageAfterElement(id); // Clear any message
  return name;
    };
    var checklastname = function (id) {
  var name =  documentElement(id).value;
  name = normalizeSpaces(name);
  name = name.toUpperCase();
  name = name.substring(0, 20);
  var matches = name.match(/[^-A-Z]/);
  if (/[, ][, ]*/.test(name)) {
      setMessageAfterElement(id, "Specify only the last of the names");
      foc(id);
      return null;
  }
  if (matches != null) {
      setMessageAfterElement(id, "Invalid character: " + matches.join(", "));
      foc(id);
      return null;
  }
  if (name.length == 0) {
      setMessageAfterElement(id, "Insert last name");
      foc(id);
      return null;
  }
  setMessageAfterElement(id); // Clear any message
  return name;
    };

    var firstname  = checkfirstname("firstname");
    var lastname    = checklastname("lastname");

    var year   = documentElement("year").value;
    var month  = documentElement("month").value;
    var day    = documentElement("day").value;
    var date   = null;
    // Possible error conditions:
    // Missing date
    // Invalid date.
    // Incomplete date.

    if ((year == "") && (month == "") && (day == "")) {
  setMessageAfterElement("day", "Specify date");
  foc("day");
    } else if (day == "") {
  setMessageAfterElement("day", "Specify day");
  foc("day");
    } else if (month == "") {
  setMessageAfterElement("day", "Specify month");
  foc("month");
    } else if (year == "") {
  setMessageAfterElement("day", "Specify year");
  foc("year");
    } else {
  var currentdatemax = new Date;
  currentdatemax.setDate((new Date).getDate() + 1);
  var maxyear = currentdatemax.getFullYear();
  if (!(/^[12][0-9][0-9][0-9]$/.test(year))
      || (year < 1880)
      || (year > (currentdatemax.getFullYear()))) {
      setMessageAfterElement("day", "Year should be a number between 1880 and " + maxyear);
  } else {
      var birthdate = new Date(year, month-1, day);
      if ((birthdate == null)
    || (birthdate > currentdatemax)) {
    setMessageAfterElement("day", "Invalid date");
      } else {
    if ((birthdate.getDate() != day)
        || (birthdate.getMonth() != (month-1))
        || (birthdate.getFullYear() != (year))) {
        setMessageAfterElement("day", "Invalid date");
    } else {
        setMessageAfterElement("day");
        date = year + "-" + month + "-" + day;
    }
      }
  }
    }

    var continuewithlatlon = function (lat, lon) {
  var ll = null;

  // Possible error conditions:
  if ((lat == "") && (lon == "")) {
      setMessageAfterElement("location", "Specify latitude and longitude");
      foc("lat");
  } else if (lat == "") {
      setMessageAfterElement("location", "Specify latitude");
      foc("lat");
  } else if (!(/^[+-]?[0-9][0-9]*/.test(lat))) {
      setMessageAfterElement("location", "Latitude should have the format (+/-)N.NN");  
      foc("lat");
  } else if (!(/^[+-]?[0-9][0-9]*[.][0-9][0-9]/.test(lat))) {
      setMessageAfterElement("location", "Latitude should have at least two decimal places");
      foc("lat");
  } else if (!(/^[+-]?[0-9][0-9]*[.][0-9][0-9][0-9]*$/.test(lat))) {
      setMessageAfterElement("location", "Latitude has invalid format");
      foc("lat");
  } else if ((lat > 90) || (lat < -90)) {
      setMessageAfterElement("location", "Latitude should be between +90 and -90");
      foc("lat");
  } else if (lon == "") {
      setMessageAfterElement("location", "Specify longitude");
      foc("lon");
  } else if (!(/^[+-]?[0-9][0-9]*/.test(lon))) {
      setMessageAfterElement("location", "Longitude should have the format (+/-)N.NN"); 
      foc("lon");
  } else if (!(/^[+-]?[0-9][0-9]*[.][0-9][0-9]/.test(lon))) {
      setMessageAfterElement("location", "Longitude should have at least two decimal places: " + lon);
      foc("lon");
  } else if (!(/^[+-]?[0-9][0-9]*[.][0-9][0-9][0-9]*$/.test(lon))) {
      setMessageAfterElement("location", "Longitude has invalid format");
      foc("lon");
  } else if ((lon > 180) || (lon <= -180)) {
      setMessageAfterElement("location", "Longitude should be between +180.00 and -179.99");
      foc("lon");
  } else {
      // Add sign and extra zeroes, round latitude and longitude
      lat = normalizeSign(parseFloat(lat).toFixed(2));
      lon = normalizeSign(parseFloat(lon).toFixed(2));
      
      // Remove extra leading zeroes
      lat = lat.replace(/^[+]0*/, "+");
      lat = lat.replace(/^[-]0*/, "-");
      
      // Add back zeroes
      if (/^[+-][.]/.test(lat)) {
    lat = lat.substring(0, 1) + "0" + lat.substring(1);
      }
      if (/^[+-][0-9][.]/.test(lat)) {
    lat = lat.substring(0, 1) + "0" + lat.substring(1);
      }
      if (/^[+-][.]/.test(lon)) {
    lon = lon.substring(0, 1) + "0" + lon.substring(1);
      }
      if (/^[+-][0-9][.]/.test(lon)) {
    lon = lon.substring(0, 1) + "0" + lon.substring(1);
      }
      if (/^[+-][0-9][0-9][.]/.test(lon)) {
    lon = lon.substring(0, 1) + "0" + lon.substring(1);
      }

      // Check correctness of the format
      if (!(/^[+-][0-9][0-9][.][0-9][0-9]$/.test(lat))) {
    setMessageAfterElement("location", "Could not parse latitude: " + lat);
      } else if (!(/^[+-][0-9][0-9][0-9][.][0-9][0-9]$/.test(lon))) {
    setMessageAfterElement("location", "Could not parse longitude: " + lon);
      } else {
    documentElement("verifylocation").href = "http://www.openstreetmap.org/?lat=" + lat + "&lon=" + lon + "&zoom=15&layers=M";
    setTextContent(documentElement("verifylocation"), "Verify with openstreetmap");
    setMessageAfterElement("location");
    ll = lat + "" + lon;
      }
  }    

  if ((firstname !== null) && (lastname !== null) && (ll !== null) && (date !== null)) {
      documentElement("generated").className = "";
      documentElement("udid2clear").value   = "udid2;c;" + lastname + ";" + firstname + ";" + date + ";e" + ll + ";0;";
      documentElement("udid2clear").readOnly = true;
      if(documentElement("udid2hashed")){
        documentElement("udid2hashed").value  = "udid2;h;" + Sha1.hash(lastname + ";" + firstname + ";" + date + ";e" + ll) + ";0;";
        documentElement("udid2hashed").scrollIntoView(false);
        documentElement("udid2hashed").readOnly = true;
      }
      return true;
  } else {
      documentElement("udid2clear").readOnly = false;
      documentElement("udid2clear").value    = "";
      if(documentElement("udid2hashed")){
        documentElement("udid2hashed").readOnly = false;
        documentElement("udid2hashed").value   = "";
      }
      if (!no_focusing) {
    if (to_focus !== null) {
        to_focus.focus();
    }
      }
      return false;
  }
    };

    if (documentElement("coordmethod").value == "geonamesorg") {
  var place = normalizeSpaces(documentElement("place").value);
  if (place == "") {
      setMessageAfterElement("place", "Specify your birthplace");
      foc("place");
  } else if (
      // Detect when the user is inputting numerical coordinates
      (!(/[^-+0-9 .,;][^-+0-9 .,;]/.test(place))) &&
    (/[0-9][.]/.test(place))
  ) {
      // Try to different ways to split the string into latitude and longitude
      var lat, lon, x;
      if         ((x = place.split(/;\s*/g)).length == 2) {
    lat = x[0]; lon = x[1];
      } else if  ((x = place.split(/;\s*/g)).length == 2) {
    lat = x[0]; lon = x[1];
      } else if  ((x = place.split(/,\s\s*/g)).length == 2) {
    lat = x[0]; lon = x[1];
      } else if  ((x = place.split(/\s/g)).length == 2) {
    lat = x[0]; lon = x[1];
      } else if  ((x = place.split(/,/g)).length == 2) {
    lat = x[0]; lon = x[1];
      } else if  ((x = place.match(/[+-]?[0-9][0-9]*[.][0-9][0-9][0-9]*/g)) && (x.length == 2)) {
    lat = x[0]; lon = x[1];
      } else {
    lat = place; lon = "";
      }
      selectlatlon();
      documentElement("lat").value = lat;
      documentElement("lon").value = lon;
  } else {
      var n = 0;
      try {
    // For compatibility with Internet Explorer's default security settings, the json request to geonames.org should be proxied by a PHP script in the local domain
    jsonquery("http://api.geonames.org/search?q="+encodeURIComponent(place)+"&type=json&featureClass=P&username=rev22", function (j) {
        try {
      var g = j.geonames;
      if (g.length == 0) {
          setMessageAfterElement("place", "Location not found (in geonames.org)");
      } else if (g.length == 1) {
          setMessageAfterElement("place", "Location found");
          var t = g[0];
          var lat = t.lat;
          var lon = t.lng;
          documentElement("place").value = fullgeoname(t);
          documentElement("lat").value = lat;
          documentElement("lon").value = lon;
          showlatlon();
          continuewithlatlon(lat, lon);
      } else {
          setMessageAfterElement("place");
          setgeonameslist(g);
      }
        } catch (err) {
          throw err;
      setMessageAfterElement("place", "Error processing geonames response: " + err.message);
        }
    }, function (r) {
        setMessageAfterElement("place", "Looking up in geonames.org.." + (((n%1)==0)?"":"."));
        n++;
    }, function (r) {
        setMessageAfterElement("place", "Error contacting geonames.org: (" + r.status + ") " + r.responseText);
    });
    setMessageAfterElement("place", "Looking up in geonames.org...");
    foc("generate");
      } catch (err) {
    setMessageAfterElement("place", "Could not access geonames.org: " + err.message);
    showcoordmethod();
    foc("coordmethod");
      }
  }
    } else if (documentElement("coordmethod").value == "selectlist") {
  useselectedgeoname();
  foc("generate");
    }
    
    continuewithlatlon(normalizeSpaces(documentElement("lat").value),
           normalizeSpaces(documentElement("lon").value));
}
