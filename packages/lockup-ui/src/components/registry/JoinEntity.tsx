import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { useWallet } from '../common/Wallet';
import { ViewTransactionOnExplorerButton } from '../common/Notification';

const useStyles = makeStyles({
  button: {
    color: 'black',
    marginLeft: 5,
    marginRight: 5,
    width: 200,
    borderRadius: 50,
    borderColor: 'rgb(120,210,226)',
  },
  text: {
    paddingLeft: 10,
    fontWeight: 900,
  },
});

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const JoinEntityButton = ({
  entityPublicKey,
}: {
  entityPublicKey: PublicKey;
}) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setLoading(true);
    setOpen(true);
  };

  const onClose = () => {
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        className={classes.button}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <AddIcon />
            <Typography className={classes.text}>Deposit</Typography>
          </>
        )}
      </Button>
      <DepositDialog open={open} onClose={onClose} entity={entityPublicKey} />
    </>
  );
};

export default JoinEntityButton;

const DepositDialog = ({
  open,
  onClose,
  entity,
}: {
  open: boolean;
  onClose: () => void;
  entity: PublicKey;
}) => {
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

  const onClick = async (amount: number, coin: string) => {
    try {
      let id = enqueueSnackbar('Joining entity...', {
        variant: 'info',
        persist: true,
      });
      const resp = await registryClient.createMember({ entity: entity });
      closeSnackbar(id);
      enqueueSnackbar('Member created', {
        variant: 'success',
        autoHideDuration: 15000,
        action: <ViewTransactionOnExplorerButton signature={resp.tx} />,
      });
      const resp_deposit = await registryClient.deposit({
        member: resp.member,
        // Should it be the SOL address of the user or his SRM/MSRM one?
        depositor: wallet.publicKey,
        // TODO: parse properly the amount
        amount: new BN(amount),
      });
      console.log(resp_deposit);
    } catch (err) {
      console.log(`Error joining entity ${err}`);
      enqueueSnackbar(`Error joining entity - ${err}`, {
        variant: 'error',
        autoHideDuration: 15000,
      });
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={onClose}
      >
        <DialogTitle>Deposit</DialogTitle>
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
            style={{ width: '90px', marginLeft: '10px' }}
          >
            <InputLabel>Coin</InputLabel>
            <Select value={coin} onChange={onChangeCoin} label="Coin">
              <MenuItem value="srm">SRM</MenuItem>
              <MenuItem value="msrm">MSRM</MenuItem>
            </Select>
          </FormControl>
          <DialogContentText>
            Select the amount and coin you want to deposit
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button
            //@ts-ignore
            onClick={() => onClick(amount, coin)}
            color="primary"
            disabled={!amount || !coin}
          >
            Deposit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
