import React, { PropsWithChildren, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { WalletConnectButton } from './Wallet';

type Props = {};

export default function Layout(props: PropsWithChildren<Props>) {
  return (
    <React.Fragment>
      <Nav>{props.children}</Nav>
    </React.Fragment>
  );
}

function Nav(props: PropsWithChildren<Props>): ReactElement {
  return (
    <div style={{
			display: 'flex',
			minHeight: '100vh',
			flexDirection: 'column',
			backgroundColor: 'rgb(251, 251, 251)',
		}}>
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
              <Link
                to={'/lockup'}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      marginRight: '24px',
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
                  <IconButton color="inherit" edge="start">
                    <Typography variant="h6">Lockup</Typography>
                  </IconButton>
                </div>
              </Link>
              <Link
                to={'/registry/entities'}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    marginLeft: '12px',
                  }}
                >
                  <IconButton color="inherit" edge="start">
                    <Typography variant="h6">Registry</Typography>
                  </IconButton>
                </div>
              </Link>
            </div>
            <div
              style={{
                display: 'flex',
              }}
            >
              <WalletConnectButton />
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <Container fixed maxWidth="md">
        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
          {props.children}
        </div>
      </Container>
    </div>
  );
}
