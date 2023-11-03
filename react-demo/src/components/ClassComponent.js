import React, { Component } from 'react';
import { ChildFunctionalComponent } from './ChildFunctionalComponent';
import { ChildClassComponent } from './ChildClassComponent';

export class ClassComponent extends Component {
  constructor() {
    super();
    this.state = {
      data: 'Value from ClassComponent state',
      count: 0,
    };
    this.componentName = 'Class Component';
    this.incrementCounter = this.incrementCounter.bind(this);
    this.parentFunction = this.parentFunction.bind(this);
  }

  changeState() {
    this.setState(
      {
        data: 'changed value',
      },
      alert('Change state callback fn'),
    );
  }

  incrementCounter() {
    this.setState(
      (prevState, props) => ({
        count: prevState.count + props.data.incrementValue,
      }),
      alert('Increment state callback fn'),
    );
  }

  parentFunction(childName) {
    alert(`${this.componentName} fn being called from ${childName}`);
  }

  render() {
    const { data } = this.props;
    return (
      <div>
        <h1>Class Component</h1>
        <div>Props Data: {data.value}</div>
        <div>Data from parent: {this.props.children}</div>
        <div>
          <div>State Data: {this.state.data}</div>
          <button onClick={() => this.changeState()}>Change State Data</button>
        </div>
        <div>
          <div>State Counter: {this.state.count}</div>
          <button onClick={this.incrementCounter}>Increment Counter</button>
        </div>
        <ChildFunctionalComponent parentFunction={this.parentFunction} />
        <ChildClassComponent parentFunction={this.parentFunction} />
      </div>
    );
  }
}
