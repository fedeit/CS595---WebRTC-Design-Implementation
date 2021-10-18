const room = {id: 0}
const socket = io('/')
let user

fetch('/me/id')
.then(res => res.json())
.then((res) => {
    console.log(res)
    user = res.user
    socket.emit('join', room, user)
})

const config = {
    iceServers: [{
        urls: ["stun:stun.l.google.com:19302"]
    }]
};  

let log = (s) => {
    console.log(s)
}

class WebRTCVideoManager {
    pc = null
    dc = null
    receivedTrack = null
    addStreams() {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices
            .getUserMedia({
                video: { facingMode: "user" },
                audio: false
            })
            .then(stream => {
                console.log("Getting stream")
                const videoFrame = document.querySelector("#localVideo");
                videoFrame.srcObject = stream;
                stream.getTracks()
                .forEach((track) => {
                    console.log("...added track")
                    this.pc.addTrack(track, stream)
                });
                resolve()
            })
            .catch(reject)
        })
    }
    
    onRemoteTrack(e) {
        console.log("track received")
        const videoFrame = document.querySelector("#remoteVideo");
        videoFrame.srcObject = e.streams[0];
    }
}

class WebRTCCaller extends WebRTCVideoManager{
    async init() {
        this.pc = new RTCPeerConnection(config)
        await this.addStreams()
        this.dc = this.pc.createDataChannel('channel')
        this.dc.onmessage = e => {
            log('Got a message ' + e.data)
        }
        this.dc.onopen = e => {
            log('Connection opened')
        }
        this.pc.onicecandidate = e => {
            log("Ice candidate received")
             console.log(JSON.stringify(this.pc.localDescription))
        }
        this.pc.createOffer()
        .then( offer => {
            this.pc.setLocalDescription(offer)
            .then(() => {
                log('Local description set')
            })
        })
        setTimeout(() => {
            socket.emit('callOffer', user, this.pc.localDescription, room)
        }, 5000)
        this.pc.ontrack = this.onRemoteTrack    
        socket.on('responseOffer', (offer) => {
            console.log(JSON.stringify(offer))
            this.answer(offer)
        })
    }

    answer(offer) {
        this.pc.setRemoteDescription(offer)
    }
}

class WebRTCCallee extends WebRTCVideoManager {
    pc = null
    dc = null
    async init() {
        this.pc = new RTCPeerConnection(config)
        await this.addStreams()
        this.pc.onicecandidate = (e) => {
            log(JSON.stringify(this.pc.localDescription))
        }
        setTimeout(() => {
            socket.emit('responseOffer', user, this.pc.localDescription, room)
        }, 5000, )
        this.pc.ondatachannel = (e) => {
            this.dc = e.channel
            this.dc.onmessage = (e) => {
                log(e)
            }
            this.dc.onopen = (e) => {
                log('Connection opened')
            }
        }
        this.pc.ontrack = this.onRemoteTrack    
        socket.on('callOffer', offer => {
            this.pc.setRemoteDescription(offer)
            .then(e => {
                console.log('Remote description set')
            })
            this.pc.createAnswer()
            .then( localDesc => {
                this.pc.setLocalDescription(localDesc)
                .then(e => {
                    log('Local description set')
                })
            })            
        })
    }
}

let caller, callee
window.onload = () => {
    document.getElementById('callButton')
    .onclick = () => {
        caller = new WebRTCCaller()
        caller.init()
    }

    document.getElementById('answerButton')
    .onclick = () => {
        caller = new WebRTCCallee()
        caller.init()
    }
}