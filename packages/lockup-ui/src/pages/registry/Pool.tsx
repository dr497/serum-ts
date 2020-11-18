import React from 'react';
import { useSelector } from 'react-redux';
import { MintInfo, AccountInfo as TokenAccount } from '@solana/spl-token';
import { Basket } from '@project-serum/pool';
import BN from 'bn.js';
import { useWallet } from '../../components/common/Wallet';
import { State as StoreState } from '../../store/reducer';

export default function Pool() {
  const { wallet } = useWallet();
  const {
    pool,
    poolTokenMint,
    poolVault,
    megaPool,
    megaPoolTokenMint,
    megaPoolVaults,
  } = useSelector((state: StoreState) => {
    return {
      pool: state.registry.pool,
      poolTokenMint: state.registry.poolTokenMint,
      poolVault: state.registry.poolVault,
      megaPool: state.registry.megaPool,
      megaPoolTokenMint: state.registry.megaPoolTokenMint,
      megaPoolVaults: state.registry.megaPoolVaults,
    };
  });

  const prices = new PoolPrices({
    poolVault,
    poolTokenMint,
    megaPoolVaults,
    megaPoolTokenMint,
  } as PoolPricesConfig);

  console.log('DATA:', pool, poolVault, megaPool, megaPoolVaults);

  return <div> TODO: POOL VISUALIZATION + CREATE/REDEEM </div>;
}

// TODO: don't make these optional.
type PoolPricesConfig = {
  poolVault?: TokenAccount;
  poolTokenMint?: MintInfo;
  megaPoolVaults?: TokenAccount[];
  megaPoolTokenMint?: MintInfo;
};

class PoolPrices {
  private poolVault: TokenAccount;
  private poolTokenMint: MintInfo;
  private megaPoolVaults: TokenAccount[];
  private megaPoolTokenMint: MintInfo;

  constructor(cfg: PoolPricesConfig) {
    this.poolVault = cfg.poolVault!;
    this.poolTokenMint = cfg.poolTokenMint!;
    this.megaPoolVaults = cfg.megaPoolVaults!;
    this.megaPoolTokenMint = cfg.megaPoolTokenMint!;
  }

  // TODO: replace these methods with `getPoolBasket` from the pool package.
  basket(sptAmount: BN, roundUp: boolean): Basket {
    return {
      quantities: [
        this.poolVault.amount
          .mul(sptAmount)
          .add(roundUp ? this.poolTokenMint.supply.sub(new BN(1)) : new BN(0))
          .div(this.poolTokenMint.supply),
      ],
    };
  }
  // TODO: replace these methods with `getPoolBasket` from the pool package.
  megaBasket(sptAmount: BN, roundUp: boolean): Basket {
    if (this.megaPoolVaults.length !== 2) {
      throw new Error('invariant violation');
    }
    const srm = this.poolVault.amount
      .mul(sptAmount)
      .add(roundUp ? this.poolTokenMint.supply.sub(new BN(1)) : new BN(0))
      .div(this.poolTokenMint.supply);
    const msrm = this.megaPoolVaults[0].amount
      .mul(sptAmount)
      .add(roundUp ? this.megaPoolTokenMint.supply.sub(new BN(1)) : new BN(0))
      .div(this.megaPoolTokenMint.supply);
    return {
      quantities: [srm, msrm],
    };
  }
}
