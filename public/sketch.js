const socket = io();

let clientNumUsers;

//SOUND
let noise;
let eq;

//DRAWING
let canvas;

let bkgR = 0;
let bkgG = 0;
let bkgB = 0;

//DOM
let join;
let stop;
let S1freq;
let S1res;
let S1gain;

function setup() {
    noise = new p5.Noise('pink');

    eq = new p5.Filter();
    eq.setType("peaking");
    eq.freq(1000);
    eq.res(100);
    eq.gain(20);
    eq.process(noise);

    canvas = createCanvas(windowWidth, windowHeight);
    canvas.addClass("canvas");

    join = createButton('JOIN');
    stop = createButton('STOP');
    join.addClass('button');
    stop.addClass('button');
    join.parent('btn-container');
    stop.parent('btn-container');

    join.mousePressed(joinExp);
    stop.mousePressed(stopNoise);

    S1freq = createSlider(10, 10000, 1000, 1);
    S1res = createSlider(0.1, 1, 0, 0.01);
    S1gain = createSlider(-50, 50, 0, 1);
    S1freq.addClass("slider");
    S1res.addClass("slider");
    S1gain.addClass("slider");
    S1freq.parent("slider-container");
    S1res.parent("slider-container");
    S1gain.parent("slider-container");
}

function joinExp() {
    noise.start();
}

function stopNoise() {
    noise.stop();
}

function draw() {
    background(bkgR, bkgG, bkgB);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mouseDragged() {
    changeFrequency();
    changeBackground();
}

function changeFrequency() {
    eq.freq(S1freq.value());
    eq.res(S1res.value());
    eq.gain(S1gain.value());

    socket.emit("freqChange", {
        freq: eq.freq(),
        res: eq.res(),
        gain: eq.gain()
    });
}

function changeBackground() {
    bkgR = map(S1freq.value(), 10, 10000, 0, 255);
    bkgG = map(S1res.value(), 0.1, 1, 0, 255);
    bkgB = map(S1gain.value(), -50, 50, 0, 255);

    socket.emit("bkgChange", {
        r: bkgR,
        g: bkgG,
        b: bkgB
    });
}

socket.on("freqChange", (data) => {
    eq.freq(data.freq);
    eq.res(data.res);
    eq.gain(-data.gain / (clientNumUsers - 1));
});

socket.on("bkgChange", (data) => {
    bkgR = 255 - data.r / (clientNumUsers - 1);
    bkgG = 255 - data.g / (clientNumUsers - 1);
    bkgB = 255 - data.b / (clientNumUsers - 1);
});

socket.on("userAdded", (data) => {
    clientNumUsers = data.numUsers;
});

socket.on("userLeft", (data) => {
    clientNumUsers = data.numUsers;
});