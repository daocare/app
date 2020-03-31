import React, { useState } from 'react';
import useInterval from '../../utils/useInterval';

const EllipsisLoader = props => {
  const [inlineLoader, setInlineLoader] = useState('.  ');
  useInterval(async () => {
    if (inlineLoader == '.  ') {
      setInlineLoader('.. ');
    } else if (inlineLoader == '.. ') {
      setInlineLoader('...');
    } else if (inlineLoader == '...') {
      setInlineLoader('.  ');
    }
  }, 300);
  return <span>{inlineLoader}</span>;
};

export default EllipsisLoader;
