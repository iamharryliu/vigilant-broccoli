import React, { Component } from 'react';

export class ClassComponent extends Component {
  constructor() {
    super();
    this.state = {
      data: 'Value from state',
      count: 0,
    };
  }

  changeState() {
    this.setState({
      data: 'changed value',
    });
  }

  incrementCounter() {
    this.setState((prevState, props) => ({
      count: prevState.count + props.data.incrementValue,
    }));
  }

  render() {
    return (
      <div>
        <h1>Class Component</h1>
        {this.props.data.incrementValue}
        <div>Props Data: {this.props.data.value}</div>
        <div>Data from parent: {this.props.children}</div>
        <div>
          <div>State Data: {this.state.data}</div>
          <button onClick={() => this.changeState()}>Change State Data</button>
        </div>
        <div>
          <div>State Counter: {this.state.count}</div>
          <button onClick={() => this.incrementCounter()}>
            increment Counter
          </button>
        </div>
      </div>
    );
  }
}
