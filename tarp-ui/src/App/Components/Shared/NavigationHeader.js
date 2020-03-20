import React, { Component } from 'react'
import { NavLink } from 'react-router-dom';
import SIDEBAR_LINKS from '../../Config/Sidebar';

export default class MainHeader extends Component {

	renderNavLinks(item, index) {
		return (
			<NavLink exact to={item.link} key={index}>
        {item.name}
      </NavLink>
		)
	}

  render() {
    return (
			<div className="Main-Header-Navigation">
				{SIDEBAR_LINKS.map(this.renderNavLinks.bind(this))}
			</div>
    )
  }
}
