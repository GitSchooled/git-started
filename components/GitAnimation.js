import React, {Component} from 'react';
const gitgraph = require('gitgraph.js')
import { createStore } from 'redux';


export default class GitAnimation extends Component {

  gitGraphMaker(dag){
    var gitgraph = new GitGraph({
    template: "metro", // or blackarrow
    orientation: "horizontal",
    author: "John Doe",
    mode: "extended" // or compact if you don't want the messages
    });
    console.log(dag);
    // TODO fix this ish
    // var master = gitgraph.branch("master");
    // var counter = 0;
    // for (var namehash in dag.vertices) {
    //   console.log(namehash.incomingNames);
    //   // if (namehash.incomingNames.length > 1) gitgraph.branch(namehash)
    //   gitgraph.commit(namehash + dag.vertices[dag.names[counter].value])
    //   counter++;
    // }
  }

  componentDidMount(){
    ipcRenderer.on('git-graph', (event, arg) => {
      this.gitGraphMaker(arg);
    });
  }

  render() {

    return (
      //JSX
      <div>We will show a Git animation here
        <canvas id="gitGraph"></canvas>
      </div>

    )
  }
}
