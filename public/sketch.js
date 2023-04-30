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
let sliderFreq;
let sliderRes;
let sliderGain;

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

    sliderFreq = createSlider(10, 10000, 1000, 1);
    sliderRes = createSlider(0.1, 1, 0, 0.01);
    sliderGain = createSlider(-50, 50, 0, 1);
    sliderFreq.addClass("slider");
    sliderRes.addClass("slider");
    sliderGain.addClass("slider");
    sliderFreq.parent("slider-container");
    sliderRes.parent("slider-container");
    sliderGain.parent("slider-container");
}

function draw() {
    background(bkgR, bkgG, bkgB);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

//CALLBACK LAND--------------------------------------------

function joinExp() {
    noise.start();
}

function stopNoise() {
    noise.stop();
}

function mouseDragged() {
    changeFrequency();
    changeBackground();
}

function changeFrequency() {
    eq.freq(sliderFreq.value());
    eq.res(sliderRes.value());
    eq.gain(sliderGain.value());

    socket.emit("freqChange", {
        freq: eq.freq(),
        res: eq.res(),
        gain: eq.gain()
    });
}

function changeBackground() {
    bkgR = map(sliderFreq.value(), 10, 10000, 0, 255);
    bkgG = map(sliderRes.value(), 0.1, 1, 0, 255);
    bkgB = map(sliderGain.value(), -50, 50, 0, 255);

    socket.emit("bkgChange", {
        r: bkgR,
        g: bkgG,
        b: bkgB
    });
}

//SOCKET.IO------------------------------------------------

socket.on("freqChange", (data) => {
    /*When receiving this event, apply a complementary 
    eq curve at the same frequency and with the same Q 
    factor, but with a gain value which is opposite and
    scaled, based on the number of users connected*/
    eq.freq(data.freq);
    eq.res(data.res);
    eq.gain(-data.gain / (clientNumUsers - 1));
});

socket.on("bkgChange", (data) => {
    /*When receiving this event, set the background 
    colour with rgb values that are complementary to 
    those received, scaling the value based on the 
    number of users connected*/
    bkgR = 255 - data.r / (clientNumUsers - 1);
    bkgG = 255 - data.g / (clientNumUsers - 1);
    bkgB = 255 - data.b / (clientNumUsers - 1);
});

/*Keep track of the number of users */
socket.on("userAdded", (data) => {
    clientNumUsers = data.numUsers;
});

socket.on("userLeft", (data) => {
    clientNumUsers = data.numUsers;
});