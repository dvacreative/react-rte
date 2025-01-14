/* @flow */

import React from 'react';
import cx from 'classnames';

import styles from './ButtonGroup.css';

export default function ButtonGroup(props) {
  let className = cx(props.className, styles.root);
  return (
    <div {...props} className={className} />
  );
}
