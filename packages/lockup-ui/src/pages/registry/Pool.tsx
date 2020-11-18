import React from 'react';
import { useSelector } from 'react-redux';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { MintInfo, AccountInfo as TokenAccount, u64 } from '@solana/spl-token';
import { Basket } from '@project-serum/pool';
import BN from 'bn.js';
import { useWallet } from '../../components/common/Wallet';
import { State as StoreState, ProgramAccount } from '../../store/reducer';

export default function Pool() {
  const { wallet } = useWallet();
  const {
    pool,
    poolTokenMint,
    poolVault,
    megaPool,
    megaPoolTokenMint,
    megaPoolVaults,
    member,
  } = useSelector((state: StoreState) => {
    return {
      pool: state.registry.pool,
      poolTokenMint: state.registry.poolTokenMint,
      poolVault: state.registry.poolVault,
      megaPool: state.registry.megaPool,
      megaPoolTokenMint: state.registry.megaPoolTokenMint,
      megaPoolVaults: state.registry.megaPoolVaults,
      member: state.registry.member,
    };
  });
  console.log('DATA:', pool, poolVault, megaPool, megaPoolVaults);
  const prices = new PoolPrices({
    poolVault: poolVault!.account,
    poolTokenMint: poolTokenMint!.account,
    megaPoolVaults: megaPoolVaults!.map(
      (v: ProgramAccount<TokenAccount>) => v.account,
    ),
    megaPoolTokenMint: megaPoolTokenMint!.account,
  });

  const poolSharePrice = prices.basket(new BN(1), true);
  const megaPoolSharePrice = prices.megaBasket(new BN(1), true);

  return (
    <div>
      <div
        style={{
          backgroundColor: '#fff',
          paddingTop: '24px',
        }}
      >
        <Container
          fixed
          maxWidth="md"
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h4" style={{ marginBottom: '10px' }}>
            Member Account
          </Typography>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <div>
              <Typography>
                {member ? member?.publicKey.toString() : 'Account not found'}
              </Typography>
              <Typography color="textSecondary">
                Generation {member ? member?.account.generation.toString() : 0}
              </Typography>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>SRM Pool Shares</Typography>
                <Typography>
                  {member ? member?.account.balances.sptAmount.toString() : 0}
                </Typography>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>MSRM Pool Shares</Typography>
                <Typography
                  style={{
                    marginLeft: '50px',
                  }}
                >
                  {member
                    ? member?.account.balances.sptMegaAmount.toString()
                    : 0}
                </Typography>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <Container fixed maxWidth="md" style={{ flex: 1 }}>
        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
          <Card
            style={{
              marginBottom: '24px',
            }}
          >
            <CardHeader
              title={'SRM Pool'}
              subheader={pool?.publicKey.toString()}
            />
            <CardContent></CardContent>
          </Card>
          <Card>
            <CardHeader
              title={'MSRM Pool'}
              subheader={megaPool?.publicKey.toString()}
            />
            <CardContent></CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}

type PoolPricesConfig = {
  poolVault: TokenAccount;
  poolTokenMint: MintInfo;
  megaPoolVaults: TokenAccount[];
  megaPoolTokenMint: MintInfo;
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
    if (this.poolVault.amount.toNumber() === 0) {
      return { quantities: [new u64(sptAmount)] };
    }
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
    if (this.megaPoolVaults[1].amount.toNumber() === 0) {
      return { quantities: [new u64(0), new u64(sptAmount)] };
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
