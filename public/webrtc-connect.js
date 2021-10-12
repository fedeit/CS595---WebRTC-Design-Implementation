let lc, rc, dc, user
const room = {id: 0}
const socket = io('/')

fetch('/me/id')
.then(res => res.json())
.then((res) => {
    console.log(res)
    user = res.user
    socket.emit('join', room, user)
})

socket.on('userJoined', (members) => {
    console.log(members)
})

socket.on('callOffer', (offerStr) => {
    let offer = JSON.parse(offerStr)
    console.log("Received call for offer ")
    console.log(offer)
    rc = new RTCPeerConnection(config)
    rc.onicecandidate = e => {
        console.log("New Ice candidate" + JSON.stringify(rc.localDescription))
        socket.emit('responseOffer',
                    user,
                    JSON.stringify(rc.localDescription),
                    room)
    }
    rc.ondatachannel = e => {
        rc.dc = e.channel
        rc.dc.onmessage = e => console.log(e.data)
        rc.dc.onopen = e => console.log("Connection opened")
        rc.dc.ontrack = event => {
            video.srcObject = event.streams[0];
          };        
    }
    rc.setRemoteDescription(offer)
    .then( e => {
        console.log("Offer set")
    })
    rc.createAnswer()
    .then( e => {
        rc.setLocalDescription(e)
    })
})

socket.on('responseOffer', (offer) => {
    console.log("Received response")
    lc.setRemoteDescription(JSON.parse(offer))
})

const config = {
    iceServers: [{
        urls: ["stun:stun.l.google.com:19302"]
    }]
};  

let showCam = () => {
    return;
    const video = document.querySelector("video");
    navigator.mediaDevices
    .getUserMedia({
        video: { facingMode: "user" },
        audio: true
    })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(error => console.error(error));
}

let call = () => {
    lc = new RTCPeerConnection(config)
    dc = lc.createDataChannel("channel1");
    dc.onmessage = e => console.log(e.data)
    dc.onopen = e => console.log("Connection opened")
    lc.onicecandidate = e => {
        console.log("New Ice candidate " + JSON.stringify(lc.localDescription))
        socket.emit('callOffer',
                    user,
                    JSON.stringify(lc.localDescription),
                    room)
    }
    lc.createOffer().then( e => lc.setLocalDescription(e).then(console.log("Description set")))
}

window.onload = () => {
    document.getElementById("callButton").onclick = call
}