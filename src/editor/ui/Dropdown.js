/* @flow */
import React, {Component} from 'react';
import autobind from 'class-autobind';
import cx from 'classnames';

import styles from './Dropdown.css';

export default class Dropdown extends Component {
  props;

  constructor() {
    super(...arguments);
    autobind(this);
  }

  render() {
    let {choices, selectedKey, className, ...otherProps} = this.props;
    className = cx(className, styles.root);
    let selectedItem = (selectedKey == null) ? null : choices.get(selectedKey);
    let selectedValue = selectedItem && selectedItem.label || '';
    return (
      <span className={className} title={selectedValue}>
        <select {...otherProps} value={selectedKey} onChange={this._onChange}>
          {this._renderChoices()}
        </select>
        <span className={styles.value}>{selectedValue}</span>
      </span>
    );
  }

  _onChange(event) {
    let value = event.target.value;
    this.props.onChange(value);
  }

  _renderChoices() {
    let {choices} = this.props;
    let entries = Array.from(choices.entries());
    return entries.map(([key, {label, className}]) => (
      <option key={key} value={key} className={className}>{label}</option>
    ));
  }
}
