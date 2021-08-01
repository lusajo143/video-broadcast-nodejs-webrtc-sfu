//var getUserMedia = navigator.mediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    })
    document.getElementById('video').srcObject = stream
    const peer = createPeer()
    stream.getTracks().forEach(track => peer.addTrack(track, stream))
}

function createPeer(){
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: 'stun:stun.stunprotocol.org'
            }
        ]
    })
    peer.onnegotiationneeded = () => handleNegotiation(peer)

    return peer
}

async function handleNegotiation(peer) {
    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)
    const payload = {
        sdp: peer.localDescription
    }

    const { data } = await axios.post('/broadcast', payload)
    const desc = new RTCSessionDescription(data.sdp)
    peer.setRemoteDescription(desc).catch(e => console.log(e))
}








async function view(){
    const peer = createPeerC()
    peer.addTransceiver('video', {direction: 'recvonly'})
}
function createPeerC(){
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: 'stun:stun.stunprotocol.org'
            }
        ]
    })
    peer.ontrack = handlerTrack
    peer.onnegotiationneeded = () => handleNegotiationC(peer)

    return peer
}
async function handleNegotiationC(peer) {
    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)
    const payload = {
        sdp: peer.localDescription
    }

    const { data } = await axios.post('/consumer', payload)
    const desc = new RTCSessionDescription(data.sdp)
    peer.setRemoteDescription(desc).catch(e => console.log(e))
}
function handlerTrack(e) {
    document.getElementById('videos').srcObject = e.streams[0]
}