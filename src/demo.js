import React from 'react';
import ReactDOM from 'react-dom';
import RichTextEditor from './RichTextEditor';

document.addEventListener('DOMContentLoaded', () => {
  let rootNode = document.createElement('div');
  document.body.appendChild(rootNode);
  ReactDOM.render(
    <RichTextEditor />,
    rootNode,
  );
});
