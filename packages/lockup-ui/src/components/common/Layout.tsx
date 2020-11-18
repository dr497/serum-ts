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
import Link from '@material-ui/core/Link';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ExploreIcon from '@material-ui/icons/Explore';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import CircularProgress from '@material-ui/core/CircularProgress';
import PoolIcon from '@material-ui/icons/Pool';
import { PublicKey } from '@solana/web3.js';
import * as registry from '@project-serum/registry';
import { WalletConnectButton, useWallet } from './Wallet';
import {
  State as StoreState,
  ProgramAccount,
  WalletConnection,
} from '../../store/reducer';
import { ActionType } from '../../store/actions';
import { ViewTransactionOnExplorerButton } from './Notification';

type Props = {};

export default function Layout(props: PropsWithChildren<Props>) {
  return <Nav>{props.children}</Nav>;
}

function Nav(props: PropsWithChildren<Props>): ReactElement {
  const { walletIsConnected } = useSelector((state: StoreState) => {
    return {
      walletIsConnected:
        state.common.walletConnection === WalletConnection.Connected,
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
      <NavBar walletIsConnected={walletIsConnected} />
      {!walletIsConnected ? <Disconnected /> : <>{props.children}</>}
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
  const { walletIsConnected } = props;
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
          <div style={{ display: 'flex' }}>
            <SerumLogoButton />
            <BarButton label="Stake" hrefClient="/" />
            <BarButton label="Trade" href="https://dex.projectserum.com" />
            <BarButton label="Swap" href="https://swap.projectserum.com" />
            <BarButton
              label="Learn"
              href="https://serum-academy.com/en/serum-dex/"
            />
          </div>
          <div
            style={{
              display: 'flex',
            }}
          >
            <WalletConnectButton
              style={{
                display: walletIsConnected ? 'none' : '',
              }}
            />
            {walletIsConnected && <UserWalletDropdown />}
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
}

function Disconnected() {
  const { isConnecting } = useSelector((state: StoreState) => {
    return {
      isConnecting:
        state.common.walletConnection === WalletConnection.IsConnecting,
    };
  });
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
        {isConnecting ? (
          <div>
            <CircularProgress />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

function SerumLogoButton() {
  const history = useHistory();
  return (
    <div style={{ display: 'flex' }} onClick={() => history.push('/')}>
      <Button color="inherit">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
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
      </Button>
    </div>
  );
}

type BarButtonProps = {
  label: string;
  hrefClient?: string;
  href?: string;
};

function BarButton(props: BarButtonProps) {
  const history = useHistory();
  const { label, href, hrefClient } = props;
  return (
    <div
      style={{ display: 'flex' }}
      onClick={() => hrefClient && history.push(hrefClient)}
    >
      <Button color="inherit" href={href}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography style={{ fontSize: '15px' }}>{label}</Typography>
        </div>
      </Button>
    </div>
  );
}

function UserWalletDropdown() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { wallet, registryClient } = useWallet();
  const { member } = useSelector((state: StoreState) => {
    return {
      member: state.registry.member,
    };
  });

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
            <Typography style={{ marginLeft: '15px' }}>Disconnect</Typography>
          </IconButton>
        </MenuItem>
      </Select>
    </>
  );
}
