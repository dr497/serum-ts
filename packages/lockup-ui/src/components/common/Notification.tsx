import React from 'react';
import Button from '@material-ui/core/Button';

type Props = {
  signature: string;
};

export function ViewTransactionOnExplorerButton(props: Props) {
  const { signature } = props;
  const urlSuffix = '?cluster=devnet'; // todo
  return (
    <Button
      color="inherit"
      component="a"
      target="_blank"
      rel="noopener"
      href={`https://explorer.solana.com/tx/${signature}` + urlSuffix}
    >
      View on Solana Explorer
    </Button>
  );
}
