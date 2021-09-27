let createRoom =  () => {
    const lc = RTCPeerConnection()
    const dc = lc.createDataChannel("channel1");
    dc.onmessage = e => console.log(e.data)
    dc.onopen = e => console.log("Connection opened")
    lc.onicecandidate = e => console.log("New Ice candidate" + JSON.stringify(lc.localDesceription))

}

let connectTo = (offer) => {
    const rc = new RTCPeerConnection()
    rc.onicecandidate = e => console.log("New Ice candidate" + JSON.stringify(rc.localDesceription))
    rc.ondatachannel = e => {
        rc.dc = e.channel
        rc.dc.onmessage = e => console.log(e.data)
        rc.dc.onopen = e => console.log("Connection opened")
    }
    rc.setRemoteDescription(offer)
    .then( e => {
        console.log("Offer set")
    })
    rc.createAnswer()
    .then( e => {
        rc.setLocalDescription(e)
    })
}