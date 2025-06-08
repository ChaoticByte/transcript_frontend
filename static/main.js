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
    let copyBtn = document.getElementById("copyBtn");
    // Load Settings
    const settings_resp = await fetch("settings.json");
    const settings = await settings_resp.json();
    while (settings.api_url.endsWith('/')) {
        settings.api_url = settings.api_url.substring(0, settings.api_url.length - 1);
    }
    if (await api_is_online(settings)) {
        // Audio Recorder
        let audioBlob;
        const recorder = new Recorder(startBtn, stopBtn, async (blob) => {
            audioBlob = blob;
            audioPrev.src = URL.createObjectURL(audioBlob);
            audioPrev.load();
            audioPrev.classList.remove("nodisplay");
            transcribeBtn.classList.remove("nodisplay");
        });
        recorder.init();
        // Handlers
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(transcriptText.innerText);
        });
        startBtn.addEventListener("click", () => {
            // Recording
            audioPrev.classList.add("nodisplay");
            transcribeBtn.classList.add("nodisplay");
            transcriptText.innerText = "";
            copyBtn.classList.add("nodisplay");
        });
        transcribeBtn.addEventListener("click", async () => {
            // Transcription
            transcribeBtn.disabled = true;
            transcriptText.classList.add("loading");
            copyBtn.classList.add("nodisplay");
            const formData = new FormData();
            formData.append("audio", audioBlob);
            let response = await fetch(settings.api_url, {
                method: 'POST',
                body: formData
            });
            let t = await response.text();
            transcriptText.innerText = t;
            if (transcriptText.innerText.length > 0) {
                copyBtn.classList.remove("nodisplay");
            }
            transcriptText.classList.remove("loading");
            transcribeBtn.disabled = false;
        });
        // init done.
        startBtn.classList.remove("nodisplay");
    } else {
        transcriptText.innerText = "Can't reach API :("
    }
})();
