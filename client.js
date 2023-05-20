/**
 * Get peer param from url
 */
const urlParams = new URLSearchParams(window.location.search)
const peerParam = urlParams.get('peer')

if (peerParam) {
	document.getElementById('host').style.display = 'none'
	document.getElementById('client').style.display = 'block'
}
else {
	document.getElementById('host').style.display = 'block'
	document.getElementById('client').style.display = 'none'
}

// Create new peer
var peer = new Peer({
	config: {
		'iceServers': [
			{ url: 'stun:stun.l.google.com:19302' },
		]
	}
})

window.noreload = false

const connectingTimeout = setTimeout(() => {
	document.getElementById('client-status').innerText = 'You may be using invalid link\nPlease scan the QR code again'
	document.getElementById('client-status').style.color = 'red'
}, 5000)

peer.on('open', id => {
	console.log('Peer open, id', id)

	// Connect to peer in peerParam
	if (peerParam) {
		console.log('⏳ Connecting to peer', peerParam)
		var conn = peer.connect(peerParam)

		conn.on('open', function () {
			console.log('✅ Connected to peer', peerParam, conn)
			clearTimeout(connectingTimeout)

			document.getElementById('input-group').style.display = 'block'
			document.getElementById('client-status').innerText = 'Connected to peer'
			document.getElementById('client-status').style.color = '#49b249'

			document.getElementById('url-input').addEventListener('input', () => {
				document.getElementById('input-error').innerText = ''
			})

			document.getElementById('redirect-btn').addEventListener('click', () => {
				let url = document.getElementById('url-input').value
				if (url === '') {
					document.getElementById('input-error').innerText = 'Please enter a URL'
					return
				}

				if (!/^https?:\/\//i.test(url)) {
					url = 'http://' + url
				}

				try {
					new URL(url)
					console.log('Redirected to', url)
					conn.send({
						type: 'redirect',
						url: url,
					})

					document.getElementById('client-status').innerText = 'Peer Redirected\nYou can close the page now'
					document.getElementById('client-status').style.color = '#494ab2'

					document.getElementById('input-group').style.display = 'none'
				}
				catch(e) {
					document.getElementById('input-error').innerText = 'Please enter a valid URL'
					return
				}
			})

			window.sendMsg = function (msg) {
				conn.send(msg)
			}
		})
	}

	// Receive connection
	else {
		const windowLocation = window.location.href.split('://')
		if (windowLocation[1].endsWith('/')) windowLocation[1] = windowLocation[1].slice(0, -1)

		const qrUrl = windowLocation[0] + '://' + windowLocation[1] + '?peer=' + id
		console.log(qrUrl)


		document.getElementById('qr-placeholder').style.display = 'none'
		const qr = new QRCode(document.getElementById("qrcode"), {
			text: qrUrl,
			width: 256,
			height: 256,
		})
		document.getElementById('status').innerText = 'Scan QR code to connect'
		document.getElementById('status').style.color = '#49b249'

		peer.on('connection', conn => {
			console.log('✅ Peer connection received', conn)
			document.getElementById('connection').innerText = 'Peer connected. Waiting for redirect...'
			document.getElementById('connection').style.color = '#49b249'

			conn.on('data', function (data) {
				console.log('Received', data)

				if (typeof data === 'object') {
					if (data.type === 'redirect') {
						console.log('Redirecting to', data.url)

						if (window.noreload) return

						window.history.pushState(null, document.title, window.location.href)

						setTimeout(() => {
							window.location.href = data.url
						}, 250)
					}
				}
			})
		})
	}
})
