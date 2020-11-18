import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import { TransitionProps } from '@material-ui/core/transitions';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Slide from '@material-ui/core/Slide';
import { PublicKey } from '@solana/web3.js';
import { MintInfo, AccountInfo as TokenAccount, u64 } from '@solana/spl-token';
import { Basket } from '@project-serum/pool';
import BN from 'bn.js';
import { useWallet } from '../../components/common/Wallet';
import { State as StoreState, ProgramAccount } from '../../store/reducer';

export default function Pool() {
  const { wallet } = useWallet();
  const {
    isBootstrapped,
    pool,
    poolTokenMint,
    poolVault,
    megaPool,
    megaPoolTokenMint,
    megaPoolVaults,
    member,
  } = useSelector((state: StoreState) => {
    return {
      isBootstrapped: state.common.isBootstrapped,
      pool: state.registry.pool,
      poolTokenMint: state.registry.poolTokenMint,
      poolVault: state.registry.poolVault,
      megaPool: state.registry.megaPool,
      megaPoolTokenMint: state.registry.megaPoolTokenMint,
      megaPoolVaults: state.registry.megaPoolVaults,
      member: state.registry.member,
    };
  });
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  const prices =
    isBootstrapped === false
      ? undefined
      : new PoolPrices({
          poolVault: poolVault!.account,
          poolTokenMint: poolTokenMint!.account,
          megaPoolVaults: megaPoolVaults!.map(
            (v: ProgramAccount<TokenAccount>) => v.account,
          ),
          megaPoolTokenMint: megaPoolTokenMint!.account,
        });

  // const poolSharePrice = prices.basket(new BN(1), true);
  // const megaPoolSharePrice = prices.megaBasket(new BN(1), true);

  return (
    <>
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
                  Generation{' '}
                  {member ? member?.account.generation.toString() : 0}
                </Typography>
              </div>
              <div>
                <div>
                  <Button
                    onClick={() => setShowDepositDialog(true)}
                    variant="outlined"
                    color="primary"
                    style={{ marginRight: '10px' }}
                  >
                    <ArrowDownwardIcon style={{ fontSize: '20px' }} />
                    <Typography
                      style={{ marginLeft: '5px', marginRight: '5px' }}
                    >
                      Deposit
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setShowWithdrawDialog(true)}
                  >
                    <ArrowUpwardIcon style={{ fontSize: '20px' }} />
                    <Typography
                      style={{ marginLeft: '5px', marginRight: '5px' }}
                    >
                      Withdraw
                    </Typography>
                  </Button>
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
      <DepositDialog
        open={showDepositDialog}
        onClose={() => setShowDepositDialog(false)}
      />
      <WithdrawDialog
        open={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
      />
    </>
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

type DepositDialogProps = {
  open: boolean;
  onClose: () => void;
};

function DepositDialog(props: DepositDialogProps) {
  const { open, onClose } = props;
  return (
    <TransferDialog
      title={'Deposit'}
      contextText={'Select the amount and coin you want to deposit'}
      open={open}
      onClose={onClose}
      onTransfer={(amount: number, coin: string): void => {
        // todo
      }}
    />
  );
}

type WithdrawDialogProps = {
  open: boolean;
  onClose: () => void;
};

function WithdrawDialog(props: DepositDialogProps) {
  const { open, onClose } = props;
  return (
    <TransferDialog
      title={'Withdraw'}
      contextText={'Select the amount and coin you want to withdraw'}
      open={open}
      onClose={onClose}
      onTransfer={(amount: number, coin: string): void => {
        // todo
      }}
    />
  );
}

type TransferDialogProps = {
  title: string;
  contextText: string;
  open: boolean;
  onClose: () => void;
  onTransfer: (amount: number, coin: string) => void;
};

function TransferDialog(props: TransferDialogProps) {
  const { open, onClose, onTransfer, title, contextText } = props;
  const [amount, setAmount] = useState<null | number>(null);
  const [coin, setCoin] = useState<null | string>(null);
  const { registryClient, wallet } = useWallet();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // @ts-ignore
  const onChangeAmount = e => {
    setAmount(e.target.value);
  };

  // @ts-ignore
  const onChangeCoin = e => {
    setCoin(e.target.value);
  };
  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={onClose}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <TextField
            id="outlined-number"
            label="Amount"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            onChange={onChangeAmount}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <FormControl
            variant="outlined"
            style={{ width: '100px', marginLeft: '10px' }}
          >
            <InputLabel>Coin</InputLabel>
            <Select value={coin} onChange={onChangeCoin} label="Coin">
              <MenuItem value="srm">SRM</MenuItem>
              <MenuItem value="msrm">MSRM</MenuItem>
            </Select>
          </FormControl>
          <DialogContentText>{contextText}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button
            //@ts-ignore
            onClick={() => onTransfer(amount, coin)}
            color="primary"
            disabled={!amount || !coin}
          >
            {title}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
