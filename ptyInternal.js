const pty = require('pty.js');
const animationDataSchema = require('./AnimationData/StructureSchema')
const getGitData = require('./AnimationData/gitData')

var currDir;
	var ptyTerm = pty.fork('bash', [], {
		name: 'xterm-color',
		cols: 100,
		rows: 100,
		cwd: process.env.HOME,
		env: process.env
	});

  // sets the terminal prompt to pwd
ptyTerm.write(`PROMPT_COMMAND='PS1=$(pwd)" $ "'\r`)
	process.once('message', function(data) {
		animationDataSchema.DataSchema(process.env.HOME)
	});
  process.on('message', function(data) {
		data.message.cols ? ptyTerm.resize(data.message.cols,data.message.rows) :ptyTerm.write(data.message)
  });

  ptyTerm.on('data', function(data) {
    // crude way to find path, need to improve
    process.send({
      data:data
    })
    var re = /\s[$]\s/g;
    if (data.match(re)) {
      var temp = data;
      temp = temp.replace(re,'');
      currDir = temp;
      animationDataSchema.DataSchema(currDir);
			getGitData.gitHistory(currDir);
    }
  });
