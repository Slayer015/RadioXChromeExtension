var storage = chrome.storage.local;

var externalResources = {
    background: {
        1: 'https://radio.x-team.com/static/media/mario.28e65fd9.gif',
        2: 'https://radio.x-team.com/static/media/matrix.8400ed0c.gif',
        3: 'https://radio.x-team.com/static/media/star-wars.303295a3.gif',
        4: 'https://radio.x-team.com/static/media/street-fighter.cd23183b.gif',
        5: 'https://radio.x-team.com/static/media/witcher.ba4e5f6c.gif'
    },
    stream: 'https://s2.radio.co/s83d70ae1d/listen',
    status: 'https://public.radio.co/stations/s83d70ae1d/status'
}

var preferences = {};

storage.get({
    volume: 100,
    background: 5
}, items => {
    if (typeof items.volume !== 'undefined') {
        radio.setVolume(items.volume);
    }
    if (typeof items.background !== 'undefined') {
        radio.background = items.background
    }
    preferences = items;
});

var radio = {
    player: createElement('audio', {
        src: '',
        volume: 100,
        autoplay: true
    }),
    background: 5,
    currentPlaying: {
        song: '',
        artist: '',
        artwork: ''
    },
    play() {
        return this.player.src = externalResources.stream
    },
    pause() {
        return this.player.src = ''
    },
    switch() {
        this.isPlaying() ? this.pause() : this.play();
    },
    setVolume(volume) {
        if (Number.isInteger(volume) && (volume >= 0 || volume <= 100)) {
            this.player.volume = volume / 100;
            storage.set({ volume })
        }
    },
    setBackground(background) {
        if (Number.isInteger(background) && (background >= 1 || background <= externalResources.background.lenght)) {
            this.background = background
            storage.set({ background })
        }
    },
    get isPlaying() {
        return !this.player.paused;
    },
}

function createElement(tag, attrs, styles) {
    let element = document.createElement(tag);
    for (let key in attrs) {
        element.setAttribute(key, attrs[key]);
    }
    for (let key in styles) {
        element.style[key] = styles[key];
    }
    return element;
}

function updateMetadata() {
    window.navigator.mediaSession.metadata = new window.MediaMetadata({
        title: radio.currentPlaying.song,
        artist: radio.currentPlaying.artist,
        artwork:[
            {src:radio.currentPlaying.artwork,sizes:"600x600",type: "image/jpeg"}
        ] 
    });
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