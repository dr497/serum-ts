import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import BN from 'bn.js';
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
import FormHelperText from '@material-ui/core/FormHelperText';
import { PublicKey } from '@solana/web3.js';
import { MintInfo, AccountInfo as TokenAccount, u64 } from '@solana/spl-token';
import { Basket } from '@project-serum/pool';
import { accounts, networks, Client } from '@project-serum/registry';
import { useWallet } from '../../components/common/Wallet';
import OwnedTokenAccountsSelect from '../../components/common/OwnedTokenAccountsSelect';
import { ViewTransactionOnExplorerButton } from '../../components/common/Notification';
import { State as StoreState, ProgramAccount } from '../../store/reducer';
import { ActionType } from '../../store/actions';

export default function Pool() {
  const { wallet, registryClient } = useWallet();
  const {
    isBootstrapped,
    pool,
    poolTokenMint,
    poolVault,
    megaPool,
    megaPoolTokenMint,
    megaPoolVaults,
    member,
    registrar,
  } = useSelector((state: StoreState) => {
    console.log('pool using state', state);
    return {
      isBootstrapped: state.common.isBootstrapped,
      pool: state.registry.pool,
      poolTokenMint: state.registry.poolTokenMint,
      poolVault: state.registry.poolVault,
      megaPool: state.registry.megaPool,
      megaPoolTokenMint: state.registry.megaPoolTokenMint,
      megaPoolVaults: state.registry.megaPoolVaults,
      member: state.registry.member,
      registrar: state.registry.registrar,
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
                  {member
                    ? member?.publicKey.toString()
                    : 'Account not found. Please create a stake account.'}
                </Typography>
                <Typography color="textSecondary">
                  Generation{' '}
                  {member ? member?.account.generation.toString() : 0}
                </Typography>
              </div>
              <div>
                <div>
                  <Button
                    disabled={member === undefined}
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
                    disabled={member === undefined}
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
      {member !== undefined && (
        <>
          <DepositDialog
            registrar={registrar!}
            client={registryClient}
            member={member}
            open={showDepositDialog}
            onClose={() => setShowDepositDialog(false)}
          />
          <WithdrawDialog
            registrar={registrar!}
            client={registryClient}
            member={member}
            open={showWithdrawDialog}
            onClose={() => setShowWithdrawDialog(false)}
          />
        </>
      )}
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
  member: ProgramAccount<accounts.Member>;
  registrar: ProgramAccount<accounts.Registrar>;
  client: Client;
  open: boolean;
  onClose: () => void;
};

function DepositDialog(props: DepositDialogProps) {
  const { client, registrar, member, open, onClose } = props;
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  return (
    <TransferDialog
      title={'Deposit'}
      contextText={'Select the amount and coin you want to deposit'}
      open={open}
      onClose={onClose}
      onTransfer={async (from: PublicKey, amount: number, coin: string) => {
        enqueueSnackbar(
          `Depositing ${amount} ${coin} from ${from.toString()}`,
          {
            variant: 'info',
          },
        );
        const { tx } = await client.deposit({
          member: member.publicKey,
          depositor: from,
          amount: new BN(amount),
          entity: member.account.entity,
          vault:
            coin === 'srm'
              ? registrar.account.vault
              : registrar.account.megaVault,
        });
        const newMember = await client.accounts.member(member.publicKey);
        const newEntity = await client.accounts.entity(member.account.entity);
        dispatch({
          type: ActionType.RegistrySetMember,
          item: {
            member: {
              publicKey: member.publicKey,
              account: newMember,
            },
          },
        });
        dispatch({
          type: ActionType.RegistryUpdateEntity,
          item: {
            entity: {
              publicKey: member.account.entity,
              account: newEntity,
            },
          },
        });
        closeSnackbar();
        enqueueSnackbar(`Deposit complete`, {
          variant: 'success',
          action: <ViewTransactionOnExplorerButton signature={tx} />,
        });
        onClose();
      }}
    />
  );
}

type WithdrawDialogProps = DepositDialogProps;

function WithdrawDialog(props: WithdrawDialogProps) {
  const { client, registrar, member, open, onClose } = props;
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  return (
    <TransferDialog
      title={'Withdraw'}
      contextText={'Select the amount and coin you want to withdraw'}
      open={open}
      onClose={onClose}
      onTransfer={async (from: PublicKey, amount: number, coin: string) => {
        enqueueSnackbar(`Withdrawing ${amount} ${coin} to ${from.toString()}`, {
          variant: 'info',
        });
        const { tx } = await client.withdraw({
          member: member.publicKey,
          depositor: from,
          amount: new BN(amount),
          entity: member.account.entity,
          vault:
            coin === 'srm'
              ? registrar.account.vault
              : registrar.account.megaVault,
          vaultOwner: await client.accounts.vaultAuthority(
            client.programId,
            client.registrar,
            registrar.account,
          ),
        });
        const newMember = await client.accounts.member(member.publicKey);
        const newEntity = await client.accounts.entity(member.account.entity);
        dispatch({
          type: ActionType.RegistrySetMember,
          item: {
            member: {
              publicKey: member.publicKey,
              account: newMember,
            },
          },
        });
        dispatch({
          type: ActionType.RegistryUpdateEntity,
          item: {
            entity: {
              publicKey: member.account.entity,
              account: newEntity,
            },
          },
        });
        closeSnackbar();
        enqueueSnackbar(`Withdraw complete`, {
          variant: 'success',
          action: <ViewTransactionOnExplorerButton signature={tx} />,
        });
        onClose();
      }}
    />
  );
}

type TransferDialogProps = {
  title: string;
  contextText: string;
  open: boolean;
  onClose: () => void;
  onTransfer: (from: PublicKey, amount: number, coin: string) => void;
};

function TransferDialog(props: TransferDialogProps) {
  const { open, onClose, onTransfer, title, contextText } = props;
  const [amount, setAmount] = useState<null | number>(null);
  const [coin, setCoin] = useState<null | string>(null);
  const [from, setFrom] = useState<null | PublicKey>(null);
  const mint = !coin
    ? undefined
    : coin === 'srm'
    ? networks.devnet.srm
    : networks.devnet.msrm;
  const { registryClient, wallet } = useWallet();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={onClose}
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <TextField
                style={{ width: '100%' }}
                id="outlined-number"
                label="Amount"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                onChange={e => setAmount(parseInt(e.target.value) as number)}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <FormHelperText>{contextText}</FormHelperText>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{ width: '100px', marginLeft: '10px' }}
              >
                <InputLabel>Coin</InputLabel>
                <Select
                  value={coin}
                  onChange={e => setCoin(e.target.value as string)}
                  label="Coin"
                >
                  <MenuItem value="srm">SRM</MenuItem>
                  <MenuItem value="msrm">MSRM</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
          <FormControl fullWidth>
            <OwnedTokenAccountsSelect
              variant="outlined"
              mint={mint}
              onChange={(f: PublicKey) => setFrom(f)}
            />
            <FormHelperText>Token account to transfer to/from</FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button
            //@ts-ignore
            onClick={() => onTransfer(from, amount, coin)}
            color="primary"
            disabled={!from || !amount || !coin}
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
