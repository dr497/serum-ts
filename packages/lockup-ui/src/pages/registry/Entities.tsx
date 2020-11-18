import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { accounts } from '@project-serum/registry';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Birghtness1Icon from '@material-ui/icons/Brightness1';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { useWallet } from '../../components/common/Wallet';
import {
  ProgramAccount,
  State as StoreState,
  WalletConnection,
} from '../../store/reducer';
import { ActionType } from '../../store/actions';
import { useHistory } from 'react-router-dom';
import Entity from './Entity';

export default function Entities() {
  let { entities, isWalletConnected, member } = useSelector(
    (state: StoreState) => {
      return {
        entities: state.registry.entities,
        isWalletConnected:
          state.common.walletConnection === WalletConnection.Connected,
        member: state.registry.member,
      };
    },
  );
  // Sort entities by activation.
  entities = entities
    .filter(e => e.account.state.active !== undefined)
    .concat(
      entities.filter(e => e.account.state.pendingDeactivation !== undefined),
    )
    .concat(entities.filter(e => e.account.state.inactive !== undefined));

  return (
    <Container fixed maxWidth="md" style={{ flex: 1 }}>
      <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                Node Entities
              </Typography>
            </div>
            <NewButton
              style={{
                visibility: !isWalletConnected || !member ? 'hidden' : '',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {entities.map(entity => (
              <EntityCard entity={entity} />
            ))}
          </div>
          <style>
            {`
.entity-card-container {
  transition: box-shadow .2s ease-out,-webkit-box-shadow .2s ease-out,-moz-box-shadow .2s ease-out;
}
.entity-card-container:hover {
  cursor: pointer;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  -moz-box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  -webkit-box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
}
.entity-card-container-inner {
  transition: transform .2s ease-out,-webkit-transform .2s ease-out;
}
.entity-card-container-inner:hover {
  transform: scale(1.025);
  -webkit-transform: scalee(1.025);
}
					`}
          </style>
        </div>
      </div>
    </Container>
  );
}

type EntityCardProps = {
  entity: ProgramAccount<accounts.Entity>;
};

function EntityCard(props: EntityCardProps) {
  const { entity } = props;
  const [open, setOpen] = useState(false);
  //	const history = useHistory();
  return (
    <>
      <EntityDialog
        open={open}
        onClose={() => setOpen(false)}
        entity={entity}
      />
      <div
        style={{
          width: '304px',
          padding: '5px',
        }}
      >
        <div className="entity-card-container">
          <Card
            onClick={() => setOpen(true)}
            style={{
              borderRadius: 10,
              height: '294px',
              boxShadow: '0px 0px 25px 0px rgba(0,0,0,0.05)',
            }}
          >
            <CardContent
              style={{
                height: '100%',
                paddingBottom: '16px', // Override material's non-symmetric default.
              }}
            >
              <div
                className="entity-card-container-inner"
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div>
                  <Typography
                    color="textSecondary"
                    style={{
                      fontWeight: 'bold',
                      fontSize: '16px',
                      overflow: 'hidden',
                    }}
                  >
                    {entity.publicKey.toString()}
                  </Typography>
                </div>
                <div
                  style={{
                    flex: '1',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      textAlign: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <div>
                      <Typography
                        color="textSecondary"
                        style={{
                          fontSize: '24px',
                        }}
                      >
                        {`${entity.account.balances.sptAmount.toString()} | ${entity.account.balances.sptMegaAmount.toString()}`}
                      </Typography>
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <EntityActivityLabel entity={entity} />
                  <Typography color="textSecondary">
                    {`Generation ${entity.account.generation}`}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

type EntityActivityLabelProps = {
  entity: ProgramAccount<accounts.Entity>;
};

export function EntityActivityLabel(props: EntityActivityLabelProps) {
  const { entity } = props;
  return (
    <>
      {entity.account.state.active !== undefined && (
        <ActivityLabel color="green" text="Active" />
      )}
      {entity.account.state.pendingDeactivation !== undefined && (
        <ActivityLabel color="yellow" text="Inactive" />
      )}
      {entity.account.state.inactive !== undefined && (
        <ActivityLabel color="red" text="Inactive" />
      )}
    </>
  );
}

type ActivityLabelProps = {
  color: string;
  text: string;
};

function ActivityLabel(props: ActivityLabelProps) {
  const { color, text } = props;
  return (
    <div style={{ display: 'flex' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          marginRight: '10px',
        }}
      >
        <Birghtness1Icon
          style={{
            color,
            fontSize: '15px',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          fontSize: '10px',
        }}
      >
        <Typography color="textSecondary">{text}</Typography>
      </div>
    </div>
  );
}

type NewButtonProps = {
  style?: any;
};

function NewButton(props?: NewButtonProps) {
  const { registryClient } = useWallet();
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const createEntity = async () => {
    enqueueSnackbar('Creating entity...', {
      variant: 'info',
    });
    const { entity } = await registryClient.createEntity({});
    const entityAccount = await registryClient.accounts.entity(entity);
    dispatch({
      type: ActionType.RegistryCreateEntity,
      item: {
        entity: {
          publicKey: entity,
          account: entityAccount,
        },
      },
    });
    closeSnackbar();
    enqueueSnackbar(`Entity created ${entity}`, {
      variant: 'success',
    });
  };
  return (
    <div style={props && props.style}>
      <Button variant="contained" color="secondary" onClick={createEntity}>
        New
      </Button>
    </div>
  );
}

type EntityDialogProps = {
  entity: ProgramAccount<accounts.Entity>;
  open: boolean;
  onClose: () => void;
};

function EntityDialog(props: EntityDialogProps) {
  const { entity, open, onClose } = props;
  return (
    <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="md">
      <DialogContent
        style={{
          backgroundColor: '#fbfbfb',
          padding: 0,
          minHeight: '850px',
        }}
      >
        <Entity entity={entity} />
      </DialogContent>
    </Dialog>
  );
}
