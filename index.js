var ffmpeg = require('fluent-ffmpeg');
const stream = require('stream')
const express = require('express');
const app = express();
var PubSub = require("pubsub-js");

const boundaryID = "BOUNDARY";
app.get('/', (req, res, next) => {
    res.sendfile('./index.html');
})
app.get('/test.jpg', async function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace;boundary="' + boundaryID + '"',
        'Connection': 'keep-alive',
        'Expires': 'Fri, 27 May 1977 00:00:00 GMT',
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache'
    });

    console.log('Start of send');

    var sub = PubSub.subscribe('MJPEG', function(msg, data) {

        //console.log(data.length);

        res.write('--' + boundaryID + '\r\n')
        res.write('Content-Type: image/jpeg\r\n');
        res.write('Content-Length: ' + data.length + '\r\n');
        res.write("\r\n");
        res.write(data, 'binary');
        res.write("\r\n");
    });
    ffstream.on('data', function(chunk) {
        PubSub.publish('MJPEG', chunk);
    });
    ffstream.on('end', function() {
        console.log("Connection closed! End of stream!!!!");
        PubSub.unsubscribe(sub);
        res.end();
    });
    res.on('close', function() {
        console.log("Connection closed!");
        PubSub.unsubscribe(sub);
        res.end();
    });
});
var command = ffmpeg('/dev/video0').outputFormat("mjpeg");
var ffstream = command.pipe();
app.listen(8080);