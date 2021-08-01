const express = require('express')
const app = express()
const webrtc = require('wrtc')
const ejs = require('express-ejs-layouts')
const bodyParser = require('body-parser')


app.set('view engine', 'ejs')
app.use(ejs)
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


app.post('/broadcast', async({body}, res)=>{
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    })

    peer.ontrack = (e) => handleTrackEvent(e, peer)
    const desc = new webrtc.RTCSessionDescription(body.sdp)
    await peer.setRemoteDescription(desc)
    const answer = await peer.createAnswer()
    await peer.setLocalDescription(answer)
    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload)
})

let senderStream;

function handleTrackEvent(e, peer) {
    senderStream = e.streams[0]
}

app.post('/consumer', async({body}, res)=>{
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    })
    const desc = new webrtc.RTCSessionDescription(body.sdp)
    await peer.setRemoteDescription(desc)
    senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream))
    const answer = await peer.createAnswer()
    await peer.setLocalDescription(answer)
    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload)
})

app.get('/', function(req, res){
    res.render('index')
})

app.get('/c', function(req, res){
    res.render('viewer')
})


app.listen(5000, ()=>{
    console.log('listening');
})