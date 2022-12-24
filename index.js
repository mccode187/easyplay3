const audioContext = new AudioContext(); 
const value = {"c":0,"d":2,"e":4,"f":5,"g":7,"a":9,"b":11,"#":1,"&":-1};
let on = false;
let paused; let LH_track; let RH_track;

function voice(keys) {
    const oscillator = new OscillatorNode(audioContext, {frequency: 0});
    oscillator.connect(audioContext.destination);
    const frequencies = [];
    const pressedKey = null;
    let index = 0;
    
    function down(e) {
        console.log(on, keys.includes(e.key),!e.repeat, (e.key != pressedKey), (index < frequencies.length), index, frequencies.length, !paused);
        if (on && keys.includes(e.key) && !e.repeat && (e.key != pressedKey) 
        && (index < frequencies.length) && !paused) {
            console.log("entered if statement of down function");
            oscillator.frequency.value = frequencies[index];
            index++;
            pressedKey = e.key;
       }
    }

    function up(e) {
        if (on && (e.key === pressedKey) && !paused) {
            oscillator.frequency.value = 0;
            pressedKey = null;
        }
    }

    return {oscillator, frequencies, down, up};
}

const voices = [voice(["f","d"]), voice(["j","k"])];
console.log(voices);
function down(e) {
    for (const voice of voices) {
        voice.down(e);
    }
}

function up(e) {
    for (const voice of voices) {
        voice.up(e);
    }
}

document.addEventListener("keydown", down);
document.addEventListener("keyup", up);

function toFreq(notes) {
    frequencies = [];
    for (let i = 0; i < notes.length; i++) {
        const pitch = notes[i].midi - 60;
        const frequency = 2 ** (pitch/12 + 8);
        frequencies.push(frequency);    
    }
    return frequencies;
}

const reader = new FileReader();
reader.onload = function(e) {
    const midi = new Midi(e.target.result);
    voices[0].frequencies = toFreq(midi.tracks[LH_track].notes);
    console.log(voices[0].frequencies);
    voices[1].frequencies = toFreq(midi.tracks[LH_track].notes);
    console.log(voices[1].frequencies);
}

function resetVariables() {
    LH_track = +document.getElementById("LH_track").value;
    RH_track = +document.getElementById("RH_track").value;
    midi_file = document.getElementById("midi_file").files[0];
    if (midi_file) {
        reader.readAsArrayBuffer(midi_file);
    }
    paused = false;
}

resetVariables();

function startOscillatorsIfNeccessary() {
    if (!on) { 
        voices[0].oscillator.start();
        voices[1].oscillator.start();
        on = true;
        console.log("oscillators on");
    }
}

function start() {
    resetVariables();
    startOscillatorsIfNeccessary();
}

function pause() {
    paused = true;
    voices[0].oscillator.frequency.value = 0;
    voices[1].oscillator.frequency.value = 0;
}

function resume() {
    paused = false;
}

document.getElementById("start").addEventListener("click", start);
document.getElementById("pause").addEventListener("click", pause);
document.getElementById("resume").addEventListener("click", resume);