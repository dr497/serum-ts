import React from 'react';
import { accounts } from '@project-serum/registry';
import { ProgramAccount } from '../../store/reducer';
import { useSelector } from 'react-redux';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { State as StoreState } from '../../store/reducer';
import JoinEntityButton from '../../components/registry/JoinEntity';
import { ExplorerAddress } from '../../components/common/ExplorerLink';

const useStyles = makeStyles({
  progress: { textAlign: 'center', justifyContent: 'center' },
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
  root: {
    flexGrow: 1,
    paddingRight: 50,
    paddingLeft: 50,
    paddingTop: 50,
  },
  paper: {
    padding: 50,
    textAlign: 'center',
    border: '2px solid',
    borderColor: 'black',
    borderRadius: 0,
  },
  title: {
    fontSize: 25,
    fontWeight: 700,
    textAlign: 'center',
    paddingBottom: 10,
  },
  joinButton: {
    paddingTop: 20,
  },
});

type Props = {
  entity: ProgramAccount<accounts.Entity>;
};

export default function Entity(props: Props) {
  const classes = useStyles();

  const { entity } = props;
  const entityAddress = entity.publicKey.toString();

  let { entities, isWalletConnected } = useSelector((state: StoreState) => {
    return {
      entities: state.registry.entities,
      isWalletConnected: state.common.walletIsConnected,
    };
  });

  //	const [entity] = entities.filter(e => e.publicKey.toString() === entityAddress);

  if (!entity) {
    return <>Entity does not exist</>;
  }

  return (
    <>
      <div className={classes.root}>
        <Typography variant="h1" className={classes.title}>
          Entity Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              Pool address:{' '}
              <ExplorerAddress address={new PublicKey(entityAddress)}>
                {entityAddress}
              </ExplorerAddress>
              <br />
              Pool leader:{' '}
              <ExplorerAddress address={entity.account.leader}>
                {entity.account.leader.toBase58()}
              </ExplorerAddress>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              Available SRM deposit:{' '}
              {entity.account.balances.currentDeposit.toString()}
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              Available MSRM deposit:{' '}
              {entity.account.balances.currentMegaDeposit.toString()}
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              Staking Pool Shares:{' '}
              {entity.account.balances.sptAmount.toString()}
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              Mega Staking Pool Shares:{' '}
              {entity.account.balances.sptMegaAmount.toString()}
            </Paper>
          </Grid>
        </Grid>
        {isWalletConnected && (
          <Grid
            className={classes.joinButton}
            container
            direction="row"
            justify="center"
            alignItems="center"
          >
            <JoinEntityButton entityPublicKey={new PublicKey(entityAddress)} />
          </Grid>
        )}
      </div>
    </>
  );
}
