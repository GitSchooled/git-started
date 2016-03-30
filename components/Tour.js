import React, {Component} from 'react';

export default class Tour extends Component {

  render() {

    var steps = [
      {
        header: 'Welcome!',
        text: 'Would you like to take a tour of the app?',
        next: 'Yes, please!',
        exit: 'No, thank you.',
        maxWidth: '50%',
        top: '5%',
        left: '25%'
      }, {
        header: 'Terminal:',
        text: 'You can use this terminal emulator just like you would use your normal terminal. Simply type a command and hit your Enter key to see the result!',
        next: 'Continue',
        exit: 'Leave tour',
        maxWidth: '50%',
        top: '55%',
        left: '25%'
      }, {
        header: 'Visualization:',
        text: "In this area, you'll see a visual representation of your current working directory. Use the toggle at the top right to switch to a view of your Git repository.",
        next: 'Continue',
        exit: 'Leave tour',
        maxWidth: '50%',
        top: '5%',
        left: '25%'
      }, {
        header: 'Sidebar:',
        text: "You can show or hide this sidebar by clicking the settings icon at the top left. You can also choose a guided tutorial if you'd like to learn more about Git and the command line.",
        next: 'Repeat tour',
        exit: 'End tour',
        maxWidth: '10%',
        bottom: '5%',
        left: '2.5%'
      }
    ];

    var currentStep = steps[this.props.tourPosition];

    var style = {};
    style.backgroundColor = 'white';
    style.padding = '16px';
    style.border = '3px solid black'
    style.borderRadius = '15px';
    style.position = 'fixed';
    style.maxWidth = currentStep.maxWidth;
    if (currentStep.top) style.top = currentStep.top;
    if (currentStep.bottom) style.bottom = currentStep.bottom;
    style.left = currentStep.left;
    // Thank goodness this basically works!

    return (
      <div style={style}>
        <p><strong>{currentStep.header}</strong> {currentStep.text}</p>
        <button onClick={this.props.advance}>{currentStep.next}</button>
        <br />
        <button onClick={this.props.hide}>{currentStep.exit}</button>
      </div>
    )
  }
}
