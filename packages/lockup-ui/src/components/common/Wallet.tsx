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
import { Connection } from '@solana/web3.js';
import Typography from '@material-ui/core/Typography';
import PersonIcon from '@material-ui/icons/Person';
import { sleep, token, Provider } from '@project-serum/common';
// @ts-ignore
import Wallet from '@project-serum/sol-wallet-adapter';
import { Client, accounts } from '@project-serum/lockup';
import { Client as RegistryClient } from '@project-serum/registry';
import * as registry from '@project-serum/registry';
import {
  State as StoreState,
  ProgramAccount,
  WalletConnection,
} from '../../store/reducer';
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
  const { walletProvider, network } = useSelector((state: StoreState) => {
    return {
      walletProvider: state.common.walletProvider,
      network: state.common.network,
    };
  });

  const { wallet, client, registryClient } = useMemo(() => {
		const preflightCommitment = 'recent';
		const opts: { preflightCommitment: 'recent' } = {
			preflightCommitment,
		};
		const connection = new Connection(network.url, preflightCommitment);
		const wallet = new Wallet(walletProvider, network.url);
		const provider = new Provider(connection, wallet, opts);

		return {
			wallet,
			client: new Client({
				provider,
				programId: network.lockupProgramId,
				safe: network.safe,
			}),
			registryClient: new RegistryClient({
				provider,
				programId: network.registryProgramId,
				stakeProgramId: network.stakeProgramId,
				registrar: network.registrar,
			}),
		};
  }, [walletProvider, network]);

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
  const showDisconnect = useSelector(
    (state: StoreState) =>
      state.common.walletConnection === WalletConnection.Connected ||
      state.common.walletConnection === WalletConnection.IsConnecting,
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
      type: ActionType.CommonAppWillBootstrap,
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

    const fetchRegistrar = async () => {
      const registrar = await registryClient.accounts.registrar();
      dispatch({
        type: ActionType.RegistrySetRegistrar,
        item: {
          registrar: {
            publicKey: registryClient.registrar,
            account: registrar,
          },
        },
      });
    };

    const fetchBootstrapData = async () => {
      // Break up to avoid rate limits.
      await fetchRegistrar();
      await Promise.all([fetchEntityAccounts(), fetchPoolData()]);
      dispatch({
        type: ActionType.CommonAppDidBootstrap,
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
      enqueueSnackbar(`Connecting to ${wallet.publicKey.toBase58()}`, {
        variant: 'info',
        autoHideDuration: 2500,
      });
      dispatch({
        type: ActionType.CommonWalletWillConnect,
        item: {},
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
      dispatch({
        type: ActionType.CommonWalletDidConnect,
        item: {},
      });
    });
  }, [wallet, dispatch, enqueueSnackbar, client.provider.connection]);

  return showDisconnect ? (
    <Button style={props.style} color="inherit" onClick={disconnect}>
      <Typography style={{ marginLeft: '5px', fontSize: '15px' }}>
        Disconnect
      </Typography>
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
