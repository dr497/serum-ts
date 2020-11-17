import React from 'react';
import { Link as MuiLink } from '@material-ui/core';

export default function Link({ external = false, ...props }) {
  let { to, children, ...rest } = props;
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return <MuiLink href={to} {...props} />;
}
