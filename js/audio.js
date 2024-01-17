var audio = document.getElementById('cancion');
var btnToggleAudio = document.getElementById('btnToggleAudio');

function toggleAudio() {
    if (audio.paused) {
        audio.play();
        btnToggleAudio.className =  'fas fa-volume-up';
    } else {
        audio.pause();
        btnToggleAudio.className = 'fa-solid fa-volume-xmark';
    }
}
