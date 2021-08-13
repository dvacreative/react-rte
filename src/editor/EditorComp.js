/* @flow */
import React, { Component } from 'react';
import {
  CompositeDecorator,
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  Entity,
} from 'draft-js';
import getDefaultKeyBinding from 'draft-js/lib/getDefaultKeyBinding';
import {
  getTextAlignBlockMetadata,
  getTextAlignClassName,
  getTextAlignStyles,
} from './lib/blockStyleFunctions';
import changeBlockDepth from './lib/changeBlockDepth';
import changeBlockType from './lib/changeBlockType';
import getBlocksInSelection from './lib/getBlocksInSelection';
import insertBlockAfter from './lib/insertBlockAfter';
import isListItem from './lib/isListItem';
import isSoftNewlineEvent from 'draft-js/lib/isSoftNewlineEvent';
import EditorToolbar from './lib/EditorToolbar';
import EditorValue from './lib/EditorValue';
import LinkDecorator from './lib/LinkDecorator';
import ImageDecorator from './lib/ImageDecorator';
import cx from 'classnames';
import autobind from 'class-autobind';
import EventEmitter from 'events';
import { BLOCK_TYPE } from 'draft-js-utils';
import composite from './lib/composite';

import './Draft.global.css';
import styles from './RichTextEditor.scss';

import ButtonGroup from './ui/ButtonGroup';
import Button from './ui/Button';
import Dropdown from './ui/Dropdown';

const MAX_LIST_DEPTH = 2;

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: '#f3f3f3',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

export default class EditorComp extends Component {
  constructor() {
    super(...arguments);
    this._keyEmitter = new EventEmitter();
    autobind(this);
    this.state = {
      value: createEmptyValue(),
      format: 'html',
    };
  }

  componentDidMount() {
    const { autoFocus } = this.props;
    if (!autoFocus) {
      return;
    }
    this._focus();
  }

  render() {
    const value = this.state.value;
    const className = 'react-rte-demo';
    const toolbarClassName = 'demo-toolbar';
    const editorClassName = 'demo-editor';
    const placeholder = '...';

    let editorState = value.getEditorState();

    // If the user changes block type before entering any text, we can either
    // style the placeholder or hide it. Let's just hide it for now.
    let combinedEditorClassName = cx(
      {
        [styles.editor]: true,
        [styles.hidePlaceholder]: this._shouldHidePlaceholder(),
      },
      editorClassName
    );

    let editorToolbar = (
      <EditorToolbar
        className={toolbarClassName}
        keyEmitter={this._keyEmitter}
        editorState={editorState}
        onChange={this._onChange}
        focusEditor={this._focus}
      />
    );
    let textAlign = getTextAlignClassName
    return (
      <div className={cx(styles.root, className)}>
        {editorToolbar}
        <div className={combinedEditorClassName}>
          <input
            className={styles.currentTitle}
            placeholder="Untitled"
            name="currentTitle"
          />
          <Editor
            customStyleMap={styleMap}
            blockStyleFn={composite(defaultBlockStyleFn, getTextAlignClassName)}
            editorState={editorState}
            handleReturn={this._handleReturn}
            keyBindingFn={this._customKeyHandler}
            handleKeyCommand={this._handleKeyCommand}
            onTab={this._onTab}
            onChange={this._onChange}
            placeholder="..."
            ariaLabel={placeholder || 'Edit text'}
            ref={(el) => {
              this.editor = el;
            }}
            spellCheck={true}
          />
        </div>
      </div>
    );
  }

