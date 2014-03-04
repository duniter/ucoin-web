
$(document).ready(function () {
  // Converts .timestamp to readable date
  $('.timestamp').each(function(){
    var this$ = $(this);
    var d = new Date();
    var timestamp = parseInt(this$.text());
    d.setTime(timestamp * 1000);
    this$.text(d.toLocaleString());
  });
});
