// index.js
// where your node app starts
// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

function isDateValid(dateStr) {
  return !isNaN(new Date(dateStr));
}

app.get("/api/", function(req,res){
  const tarih = new Date();
  res.json({"unix": Math.floor(tarih.getTime()),"utc": tarih.toUTCString()})
})

app.get("/api/:date", function (req, res) {
  console.log(isDateValid(req.params.date));
  if(isDateValid(req.params.date)){
    let date = new Date(req.params.date);
    date.setHours(date.getHours()+2); 
    res.json({"unix":Math.floor(date.getTime()),"utc": date.toGMTString()})
  }else {
    let date = new Date(+req.params.date);
    if(isNaN(req.params.date)){
      res.json({"error":"Invalid Date"})
    } else {
      res.json({"unix":Number(req.params.date),"utc":date.toUTCString()});
    }
  }
})



// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});