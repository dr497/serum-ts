import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { PublicKey } from '@solana/web3.js';
import { State as StoreState } from '../../store/reducer';

type Props = {
  mint?: PublicKey;
  variant?: 'outlined' | 'standard';
  onChange: (from: PublicKey) => void;
};

export default function OwnedTokenAccountsSelect(p: Props) {
  const { mint, variant, onChange } = p;
  const ownedTokenAccounts = useSelector((state: StoreState) => {
    if (!mint) {
      return [];
    }
    return state.common.ownedTokenAccounts.filter(
      ota => ota.account.mint.toString() === mint.toString(),
    );
  });
  const [fromAccount, setFromAccount] = useState('');
  return (
    <Select
      variant={variant}
      fullWidth
      value={fromAccount}
      onChange={e => {
        const pk = e.target.value as string;
        setFromAccount(pk);
        onChange(new PublicKey(pk));
      }}
    >
      {ownedTokenAccounts.length === 0 ? (
        <MenuItem value={''}>No token accounts found</MenuItem>
      ) : (
        ownedTokenAccounts.map(ownedTokenAccount => {
          return (
            <MenuItem value={ownedTokenAccount.publicKey.toString()}>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div>{`${ownedTokenAccount.publicKey}`}</div>
                <div
                  style={{ float: 'right', color: '#ccc' }}
                >{`${ownedTokenAccount.account.amount}`}</div>
              </div>
            </MenuItem>
          );
        })
      )}
    </Select>
  );
}
