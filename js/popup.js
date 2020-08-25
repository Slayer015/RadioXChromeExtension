const backgroundJS = chrome.extension.getBackgroundPage();

const { radio } = backgroundJS;

function initializeStuff() {

	document.querySelector("body").style.backgroundImage = "url(" + backgroundJS.externalResources.background[backgroundJS.radio.background] + ")"

	document.querySelector(".volume-control input").value = radio.player.volume * 100

	if (radio.isPlaying) {
		document.querySelector('.play-pause-switch svg').classList.add('playing');
	}

	document.querySelector('.change-theme-button').addEventListener('click', e => {
		do {
			var random = getRandomArbitrary(1, 5)
		} while (random == radio.background)
		loadImage(backgroundJS.externalResources.background[random])
			.then(img => {
				document.querySelector("body").style.backgroundImage = "url(" + img.src + ")"
				radio.setBackground(random)
			})
			.catch(err => console.error(err));
	});

	document.querySelector(".volume-control input").addEventListener('input', e => {
		radio.setVolume(Number.parseInt(e.target.value))
	})

	document.querySelector('.volume-control input').addEventListener('wheel', e => {
		e.target.value = e.deltaY < 0
			? +e.target.value + 5
			: +e.target.value - 5;
		radio.setVolume(+e.target.value);
	});

	document.querySelector('.play-pause-switch svg').addEventListener('click', function () {
		if (radio.isPlaying) {
			this.classList.remove('playing');
			radio.pause();
		} else {
			this.classList.add('playing');
			radio.play();
		}
	});
}

function getCurrentSong() {
	new Promise(function () {
		getStatus()
		setInterval(function () { getStatus() }, 1e4)
	})
}

function getRandomArbitrary(min, max) {
	return Math.ceil(Math.random() * (max - min) + min);
}

function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.addEventListener("load", () => resolve(img));
		img.addEventListener("error", err => reject(err));
		img.src = src;
	});
};

function getStatus() {
	fetch(backgroundJS.externalResources.status)
		.then(e => { return e.json() })
		.then(e => setSongInfo(e))
		.catch(e => console.log(e))

}

function setSongInfo(e) {
	const npArtist = document.querySelector('.song-artist span');
	const npSong = document.querySelector('.song-name span');

	while (npArtist.hasChildNodes()) {
		npArtist.removeChild(npArtist.lastChild);
	}
	while (npSong.hasChildNodes()) {
		npSong.removeChild(npSong.lastChild);
	}
	let song = e.current_track.title
	npArtist.appendChild(document.createTextNode(song.split(" - ")[0] || song.split("-")[0]));
	npSong.appendChild(document.createTextNode(song.split(" - ")[1] || song.split("-")[1]));

	radio.currentPlaying.artist = npArtist.childNodes[0].textContent
	radio.currentPlaying.song = npSong.childNodes[0].textContent
	radio.currentPlaying.artwork = e.current_track.artwork_url_large

	backgroundJS.updateMetadata()
}


chrome.webRequest.onBeforeSendHeaders.addListener(details => {
    var headers = details.requestHeaders, blockingResponse = {}
    headers.push(
        {
            'name': 'Referer',
            'value': 'https://radio.x-team.com/'
        },
        {
            'name': 'Sec-Fetch-Site',
            'value': 'cross-site'
        },
        {
            'name': 'Set-Cookie',
            'value': 'HttpOnly;Secure;SameSite=Strict'
        },
        {
            'name': 'Access-Control-Allow-Origin',
            'value': '*'
        })
    blockingResponse.requestHeaders = headers;
    return blockingResponse;

}, {
    urls: [
        '*://s2.radio.co/*',
        '*://radio.x-team.com/*'
    ]
}, ['requestHeaders', 'blocking']);

initializeStuff()
getCurrentSong()