  _shouldHidePlaceholder() {
    let editorState = this.state.value.getEditorState();
    let contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        return true;
      }
    }
    return false;
  }

  _handleReturn(event) {
    let { handleReturn } = this.props;
    if (handleReturn != null && handleReturn(event)) {
      return true;
    }
    if (this._handleReturnSoftNewline(event)) {
      return true;
    }
    if (this._handleReturnEmptyListItem()) {
      return true;
    }
    if (this._handleReturnSpecialBlock()) {
      return true;
    }
    return false;
  }

  // `shift + return` should insert a soft newline.
  _handleReturnSoftNewline(event) {
    let editorState = this.state.value.getEditorState();
    if (isSoftNewlineEvent(event)) {
      let selection = editorState.getSelection();
      if (selection.isCollapsed()) {
        this._onChange(RichUtils.insertSoftNewline(editorState));
      } else {
        let content = editorState.getCurrentContent();
        let newContent = Modifier.removeRange(content, selection, 'forward');
        let newSelection = newContent.getSelectionAfter();
        let block = newContent.getBlockForKey(newSelection.getStartKey());
        newContent = Modifier.insertText(
          newContent,
          newSelection,
          '\n',
          block.getInlineStyleAt(newSelection.getStartOffset()),
          null
        );
        this._onChange(
          EditorState.push(editorState, newContent, 'insert-fragment')
        );
      }
      return true;
    }
    return false;
  }

  // If the cursor is in an empty list item when return is pressed, then the
  // block type should change to normal (end the list).
  _handleReturnEmptyListItem() {
    let editorState = this.state.value.getEditorState();
    let selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      let contentState = editorState.getCurrentContent();
      let blockKey = selection.getStartKey();
      let block = contentState.getBlockForKey(blockKey);
      if (isListItem(block) && block.getLength() === 0) {
        let depth = block.getDepth();
        let newState =
          depth === 0
            ? changeBlockType(editorState, blockKey, BLOCK_TYPE.UNSTYLED)
            : changeBlockDepth(editorState, blockKey, depth - 1);
        this._onChange(newState);
        return true;
      }
    }
    return false;
  }

  // If the cursor is at the end of a special block (any block type other than
  // normal or list item) when return is pressed, new block should be normal.
  _handleReturnSpecialBlock() {
    let editorState = this.state.value.getEditorState();
    let selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      let contentState = editorState.getCurrentContent();
      let blockKey = selection.getStartKey();
      let block = contentState.getBlockForKey(blockKey);
      if (!isListItem(block) && block.getType() !== BLOCK_TYPE.UNSTYLED) {
        // If cursor is at end.
        if (block.getLength() === selection.getStartOffset()) {
          let newEditorState = insertBlockAfter(
            editorState,
            blockKey,
            BLOCK_TYPE.UNSTYLED
          );
          this._onChange(newEditorState);
          return true;
        }
      }
    }
    return false;
  }

  _onTab(event) {
    let editorState = this.state.value.getEditorState();
    let newEditorState = RichUtils.onTab(event, editorState, MAX_LIST_DEPTH);
    if (newEditorState !== editorState) {
      this._onChange(newEditorState);
    }
  }

  _customKeyHandler(event) {
    // Allow toolbar to catch key combinations.
    let eventFlags = {};
    this._keyEmitter.emit('keypress', event, eventFlags);
    if (eventFlags.wasHandled) {
      return null;
    } else {
      return getDefaultKeyBinding(event);
    }
  }

  _handleKeyCommand(command) {
    let editorState = this.state.value.getEditorState();
    let newEditorState = RichUtils.handleKeyCommand(editorState, command);
    if (newEditorState) {
      this._onChange(newEditorState);
      return true;
    } else {
      return false;
    }
  }

  onChange(value) {
    this.setState({ value });
  }

  _onChange(editorState) {
    let value = this.state.value;
    let onChange = this.onChange;
    if (onChange == null) {
      return;
    }
    let newValue = value.setEditorState(editorState);
    let newEditorState = newValue.getEditorState();
    this._handleInlineImageSelection(newEditorState);
    onChange(newValue);
  }

  _handleInlineImageSelection(editorState) {
    let selection = editorState.getSelection();
    let blocks = getBlocksInSelection(editorState);

    const selectImage = (block, offset) => {
      const imageKey = block.getEntityAt(offset);
      Entity.mergeData(imageKey, { selected: true });
    };

    let isInMiddleBlock = (index) => index > 0 && index < blocks.size - 1;
    let isWithinStartBlockSelection = (offset, index) =>
      index === 0 && offset > selection.getStartOffset();
    let isWithinEndBlockSelection = (offset, index) =>
      index === blocks.size - 1 && offset < selection.getEndOffset();

    blocks.toIndexedSeq().forEach((block, index) => {
      ImageDecorator.strategy(block, (offset) => {
        if (
          isWithinStartBlockSelection(offset, index) ||
          isInMiddleBlock(index) ||
          isWithinEndBlockSelection(offset, index)
        ) {
          selectImage(block, offset);
        }
      });
    });
  }

  _focus() {
    this.editor.focus();
  }
}

function defaultBlockStyleFn(block) {
  let result = styles.block;
  switch (block.getType()) {
    case 'unstyled':
      return cx(result, styles.paragraph);
    case 'blockquote':
      return cx(result, styles.blockquote);
    case 'code-block':
      return cx(result, styles.codeBlock);
    default:
      return result;
  }
}

const decorator = new CompositeDecorator([LinkDecorator, ImageDecorator]);

function createEmptyValue() {
  return EditorValue.createEmpty(decorator);
}

// need to fix
function createValueFromString(markup, format, options) {
  return EditorValue.createFromString(markup, format, decorator, options);
}

// $FlowIssue - This should probably not be done this way.
Object.assign(EditorComp, {
  EditorValue,
  decorator,
  createEmptyValue,
  createValueFromString,
  ButtonGroup,
  Button,
  Dropdown,
});

export {
  EditorValue,
  decorator,
  createEmptyValue,
  createValueFromString,
  getTextAlignBlockMetadata,
  getTextAlignClassName,
  getTextAlignStyles,
  ButtonGroup,
  Button,
  Dropdown,
};
