// @flow
import * as React from "react";

type NavSectionProps = {
  children: React.ChildrenArray<React.Element<any>>
};

export class NavSection extends React.Component<NavSectionProps, null> {
  render() {
    return (
      <ul>
        {React.Children.map(this.props.children, child => <li>{child}</li>)}
        <style jsx>{`
          ul {
            margin: 0 auto;
            padding: 4px 16px;
            display: flex;
            justify-content: space-between;
          }
          li {
            display: flex;
            padding: 6px 8px;
          }
        `}</style>
      </ul>
    );
  }
}

type NavProps = {
  children: React.ChildrenArray<React.Element<any>>
};

// TODO: Determine how we'll allow overriding the default style / providing style

export class Nav extends React.Component<NavProps, null> {
  render() {
    return (
      <nav>
        <ul>
          {React.Children.map(this.props.children, child => <li>{child}</li>)}
        </ul>

        <style jsx>{`
          nav {
            text-align: center;
          }
          ul {
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
          }
          nav > ul {
            padding: 4px 16px;
          }
          li {
            display: flex;
            padding: 6px 8px;
            box-sizing: border-box;
          }
        `}</style>
      </nav>
    );
  }
}

export default Nav;
