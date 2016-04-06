import React, { Component } from 'react';
import treeData from './../AnimationData/treeStructure';
import Tree from './Tree';
import Link from './Link';

const d3 = require('d3');

// The goal here was to make React responsible for DOM structure (adding and removing elements)
// and to make D3 responsible for styling, as described in this blog post:
// https://medium.com/@sxywu/on-d3-react-and-a-little-bit-of-flux-88a226f328f3#.ztcxqykek

export default class StructureAnimation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: props.initialTreeData,
      margin: props.initialMargin,
      windowWidth: props.initialWindowWidth,
      windowHeight: props.initialWindowHeight,
    };
  }

  componentDidMount() {
    // This fires on initial load and when the user toggles between the structure and Git views.
    // For some reason, after I toggle, every time I run a command or toggle again,
    // I see an error message in the console about setting state for an unmounted component:
    // "Warning: setState(...): Can only update a mounted or mounting component.
    // This usually means you called setState() on an unmounted component. This is a no-op.
    // Please check the code for the undefined component."
    // I'm not sure what's going on, since cDM shouldn't fire for an unmounted component.
    // However, the tree still renders correctly.
    ipcRenderer.send('ready-for-schema', '\n');
    ipcRenderer.on('direc-schema', (e, arg) => {
      this.updateTree(arg);
    });
  }

  updateTree(newSchema) {
    this.setState({
      treeData: newSchema,
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
    });
  }

  buildStyles(windowWidth, windowHeight, sidebarVisible, margin) {
    const styles = {};

    // Create variables to determine the size of the tree
    // and the size of the SVG containing it (or just the height-width ratio?).
    styles.viewBoxWidth = this.state.windowWidth * 7 / 12; // previously hard-coded as 660
    styles.viewBoxHeight = this.props.sidebarVisible ? this.state.windowHeight * 7 / 24 :
      this.state.windowHeight * 5 / 24;
      // was hard-coded as 300, which looks good if the sidebar and Chrome dev tools are visible
    styles.viewBoxString = `0 0 ${styles.viewBoxWidth} ${styles.viewBoxHeight}`;
    styles.translationValue = `translate(${margin.left}, ${margin.top})`;

    return styles;
  }

  buildTree(viewBoxHeight, viewBoxWidth) {
    const layout = {};

    // Create a tree layout.
    const tree = d3.layout.tree()
    // The first argument below is the maximum x-coordinate D3 will assign.
    // The second argument is the maximum y-coordinate.
    // We're switching width and height here because d3 by default makes trees that branch
    // vertically, and we want a tree that branches horizontally.
    // In other words, nodes that are on the same level will have the same y-coordinate
    // but different x-coordinates.
      .size([viewBoxHeight * 0.9, viewBoxWidth * 0.9]);

    // We know that the first node in the array is the root of the tree.
    // Let's designate its initial coordinates - where it should enter.
    const root = this.state.treeData[0];
    root.x0 = viewBoxHeight / 2;
    root.y0 = 0;

    // The next line creates and returns an array of nodes associated with the specified root node.
    // (The returned array is basically a flattened version of treeData.)
    // Before the next line runs, each node has children, level, name, and value properties.
    // After the next line runs, each node also has parent, depth, x, and y properties.
    // (D3 tree nodes always have parent, child, depth, x, and y properties.)
    // We will pass one node from this array to each Tree as props.data.
    layout.nodes = tree.nodes(root);
    // This line creates and returns an array of objects representing all parent-child links
    // in the nodes array we just created.
    layout.linkSelection = tree.links(layout.nodes);

    layout.nodes.forEach(d => {
      // The default y-coordinates provided by d3.tree will make the tree stretch
      // all the way across the screen.
      // We want to compress the tree a bit so that there's room for file/directory names
      // to the right of the deepest level.
      d.y *= 0.8;
      // We could scale d.x too to prevent the svg from cutting off notes at the top and bottom
      // of a node column.
      // If the node has a parent, set its initial coordinates to the parent's initial coordinates.
      // In other words, the parent and child should enter from the same place.
      if (d.parent) {
        d.x0 = d.parent.x0;
        d.y0 = d.parent.y0;
      }
    });

    return layout;
  }

  render() {
    const styles = this.buildStyles(this.state.windowWidth, this.state.windowHeight,
      this.state.sidebarVisible, this.state.margin);

    const layout = this.buildTree(styles.viewBoxHeight, styles.viewBoxWidth);

    // I think it makes sense to the use target.name as an id,
    // because no two links should ever point to the same target.
    // If needed, though, we could use {link.source.name + '/'  link.target.name} instead.
    // We sometimes receive directory names with slashes and sometimes receive them without,
    // so I'm removing any slash before using the name as a key.
    // I added the trim to account for the fact that the name values sometime begin with a carriage
    // return for some reason, and that throws things off.

    let counter = 1;
    const trees = layout.nodes && layout.nodes.map((node) => {
      node.index = counter;
      counter ++;
      if (!node.yUnchanged) node.yUnchanged = node.y;
      if (node.index % 2 === 1) node.y = node.yUnchanged * 0.9;
      node.name = node.name.trim();
      const nameEndsWithSlash = node.name.indexOf('/') === node.name.length - 1;
      const key = nameEndsWithSlash ? node.name.slice(0, node.name.length - 1) : node.name;
      return (<Tree key={key} data={node} />);
    });

    const links = layout.linkSelection && layout.linkSelection.map((link) => {
      // link.index = link.target.index; // Can we use this to adjust the diagonal?
      // The two lines below work.
      // By editing each link.target when declaring links rather than editing each node when
      // declaring const, am I avoiding editing the parent's d.y?
      // if (!link.target.yUnchanged) link.target.yUnchanged = link.target.y;
      // if (link.target.index % 2 === 1) link.target.y = link.target.yUnchanged * 0.9;
      link.target.name = link.target.name.trim();
      const nameEndsWithSlash = link.target.name.indexOf('/') === link.target.name.length - 1;
      const key = nameEndsWithSlash ? link.target.name.slice(0, link.target.name.length - 1) :
        link.target.name;
      return (<Link key={key} data={link} />);
    });

    // If you want to see the size of the SVG, add this code before the links and trees:
    // <rect x='0' y='0' width={viewBoxWidth - this.state.margin.left}
    // height={viewBoxHeight - this.state.margin.top} rx='15' ry='15' />
    // How does the svg know to fill the full width of its containing div? I'm not sure about this.
    return (
      <div id="Structure-Animation">
        <svg viewBox={styles.viewBoxString}>
          <g transform={styles.translationValue}>
            {links}
            {trees}
          </g>
        </svg>
      </div>
    );
  }
}

StructureAnimation.defaultProps = {
  initialTreeData: treeData,
  // We're not currently using the right or bottom margins.
  initialMargin: { top: 8, right: 20, bottom: 0, left: 90 },
  // The initial window dimensions are specified in app.on('ready') in main.js.
  initialWindowWidth: 1200,
  initialWindowHeight: 700,
};

StructureAnimation.propTypes = {
  initialTreeData: React.PropTypes.array,
  initialMargin: React.PropTypes.object,
  initialWindowWidth: React.PropTypes.number,
  initialWindowHeight: React.PropTypes.number,
  sidebarVisible: React.PropTypes.bool,
};
