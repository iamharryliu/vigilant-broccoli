import React, { Component } from 'react';

export class ChildClassComponent extends Component {
  constructor() {
    super();
    this.componentName = 'Child Class Component';
  }
  render() {
    return (
      <div>
        <button onClick={() => this.props.parentFunction(this.componentName)}>
          Child Class Component Button
        </button>
      </div>
    );
  }
}
