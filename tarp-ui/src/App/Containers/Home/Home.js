import React from 'react';
import { Redirect } from 'react-router-dom';

export default class Home extends React.Component {
  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      newLink: null,
    }
  }

  // Lifecycle hooks
  componentWillMount() {
    this.setState({
      newLink: "/login"
    })
  }

  // Render
  render() {
    if (this.state.newLink) {
      return (
        <Redirect to={this.state.newLink} />
      )
    }
    return (
      <div className="login-wrapper">
      </div>
    );
  }
}
