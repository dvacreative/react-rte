/* @flow */

import React, {Component} from 'react';
import cx from 'classnames';
import Button from './Button';
import ButtonWrap from './ButtonWrap';

import styles from './IconButton.css';

export default class IconButton extends Component {
  props;

  render() {
    let {props} = this;
    let {className, iconName, label, children, isActive, isSwitch, ...otherProps} = props;
    className = cx(className, {
      [styles.root]: true,
      [styles.isActive]: isActive,
    });
    return (
      <ButtonWrap>
        <Button {...otherProps} title={label} className={className} role={isSwitch && 'switch'} aria-checked={isActive}>
          <span className={styles['icon-' + iconName]} />
          {/* TODO: add text label here with aria-hidden */}
        </Button>
        {children}
      </ButtonWrap>
    );
  }
}
