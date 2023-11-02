import React, { Component } from 'react';

export class ClassComponent extends Component {
  render() {
    return (
      <div>
        <h1>Class Component</h1>
        <p>Props Data: {this.props.data}</p>
        {this.props.children}
      </div>
    );
  }
}
