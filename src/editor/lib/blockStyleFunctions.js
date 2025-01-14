/* @flow */
import {BlockStyleFn, CustomBlockFn} from 'draft-js-import-html';

export const getTextAlignClassName = (contentBlock) => {
  switch (contentBlock.getData().get('textAlign')) {
    case 'ALIGN_LEFT':
      return 'text-align--left';

    case 'ALIGN_CENTER':
      return 'text-align--center';

    case 'ALIGN_RIGHT':
      return 'text-align--right';

    case 'ALIGN_JUSTIFY':
      return 'text-align--justify';

    default:
      return '';
  }
};

export const getTextAlignStyles = (contentBlock) => {
  switch (contentBlock.getData().get('textAlign')) {
    case 'ALIGN_LEFT':
      return {
        style: {
          textAlign: 'left',
        },
      };

    case 'ALIGN_CENTER':
      return {
        style: {
          textAlign: 'center',
        },
      };

    case 'ALIGN_RIGHT':
      return {
        style: {
          textAlign: 'right',
        },
      };

    case 'ALIGN_JUSTIFY':
      return {
        style: {
          textAlign: 'justify',
        },
      };

    default:
      return {};
  }
};

export const getTextAlignBlockMetadata = (element) => {
  switch (element.style.textAlign) {
    case 'right':
      return {
        data: {
          textAlign: 'ALIGN_RIGHT',
        },
      };

    case 'center':
      return {
        data: {
          textAlign: 'ALIGN_CENTER',
        },
      };

    case 'justify':
      return {
        data: {
          textAlign: 'ALIGN_JUSTIFY',
        },
      };

    case 'left':
      return {
        data: {
          textAlign: 'ALIGN_LEFT',
        },
      };

    default:
      return {};
  }
};
