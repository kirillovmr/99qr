/**
 * Get peer param from url
 */
const urlParams = new URLSearchParams(window.location.search)
const peerParam = urlParams.get('peer')

// Create new peer
var peer = new Peer({
	config: {
		'iceServers': [
			{ url: 'stun:stun.l.google.com:19302' },
		]
	}
})

peer.on('open', id => {
	console.log('Peer open, id', id)

	// Connect to peer in peerParam
	if (peerParam) {
		console.log('⏳ Connecting to peer', peerParam)
		var conn = peer.connect(peerParam)

		conn.on('open', function () {
			console.log('✅ Connected to peer', peerParam, conn)

			window.sendMsg = function (msg) {
				conn.send(msg)
			}
		});
	}

	// Receive connection
	else {
		const windowLocation = window.location.href.split('://')
		if (windowLocation[1].endsWith('/')) windowLocation[1] = windowLocation[1].slice(0, -1)

		const qrUrl = windowLocation[0] + '://' + windowLocation[1] + '?peer=' + id
		console.log(qrUrl)
		const qr = new QRCode(document.getElementById("qrcode"), qrUrl)

		peer.on('connection', conn => {
			console.log('✅ Peer connection received', conn)

			conn.on('data', function (data) {
				console.log('Received', data)
			})
		})
	}
})




// console.log('Peer created, id', peer, peer._id)