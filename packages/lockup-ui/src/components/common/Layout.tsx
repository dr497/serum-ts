import React, { PropsWithChildren, ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import LockIcon from '@material-ui/icons/Lock';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ExploreIcon from '@material-ui/icons/Explore';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PoolIcon from '@material-ui/icons/Pool';
import { PublicKey } from '@solana/web3.js';
import * as registry from '@project-serum/registry';
import { WalletConnectButton, useWallet } from './Wallet';
import { State as StoreState, ProgramAccount } from '../../store/reducer';
import { ActionType } from '../../store/actions';
import { ViewTransactionOnExplorerButton } from './Notification';

type Props = {};

export default function Layout(props: PropsWithChildren<Props>) {
  return <Nav>{props.children}</Nav>;
}

function Nav(props: PropsWithChildren<Props>): ReactElement {
  const { walletIsConnected, member } = useSelector((state: StoreState) => {
    return {
      walletIsConnected: state.common.walletIsConnected,
      member: state.registry.member,
    };
  });
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        backgroundColor: 'rgb(251, 251, 251)',
      }}
    >
      <RiskBar />
      <NavBar walletIsConnected={walletIsConnected} member={member} />
      {!walletIsConnected ? (
        <Disconnected />
      ) : (
        <Container fixed maxWidth="md" style={{ flex: 1 }}>
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            {props.children}
          </div>
        </Container>
      )}
    </div>
  );
}

function RiskBar() {
  return (
    <div
      style={{
        textAlign: 'center',
        height: '30px',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: 'rgb(245, 0, 87)',
        color: '#fef7f9',
      }}
    >
      <Typography style={{ fontSize: '14px', fontWeight: 'bold' }}>
        This is unaudited software. Use at your own risk.
      </Typography>
    </div>
  );
}

type NavBarProps = {
  walletIsConnected: boolean;
  member?: ProgramAccount<registry.accounts.Member>;
};

function NavBar(props: NavBarProps) {
  const { member, walletIsConnected } = props;
  const { wallet, registryClient } = useWallet();
  const dispatch = useDispatch();
  const history = useHistory();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const createStakeAccount = async () => {
    enqueueSnackbar('Creating stake account', {
      variant: 'info',
    });

    // Hard coded until we decouple creating members from joining entities.
    const entity = new PublicKey(
      'HSJVe1S2Y4AdRnFWsztZpHKW4g27RE3XyE6ZwfyVJgib',
    );
    const { tx, member } = await registryClient.createMember({
      entity,
    });
    const memberAcc = await registryClient.accounts.member(member);
    dispatch({
      type: ActionType.RegistrySetMember,
      item: {
        member: {
          publicKey: member,
          account: memberAcc,
        },
      },
    });
    closeSnackbar();
    enqueueSnackbar(`Stake account created ${member}`, {
      variant: 'success',
      action: <ViewTransactionOnExplorerButton signature={tx} />,
    });
  };
  return (
    <AppBar
      position="static"
      style={{
        background: '#172026',
        color: 'white',
      }}
    >
      <Toolbar>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex' }} onClick={() => history.push('/')}>
            <Button color="inherit" style={{ textTransform: 'none' }}>
              <div style={{ display: 'flex' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    marginRight: '15px',
                  }}
                >
                  <img
                    style={{
                      display: 'block',
                      height: '35px',
                    }}
                    alt="Logo"
                    src="http://dex.projectserum.com/static/media/logo.49174c73.svg"
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <Typography style={{ fontSize: '20px' }}>Stake</Typography>
                </div>
              </div>
            </Button>
          </div>
          <div
            style={{
              display: 'flex',
            }}
          >
            <WalletConnectButton
              style={{
                display: walletIsConnected ? 'none' : '',
                textTransform: 'none',
              }}
            />
            {walletIsConnected && (
              <>
                <div onClick={() => history.push('/registry/entities')}>
                  <IconButton color="inherit">
                    <ExploreIcon />
                  </IconButton>
                </div>
                <div onClick={() => history.push('/registry/pool')}>
                  <IconButton color="inherit">
                    <PoolIcon />
                  </IconButton>
                </div>
                <div onClick={() => history.push('/lockup')}>
                  <IconButton color="inherit">
                    <LockIcon />
                  </IconButton>
                </div>
                <Select
                  displayEmpty
                  renderValue={() => {
                    return (
                      <Typography style={{ overflow: 'hidden' }}>
                        {wallet.publicKey.toString()}
                      </Typography>
                    );
                  }}
                  style={{
                    marginLeft: '12px',
                    width: '150px',
                    color: 'white',
                  }}
                  onChange={e => {
                    if (e.target.value === 'disconnect') {
                      wallet.disconnect();
                    }
                  }}
                >
                  {member === undefined && (
                    <MenuItem value="create-member">
                      <div onClick={() => createStakeAccount()}>
                        <IconButton color="inherit">
                          <PersonAddIcon />
                          <Typography style={{ marginLeft: '15px' }}>
                            Create stake account
                          </Typography>
                        </IconButton>
                      </div>
                    </MenuItem>
                  )}
                  <MenuItem value="disconnect">
                    <IconButton color="inherit">
                      <ExitToAppIcon />
                      <Typography style={{ marginLeft: '15px' }}>
                        Disconnect
                      </Typography>
                    </IconButton>
                  </MenuItem>
                </Select>
              </>
            )}
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
}

function Disconnected() {
  return (
    <div
      style={{
        flex: '1',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', marginLeft: 'auto', marginRight: 'auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <CloudOffIcon
            style={{ fontSize: '65px', color: 'rgba(0, 0, 0, 0.54)' }}
          />
        </div>
        <Typography
          style={{ marginLeft: '24px' }}
          color="textSecondary"
          variant="h2"
        >
          Disconnected
        </Typography>
      </div>
    </div>
  );
}
