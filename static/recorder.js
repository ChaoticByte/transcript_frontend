// Copyright (c) 2024 Julian Müller (ChaoticByte)
"use strict";

export class Recorder {
    constructor(startBtn, stopBtn, callback) {
        this.supported = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
        console.assert(this.supported, "Recording Audio is not supported on this device.");
        this.startBtn = startBtn;
        this.stopBtn = stopBtn;
        this.callback = callback;
        this.initialized = false;
    }
    async init() {
        console.assert(!this.initialized, "Tried to initialize Recorder that was already initialized.");
        if (this.initialized) { return null }
        await navigator.mediaDevices.getUserMedia({"audio": true}).then(stream => {
            let chunks = [];
            this.startBtn.classList.remove("nodisplay");
            this.stopBtn.classList.add("nodisplay");
            const recorder = new MediaRecorder(stream);
            this.startBtn.onclick = () => {
                this.startBtn.classList.add("nodisplay");
                this.stopBtn.classList.remove("nodisplay");
                recorder.start();
            }
            this.stopBtn.onclick = () => {
                recorder.stop();
            }
            recorder.onstart = () => {
                chunks = []; // reset chunks on new recording
            }
            recorder.onstop = e => {
                const blob = new Blob(chunks, {type: "audio/ogg; codecs=opus"})
                this.startBtn.classList.remove("nodisplay");
                this.stopBtn.classList.add("nodisplay");
                this.callback(blob);
            }
            recorder.ondataavailable = e => {
                chunks.push(e.data);
            }
        }, () => { console.error("Could not initialize Audio Recorder.") })
    }
}
