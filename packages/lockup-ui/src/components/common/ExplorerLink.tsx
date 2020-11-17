import React from 'react';
import Link from './Link';
import urls from '../../utils/urls';

export const ExplorerAddress = ({ ...props }) => {
  const { address, children, ...rest } = props;
  return (
    <Link to={urls.explorerAddress + address} external {...rest}>
      {children}
    </Link>
  );
};

export const ExplorerTx = ({ ...props }) => {
  const { tx, children, ...rest } = props;
  return (
    <Link to={urls.explorerTx + tx} external {...rest}>
      {children}
    </Link>
  );
};
