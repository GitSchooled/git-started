const exec = require('child_process').exec;
const DAG = require('./DAG')

module.exports = {
  gitHistory: function(pwd){
    var that = this;
    var commandForGitHistory = 'cd ' + pwd + ';git log --pretty="%h|%p|%s|%d" --max-count=10';
    exec(commandForGitHistory, (err,stdout,stderr) => {
      if (err) {
        console.log(err.toString());
      } else {
        // splits stdout git log string by new line character
        var stdoutArr = stdout.split('\n');
        // makes each string in stdoutArr a subarray slit at |
        var nestedCommitArr = stdoutArr.map((element) =>{
          return element.split('|');
        })
        // nestedCommitArr = nestedCommitArr.reverse();
        var gitGraph = that.createGraph(nestedCommitArr);
        var graphObj = {gitGraph: gitGraph};
        process.send(graphObj);
        // console.log(graphObj);
      }
    })
  },

  createGraph: function(nestedCommitArr){
    var gitGraph = new DAG();
    for (var i = 0; i < nestedCommitArr.length - 1; i++) {
      if (nestedCommitArr[i][1].match(/\s/)){
        nestedCommitArr[i][1] = nestedCommitArr[i][1].split(/\s/)
      }
        gitGraph.addEdges(nestedCommitArr[i][0],nestedCommitArr[i][2],null, nestedCommitArr[i][1]);
    }
    return gitGraph;
  }
}
