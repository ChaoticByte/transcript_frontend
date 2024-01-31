// Copyright (c) 2024 Julian Müller (ChaoticByte)
"use strict";

import { Recorder } from "./recorder.js";

async function api_is_online(settings) {
    const ping_response = await fetch(settings.api_url + "/ping").catch(_ => {
        return 0;
    });
    return ping_response.status == 200;
}

( async () => {
    // Get Elements
    let startBtn = document.getElementById("startBtn");
    let stopBtn = document.getElementById("stopBtn");
    let audioPrev = document.getElementById("audioPrev");
    let transcribeBtn = document.getElementById("transcribeBtn");
    let transcriptText = document.getElementById("transcript");
    // Load Settings
    const settings_resp = await fetch("settings.json");
    const settings = await settings_resp.json();
    while (settings.api_url.endsWith('/')) {
        settings.api_url = settings.api_url.substring(0, settings.api_url.length - 1);
    }
    if (await api_is_online(settings)) {
        // Recorder
        let audioBlob;
        const recorder = new Recorder(startBtn, stopBtn, async (blob) => {
            audioBlob = blob;
            audioPrev.src = URL.createObjectURL(audioBlob);
            audioPrev.load();
            audioPrev.classList.remove("nodisplay");
            transcribeBtn.classList.remove("nodisplay");
        });
        recorder.init();
        // Additional handlers
        startBtn.addEventListener("click", () => {
            audioPrev.classList.add("nodisplay");
            transcribeBtn.classList.add("nodisplay");
            transcriptText.innerText = "";
        })
        // Transcribe
        transcribeBtn.addEventListener("click", async () => {
            transcribeBtn.disabled = true;
            transcriptText.classList.add("loading");
            const formData = new FormData();
            formData.append("audio", audioBlob);
            let response = await fetch(settings.api_url, {
                method: 'POST',
                body: formData
            });
            let t = await response.text();
            transcriptText.innerText = t;
            transcriptText.classList.remove("loading");
            transcribeBtn.disabled = false;
        });
        // init done.
        startBtn.classList.remove("nodisplay");
    } else {
        transcriptText.innerText = "Can't reach API :("
    }
})();
