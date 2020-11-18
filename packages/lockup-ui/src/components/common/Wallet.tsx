import React, {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useContext,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import PersonIcon from '@material-ui/icons/Person';
import { sleep, token } from '@project-serum/common';
// @ts-ignore
import Wallet from '@project-serum/sol-wallet-adapter';
import { Client, accounts } from '@project-serum/lockup';
import { Client as RegistryClient } from '@project-serum/registry';
import * as registry from '@project-serum/registry';
import { State as StoreState, ProgramAccount } from '../../store/reducer';
import { ActionType } from '../../store/actions';

export function useWallet(): WalletContextValues {
  const w = useContext(WalletContext);
  if (!w) {
    throw new Error('Missing wallet context');
  }
  return w;
}

const WalletContext = React.createContext<null | WalletContextValues>(null);

type WalletContextValues = {
  wallet: Wallet;
  client: Client; // todo: rename lockupClient.
  registryClient: RegistryClient;
};

export function WalletProvider(
  props: PropsWithChildren<ReactNode>,
): ReactElement {
  const { walletProvider, networkUrl } = useSelector((state: StoreState) => {
    return {
      walletProvider: state.common.walletProvider,
      networkUrl: state.common.networkUrl,
    };
  });
  const wallet = useMemo(() => new Wallet(walletProvider, networkUrl), [
    walletProvider,
    networkUrl,
  ]);

  const { client, registryClient } = useMemo(() => {
    return {
      client: Client.devnet(wallet, {
        preflightCommitment: 'recent',
      }),
      registryClient: RegistryClient.devnet(wallet, {
        preflightCommitment: 'recent',
      }),
    };
  }, [wallet]);

  return (
    <WalletContext.Provider value={{ wallet, client, registryClient }}>
      {props.children}
    </WalletContext.Provider>
  );
}

type WalletConnectButtonProps = {
  style?: any;
};

export function WalletConnectButton(
  props: WalletConnectButtonProps,
): ReactElement {
  const isConnected = useSelector(
    (state: StoreState) => state.common.walletIsConnected,
  );
  const dispatch = useDispatch();
  const { wallet, client, registryClient } = useWallet();
  const { enqueueSnackbar } = useSnackbar();

  const connect = () => {
    wallet.connect();
  };

  const disconnect = () => {
    wallet.disconnect();
  };

  // One time application startup.
  useEffect(() => {
    dispatch({
      type: ActionType.CommonAppWillStart,
      item: {},
    });
    const fetchEntityAccounts = async () => {
      const entityAccounts = (await registryClient.accounts.allEntities())
        // TODO: change struct layout so we can memcmp this on the RPC instead.
        .filter(
          (e: ProgramAccount<registry.accounts.Entity>) =>
            e.account.registrar.toString() ===
            registryClient.registrar.toString(),
        );
      dispatch({
        type: ActionType.RegistrySetEntities,
        item: {
          entities: entityAccounts,
        },
      });
    };

    // Getting rate limited so break up RPC requests and sleep.
    const fetchPoolData = async () => {
      const registrar = await registryClient.accounts.registrar();
      await sleep(1000 * 2);
      const pool = await registryClient.accounts.pool(registrar);
      await sleep(1000 * 2);
      const poolVault = await registryClient.accounts.poolVault(registrar);
      await sleep(1000 * 2);
      const megaPool = await registryClient.accounts.megaPool(registrar);
      await sleep(1000 * 2);
      const megaPoolVaults = await registryClient.accounts.megaPoolVaults(
        registrar,
      );
      await sleep(1000 * 2);
      const poolTokenMint = await registryClient.accounts.poolTokenMint(
        pool,
        registrar,
      );
      await sleep(1000 * 2);
      const megaPoolTokenMint = await registryClient.accounts.megaPoolTokenMint(
        megaPool,
        registrar,
      );

      dispatch({
        type: ActionType.RegistrySetPools,
        item: {
          pool: {
            publicKey: registrar.pool,
            account: pool,
          },
          poolTokenMint: {
            publicKey: pool.poolTokenMint,
            account: poolTokenMint,
          },
          poolVault: {
            publicKey: pool.assets[0],
            account: poolVault,
          },
          megaPool: {
            publicKey: registrar.megaPool,
            account: megaPool,
          },
          megaPoolTokenMint: {
            publicKey: megaPool.poolTokenMint,
            account: megaPoolTokenMint,
          },
          megaPoolVaults: megaPoolVaults.map((v, idx) => {
            return {
              publicKey: megaPool.assets[idx],
              account: v,
            };
          }),
        },
      });
    };

    const fetchBootstrapData = async () => {
      await Promise.all([fetchEntityAccounts(), fetchPoolData()]);
      dispatch({
        type: ActionType.CommonAppDidStart,
        item: {},
      });
    };

    fetchBootstrapData();
  }, [dispatch, registryClient.provider.connection]);

  // Wallet connection event listeners.
  useEffect(() => {
    wallet.on('disconnect', () => {
      dispatch({
        type: ActionType.CommonWalletReset,
        item: {},
      });
      enqueueSnackbar('Disconnected from wallet', {
        variant: 'info',
        autoHideDuration: 2500,
      });
    });
    wallet.on('connect', async () => {
      dispatch({
        type: ActionType.CommonWalletIsConnected,
        item: {
          walletIsConnected: true,
        },
      });

      const fetchOwnedTokenAccounts = async () => {
        const ownedTokenAccounts = await token.getOwnedTokenAccounts(
          client.provider.connection,
          wallet.publicKey,
        );
        dispatch({
          type: ActionType.CommonOwnedTokenAccountsSet,
          item: {
            ownedTokenAccounts,
          },
        });
      };

      const fetchVestingAccounts = async () => {
        const vestingAccounts = (
          await client.accounts.allVestings(wallet.publicKey)
        )
          // TODO: change struct layout so we can memcmp this on the RPC instead.
          .filter(
            (v: ProgramAccount<accounts.Vesting>) =>
              v.account.safe.toString() === client.safe.toString(),
          );
        dispatch({
          type: ActionType.LockupSetVestings,
          item: {
            vestingAccounts,
          },
        });
      };

      const fetchMemberAccount = async () => {
        const members = (
          await registryClient.accounts.membersWithBeneficiary(wallet.publicKey)
        )
          // TODO: change struct layout so we can memcmp this on the RPC instead.
          .filter(
            (m: ProgramAccount<registry.accounts.Member>) =>
              m.account.registrar.toString() ===
              registryClient.registrar.toString(),
          );

        if (members.length > 0) {
          // TODO: probably want a UI to handle multiple member accounts and
          //       choosing between them.
          dispatch({
            type: ActionType.RegistrySetMember,
            item: {
              member: members[0],
            },
          });
        }
      };

      await Promise.all([
        fetchOwnedTokenAccounts(),
        fetchVestingAccounts(),
        fetchMemberAccount(),
      ]);
      enqueueSnackbar(`Connection established ${wallet.publicKey.toBase58()}`, {
        variant: 'success',
        autoHideDuration: 2500,
      });
    });
  }, [wallet, dispatch, enqueueSnackbar, client.provider.connection]);

  return isConnected ? (
    <Button style={props.style} color="inherit" onClick={disconnect}>
      <Typography style={{ fontSize: '18px' }}>Disconnect</Typography>
    </Button>
  ) : (
    <Button style={props.style} color="inherit" onClick={connect}>
      <PersonIcon />
      <Typography style={{ marginLeft: '5px', fontSize: '15px' }}>
        Connect wallet
      </Typography>
    </Button>
  );
}
