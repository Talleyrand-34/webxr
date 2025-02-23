let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const downloadLink = document.getElementById("downloadLink");

startBtn.addEventListener("click", async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            const audioURL = URL.createObjectURL(audioBlob);
            downloadLink.href = audioURL;
            downloadLink.style.display = "inline";
            downloadLink.textContent = "Download Recording";
            audioChunks = []; // Reset for next recording

            const fd = new FormData();
            fd.append("file", audioBlob, "recording.wav");

            const address = window.location.hostname
            const port = "5000"
            const endpoint = "/upload"
            const url = `http://${address}:${port}${endpoint}`

            fetch(url, { method: "POST", body: fd })
                .then((response) => response.json())
                .then((data) => console.log("Upload successful:", data))
                .catch((err) => console.error("Error uploading audio:", err));
        };

        mediaRecorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    } catch (err) {
        alert("Error accessing microphone: " + err.message);
    }
});

stopBtn.addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;

        // Releasing the microphone
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
});