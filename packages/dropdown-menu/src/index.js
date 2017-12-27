// @flow
/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */

import * as React from "react";

type DropdownMenuProps = {
  children: React.ChildrenArray<React.Element<any>>
};

type DropdownMenuState = {
  menuHidden: boolean
};

export class DropdownMenu extends React.Component<
  DropdownMenuProps,
  DropdownMenuState
> {
  constructor(props: *) {
    super(props);
    this.state = {
      menuHidden: true
    };
  }

  render() {
    return (
      <div className="dropdown">
        {React.Children.map(this.props.children, child => {
          if (child.type === DropdownTrigger) {
            return React.cloneElement(child, {
              onClick: ev => {
                this.setState({ menuHidden: !this.state.menuHidden });
              }
            });
          } else if (child.type === DropdownContent) {
            if (this.state.menuHidden) {
              return null;
            } else {
              // DropdownContent child will pass down an onItemClick so that
              // the menu will collapse
              return React.cloneElement(child, {
                onItemClick: ev => {
                  this.setState({ menuHidden: true });
                }
              });
            }
          } else {
            // fallback
            return child;
          }
        })}
        <style jsx>{`
          .dropdown {
            display: inline-block;
          }
        `}</style>
      </div>
    );
  }
}

export class DropdownTrigger extends React.Component<{
  children: React.ChildrenArray<React.Element<any>>,
  onClick?: (ev: SyntheticEvent<*>) => void
}> {
  render() {
    return (
      <div onClick={this.props.onClick}>
        {this.props.children}
        <style jsx>{`
          div {
            user-select: none;
            margin: 0px;
            padding: 0px;
          }
        `}</style>
      </div>
    );
  }
}

export class DropdownContent extends React.Component<{
  children: React.ChildrenArray<React.Element<any>>,
  onItemClick: (ev: SyntheticEvent<*>) => void
}> {
  static defaultProps = {
    // Completely silly standalone, because DropdownMenu injects the onItemClick handler
    onItemClick: () => {}
  };

  render() {
    return (
      <div>
        <ul>
          {React.Children.map(this.props.children, child => {
            return React.cloneElement(child, {
              onClick: ev => {
                child.props.onClick(ev);
                // Hide the menu
                this.props.onItemClick(ev);
              }
            });
          })}
        </ul>
        <style jsx>{`
          div {
            user-select: none;
            margin: 0px;
            padding: 0px;

            opacity: 1;
            position: absolute;
            top: 0.2em;
            right: 0;
            border-style: none;
            padding: 0;
            font-family: "Source Sans Pro";
            font-size: 12px;
            line-height: 1.5;
            margin: 20px 0;
            background-color: var(--dropdown-content, #eeedee);
          }

          ul {
            list-style: none;
            text-align: left;
            padding: 0;
            margin: 0;
            opacity: 1;
          }

          :global(li) {
            padding: 0.5rem;
          }

          :global(li:hover) {
            background-color: var(--dropdown-content-hover, #e2dfe3);
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }
}
