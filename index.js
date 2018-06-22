function streamingMicRecognize(encoding, sampleRateHertz, languageCode) {

  // Import Modules
  const record = require('node-record-lpcm16');
  const { exec } = require('child_process');
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();
  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    },
    interimResults: false // If you want interim results, set this to true
  };

  // Create a recognize stream
  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', (data) => {
      exec('clear', function callback(error, stdout, stderr) {
        if (data.results[0] && data.results[0].alternatives[0]) {
          process.stdout.write(`${JSON.stringify(data.results[0].alternatives[0])}\n`)
          recognizeStream.end()
          streamingMicRecognize('LINEAR16', 16000, 'en-GB')
        } else {
          process.stdout.write(`\n\nReached transcription time limit, press Ctrl+C\n`)
        }
      });
    });

  // Start recording and send the microphone input to the Speech API
  record.start({
      sampleRateHertz: sampleRateHertz,
      threshold: 0,
      // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
      verbose: false,
      recordProgram: 'rec', // Try also "arecord" or "sox"
      silence: '0.3'
    })
    .on('error', console.error)
    .pipe(recognizeStream);
  // [END speech_streaming_mic_recognize
}

// Call the function
streamingMicRecognize('LINEAR16', 16000, 'en-GB')

