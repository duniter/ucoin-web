$(document).ready(function () {
  var d = new Date();
  var timestamp = parseInt($('#generatedon').text());
  d.setTime(timestamp * 1000);
  $('#generatedon').text(timestamp + ' (' + d.toLocaleString() + ')');
});