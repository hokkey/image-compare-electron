import $ from 'jquery';
const spawn = require('child_process').spawn;

class process {
  constructor(cmd, options, callback) {
    let exe = spawn(cmd, options);

    exe.stdout.on('data', (data) => {
      callback(`${data}`);
    });

    exe.stderr.on('data', (data) => {
      callback(`${data}`);
    });

    exe.on('close', (code) => {
      console(`child process exited with code ${code}`);
    });
  }
}

let output = (text) => {
  document.body.innerHTML += `<pre>${text}</pre>`;
};

$('#button').click((event) => {
  const ls = new process('cowsay', ['hoge'], output);
});
