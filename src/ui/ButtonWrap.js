/* @flow */

import React from 'react';
import cx from 'classnames';

import styles from './ButtonWrap.css';

export default function ButtonWrap(props) {
  let className = cx(props.className, styles.root);
  return <div {...props} className={className} />;
}
