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
    addStreams() {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices
            .getUserMedia({
                video: { facingMode: "user" },
                audio: false
            })
            .then(stream => {
                console.log("Getting stream")
                // const videoFrame = document.querySelector("#localVideo");
                // videoFrame.srcObject = stream;
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
            log(JSON.stringify(this.pc.localDescription))
            document.getElementById('offer').innerText = JSON.stringify(this.pc.localDescription)
        }
        this.pc.createOffer()
        .then( offer => {
            this.pc.setLocalDescription(offer)
            .then(() => {
                log('Local description set')
            })
        })
        this.pc.ontrack = e => {
            console.log("track received")
            const videoFrame = document.querySelector("#remoteVideo");
            videoFrame.srcObject = e.streams[0];
        };               
    }

    answer(sdp) {
        this.pc.setRemoteDescription(sdp)
    }
}

class WebRTCCallee extends WebRTCVideoManager {
    pc = null
    dc = null
    async init(offer) {
        this.pc = new RTCPeerConnection(config)
        await this.addStreams()
        this.pc.onicecandidate = (e) => {
            log(JSON.stringify(this.pc.localDescription))
            log(e)
        } 
        this.pc.ondatachannel = (e) => {
            this.dc = e.channel
            this.dc.onmessage = (e) => {
                log(e)
            }
            this.dc.onopen = (e) => {
                log('Connection opened')
            }
        }
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
        this.pc.ontrack = e => {
            console.log("track received")
            const videoFrame = document.querySelector("#remoteVideo");
            videoFrame.srcObject = e.streams[0];
        }
    }
}

let caller, callee
window.onload = () => {
    document.getElementById('callButton')
    .onclick = () => {
        caller = new WebRTCCaller()
        caller.init()
    }
}