require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { URL } = require('url');
const dns = require('dns').promises;
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let urls = {};
let index = 0;
app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;
  try{
    const isValid = await verifyDns(url);
    if(!isValid){
      res.json({ error: "Invalid URL" });
    } else {
      urls[++index] = url;
      res.json({"original_url":url,"short_url":index});
    }
  } catch(error){
    res.send(error);
  }
});

app.get('/api/shorturl/:number',(req,res) => {
  const num = req.params.number;
  res.redirect(urls[num]);
})

async function verifyDns(domain) {
  try {
    const url = new URL(domain);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      //unvalid domain
      return false;
    }
    //valid domain
    return true;
  } catch (error) {
    //error catch
    return false;
  }
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
