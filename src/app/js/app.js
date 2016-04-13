import $ from 'jquery';
import Shell from '../js/class/Shell';
import GMagickTask from '../js/class/GMagickTask';

let list = [
  {
    src: '/Users/hori_yuma/Desktop/workdir/src/1/fil.pdf',
    dest: '/Users/hori_yuma/Desktop/workdir/tmp/1/file_%03d.pdf'
  },
  {
    src: '/Users/hori_yuma/Desktop/workdir/src/2/fie.pdf',
    dest: '/Users/hori_yuma/Desktop/workdir/tmp/2/file_%03d.pdf'
  }
];

let commands = GMagickTask.genCmdStr('splitPdf', list);

commands.forEach((cmd) => {
  try {
    console.log(Shell.exec(cmd));
  } catch (e) {
    console.error(e);
  }
});
