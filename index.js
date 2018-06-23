const fs = require('fs');

let createAudioFile = () => {
  return new Promise((resolve, reject) => {
    const record = require('node-record-lpcm16');
    const eos = require('end-of-stream');

    var file = fs.createWriteStream('output.wav', {
      encoding: 'binary'
    })

    record.start().pipe(file)

    eos(file, function (err) {
      // this will be set to the stream instance
      if (err) return console.log('stream had an error or closed early');
      console.log('stream has ended', this === file);
      record.stop()
      resolve('output.wav')
    });

    setTimeout(() => {
      record.stop()
      resolve('output.wav')
    }, 10000);

  });
}


function syncRecognize(filename, encoding, sampleRateHertz, languageCode) {
  return new Promise(async (resolve, reject) => {
    const speech = require('@google-cloud/speech');
    const client = new speech.SpeechClient();

    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    };

    const audio = {
      content: fs.readFileSync(filename).toString('base64'),
    };

    const request = {
      config: config,
      audio: audio,
    };

    let data = await client.recognize(request).catch(err => reject(err))
    const response = data[0]
    const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n')
    resolve(transcription)
  });

}

let recordAndGetTranscription = () => {
  return new Promise(async (resolve, reject) => {
    console.log('----START----');
    let filename = await createAudioFile().catch(err => reject(err))
    let transcription = await syncRecognize(filename, 'LINEAR16', 16000, 'en-GB').catch(err => reject(err))
    console.log('Transcription: ' + transcription)
    resolve(transcription)
    console.log('----DONE----');
  });
}

let run = async () => {
  let transcription = await recordAndGetTranscription()
}

run()
