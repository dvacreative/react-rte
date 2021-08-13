import React from 'react';
import ReactDOM from 'react-dom';
import EditorComp from './editor/EditorComp';

document.addEventListener('DOMContentLoaded', () => {
  let rootNode = document.createElement('div');
  document.body.appendChild(rootNode);
  ReactDOM.render(
    <EditorComp />,
    rootNode,
  );
});
