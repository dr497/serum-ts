import React, { PropsWithChildren, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { WalletConnectButton, useWallet } from './Wallet';
import { State as StoreState } from '../../store/reducer';
import LockIcon from '@material-ui/icons/Lock';
import ExploreIcon from '@material-ui/icons/Explore';
import CloudOffIcon from '@material-ui/icons/CloudOff';

type Props = {};

export default function Layout(props: PropsWithChildren<Props>) {
  return (
    <React.Fragment>
      <Nav>{props.children}</Nav>
    </React.Fragment>
  );
}

function Nav(props: PropsWithChildren<Props>): ReactElement {
  const { wallet } = useWallet();
  const history = useHistory();
  const { walletIsConnected } = useSelector((state: StoreState) => {
    return {
      walletIsConnected: state.common.walletIsConnected,
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
                      marginRight: '10px',
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
                    <Typography style={{ fontSize: '20px' }}>Serum</Typography>
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
                  <div onClick={() => history.push('/lockup')}>
                    <IconButton color="inherit">
                      <LockIcon />
                    </IconButton>
                  </div>
                  <div onClick={() => history.push('/registry/entities')}>
                    <IconButton color="inherit">
                      <ExploreIcon />
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
                    <MenuItem value="disconnect">Disconnect</MenuItem>
                  </Select>
                </>
              )}
            </div>
          </div>
        </Toolbar>
      </AppBar>
      {walletIsConnected ? (
        <Container fixed maxWidth="md" style={{ flex: 1 }}>
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            {props.children}
          </div>
        </Container>
      ) : (
        <div
          style={{
            flex: '1',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            textAlign: 'center',
          }}
        >
          <div
            style={{ display: 'flex', marginLeft: 'auto', marginRight: 'auto' }}
          >
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
      )}
    </div>
  );
}
