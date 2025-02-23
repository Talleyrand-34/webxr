AFRAME.registerComponent('audio-recorder', {
  init: function() {
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordButton = document.querySelector('#recordButton');
    this.summary1 = document.querySelector('#summary1').querySelector('[text]');
    this.summary2 = document.querySelector('#summary2').querySelector('[text]');

    // Bind methods
    this.toggleRecording = this.toggleRecording.bind(this);
    this.onDataAvailable = this.onDataAvailable.bind(this);
    this.onRecordingStop = this.onRecordingStop.bind(this);

    // Add click listener to record button
    this.recordButton.addEventListener('click', this.toggleRecording);
  },

  toggleRecording: function() {
    if (!this.isRecording) {
      // Start recording
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          this.summary1.setAttribute('text', 'value', 'Recording started...');
          this.summary2.setAttribute('text', 'value', 'Speak now');
          
          // Try different MIME types for better compatibility
          const mimeTypes = [
            'audio/webm',
            'audio/mp4',
            'audio/wav',
            'audio/ogg'
          ];
          
          let options = {
            mimeType: null,
            audioBitsPerSecond: 16000
          };
          
          // Find the first supported MIME type
          for (let type of mimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
              options.mimeType = type;
              break;
            }
          }
          
          try {
            this.mediaRecorder = new MediaRecorder(stream, options);
          } catch (e) {
            this.mediaRecorder = new MediaRecorder(stream);
          }
          
          this.mediaRecorder.addEventListener('dataavailable', this.onDataAvailable);
          this.mediaRecorder.addEventListener('stop', this.onRecordingStop);
          
          this.audioChunks = [];
          // Request smaller chunks more frequently for better reliability
          this.mediaRecorder.start(100);
          this.isRecording = true;
          
          // Update button text
          this.recordButton.querySelector('[text]').setAttribute('text', 'value', 'Stop Recording');
          this.recordButton.querySelector('[material]').setAttribute('material', 'color', '#ff4444');
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
          this.summary1.setAttribute('text', 'value', 'Error accessing microphone');
          this.summary2.setAttribute('text', 'value', 'Please ensure microphone permissions are granted');
        });
    } else {
      // Stop recording
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.isRecording = false;
      
      // Reset button appearance
      this.recordButton.querySelector('[text]').setAttribute('text', 'value', 'Record Audio');
      this.recordButton.querySelector('[material]').setAttribute('material', 'color', '#444444');
    }
  },

  onDataAvailable: function(event) {
    // Always check data size and type before pushing
    if (event.data && event.data.size > 0) {
      this.audioChunks.push(event.data);
    }
  },

  onRecordingStop: function() {
    this.summary1.setAttribute('text', 'value', 'Processing audio...');
    
    // Get the MIME type that was actually used
    const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
    
    // Create blob with the detected type
    const audioBlob = new Blob(this.audioChunks, { type: mimeType });
    const fd = new FormData();
    fd.append("file", audioBlob, `recording.${mimeType.split('/')[1]}`);

    const ip = "10.20.30.185";
    const port = "9000";
    const endpoint = "/upload";
    const url = `https://${ip}:${port}${endpoint}`;

    fetch(url, { 
      method: "POST", 
      body: fd 
    })
    .then(response => {
      console.log('Server response status:', response.status);
      console.log('Server response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        // Detailed error analysis based on status code
        switch (response.status) {
          case 404:
            throw new Error('Server endpoint not found. Check if server is running and URL is correct');
          case 413:
            throw new Error('Audio file too large for server');
          case 415:
            throw new Error('Server does not support this audio format');
          case 500:
            throw new Error('Server internal error');
          case 503:
            throw new Error('Server is unavailable');
          default:
            throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      return response.json();
    })
    .then(() => {
      console.log('Audio upload successful');
      alert('Audio uploaded successfully!');
      this.summary1.setAttribute('text', 'value', 'Audio sent successfully!');
      this.summary2.setAttribute('text', 'value', `Audio duration: ${(audioBlob.size / 16000).toFixed(1)}s`);
    })
    .catch(error => {
      // Detailed error logging
      console.error('=== Audio Upload Error Analysis ===');
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      
      // Network error analysis
      if (error instanceof TypeError) {
        console.error('Network Error Details:');
        console.error('- This might be a CORS issue, network connectivity problem, or invalid URL');
        console.error('- Target URL:', url);
        console.error('- Audio blob size:', audioBlob.size, 'bytes');
        console.error('- Audio MIME type:', mimeType);
        alert(`Network Error: Cannot connect to server. Check your internet connection and server status.`);
      } 
      // Server error analysis
      else if (error.message.includes('HTTP error')) {
        console.error('Server Error Details:');
        console.error('- The server rejected the request');
        console.error('- Check server logs for more information');
        alert(`Server Error: ${error.message}`);
      }
      // Blob/FormData error analysis
      else if (error instanceof DOMException) {
        console.error('Data Processing Error:');
        console.error('- Error processing audio data');
        console.error('- Browser might not support the audio format');
        alert(`Data Error: Problem processing audio data. Format might not be supported.`);
      }
      // Unknown errors
      else {
        console.error('Unknown Error Type:');
        console.error('- Full error object:', error);
        alert(`Unknown Error: ${error.message}`);
      }

      // Additional debugging info
      console.error('Browser Info:', navigator.userAgent);
      console.error('Audio Recording Stats:');
      console.error('- Number of chunks:', this.audioChunks.length);
      console.error('- Total size:', audioBlob.size, 'bytes');
      console.error('- MIME type used:', mimeType);
      console.error('================================');

      this.summary1.setAttribute('text', 'value', 'Error sending audio');
      this.summary2.setAttribute('text', 'value', `Error: ${error.message.slice(0, 30)}...`);
    });
  },

  remove: function() {
    this.recordButton.removeEventListener('click', this.toggleRecording);
    if (this.mediaRecorder) {
      this.mediaRecorder.removeEventListener('dataavailable', this.onDataAvailable);
      this.mediaRecorder.removeEventListener('stop', this.onRecordingStop);
    }
  }
}); 