var fs = require('fs');
var https = require('https');

var OAUTH_CODE = "Jl1UjSj13emUCz/heEqb7ER4FXXWyDFiaq6JCuotKplKq8fWD4NCXx5P0kxyoRlDUrPs3WokREpDZOo5TUQnUeSQs+6T4k4A0bPPLw982nLlE4pw0Ne0/koEtmEGoIxz6HGrbb/KcTxSSr8gK+w2xzx7s1vIBB7cpaNrTHn4QEFGwGR+oXhBOAQZQjSPB1giq4Gpwbj/OUBJxhHtSRVS32bI7JMPUTD7aHXA6ylOP8oBIKwEfgx2qN0F9tA4V7+xE9C1Aoi8pdP1aXy4pG5ZpR1zSkG5PG/9zI831Aq6urFufBIg89JXnpdxgBRUYwF3DEJqfOCJ76L+hQxFuYw1msmJbpLswET+g9MlyYdkOu6iE+yFj+wIaAqo7Mw68kdnJlLxj84wcf5Wiq/JsWU4WgPxxeYpTyR6bgRfs8alYARf7AM4BP2X9wPoANn100MQuG4LYrgoVi/JHHvlE5D7bqQtuN3K5e8RC7UTzOVU4bucFU19Pc4WVmwOriTfppBIwhblYRG2sbyzwq6G8Wl0g+lZXzQqCg6raotfyPEr7j8zktwqAHk8RVF//ezudCtEHOzyzWB6fCFQ/9f3NBrbZPOJZNPLX8UTNWx0D6kRVoGmd0lOLiVuiv0+2mHcSb6le/w+gicLQe8rdTFmFD0hTCfXdp32sN/pNpXWnJdNURBh8Gg1dEHk0t8DTMwkSH9WJcME81UgTTEuzPdWzMZDSCI2/a56mhM5knbsgkA+qgMdizXqcHCX/a28FetBd+6MppdCeb0c16u/5B3nLnEsB0A5GYzJ/btmQsjAGF2WLtDCxgD5zDVbtQUTJ7w4+oPTOs3hyO5Aka8IU2awJv0bDwoizKdS7XoVOUQ6pZc7Im0/Nuf51rf+woYuEN7TKtGEjfakXvC/RhQ=212FD3x19z9sWBHDJACbC00B75E"

// [1] Load SSL certificate and private key from files
//
// var privateKey  = fs.readFileSync('key.pem', 'utf8');
// var certificate = fs.readFileSync('cert.pem', 'utf8');
// var credentials = {key: privateKey, cert: certificate};
 
var CertOptions = {
    key: fs.readFileSync(__dirname + '\\privateKey.key'),
    cert: fs.readFileSync(__dirname + '\\certificate.crt'),
   };

var express = require('express');
var app = express();
//
// [2] Start a secure web server and listen on port 8443
//
var httpsServer = https.createServer(CertOptions, app);
console.log("Listening on port 8443...");
httpsServer.listen(8443);
//
// [3] Handle HTTPS GET requests at https://localhost:8443
//
app.get('/', function(req, res){
    console.log('New request');
 
    let httpStatusCode = undefined;
    let httpErrorMsg = undefined;
    let oAuthCode = req.query.code; // get the OAuth 2.0 code from the request URL
    let oAuthReply = undefined;
    // 
    // [4] POST request for obtaining OAuth 2.0 access token with code
    //
    var options = {
        url: 'https://api.tdameritrade.com/v1/oauth2/token',
        method: 'POST',
        port: "8443",
        rejectUnauthorized : 'false',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        form: {
            'grant_type': 'authorization_code',
            'code': OAUTH_CODE, 
            'client_id': 'VRLNCS0KJDABZSERJPM0VQASLPY5GIK7@AMER.OAUTHAP',
            'redirect_uri': 'https://127.0.0.1:8443'
        }
    }
    // 
    // [5] Make POST request
    //
    // request(options, function(error, response, body) {
    //     httpStatusCode = (response === undefined) ? 0 : response.statusCode;
    //     httpErrorMsg = error;
    //     css = "style=\"overflow-wrap: break-word; width: 800px;\"";
 
    //     if (response.statusCode == 200) {
    //         oAuthReply = JSON.parse(body);
    //     }
    //     //
    //     // [6] Return view, showing the OAuth 2.0 code and access token
    //     //
    //     let html = 
    //     "<html><body style=\"font-family: monospace;\"><table>" +
    //       "<tr><td width=\"150\">Status</td><td>" + httpStatusCode + "</td></tr>" +
    //       "<tr><td>OAuth 2.0 Code</td><td><div " + css + ">" + oAuthCode + "</div></td></tr>" +
    //       //"<tr><td>OAuth 2.0 Token</td><td><div " + css + ">" + oAuthReply.access_token + "</div></td></tr>" +
    //       "<tr><td>Full Response</td><td><div " + css + ">" + JSON.stringify(oAuthReply, null, 4) + "</div></td></tr>" +
    //     "</table></body></html>";
 
    //     res.send(html);
    // });
 

    // const POSTreq = https.request(options, res => {
    //     console.log(`statusCode: ${res.statusCode}`)
    //     console.log(res.headers)
      
    //     res.on('data', function(chunkyboi) {
    //       console.log("data: \n")
    //       console.log(chunkyboi)
    //       process.stdout.write(chunkyboi)
    //     })
    //   })
      
    //   POSTreq.on('error', error => {
    //     console.log(error)
    //   })
      
      
    //   POSTreq.end()
});