import React, {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useContext,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as bs58 from 'bs58';
import * as BufferLayout from 'buffer-layout';
import { useSnackbar } from 'notistack';
import Button from '@material-ui/core/Button';
import { AccountInfo as TokenAccount } from '@solana/spl-token';
// @ts-ignore
import Wallet from '@project-serum/sol-wallet-adapter';
import { Client, accounts, networks } from '@project-serum/lockup';
import { Client as RegistryClient } from '@project-serum/registry';
import { Connection, PublicKey } from '@solana/web3.js';
import { TokenInstructions } from '@project-serum/serum';
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

export function WalletConnectButton(): ReactElement {
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
      const entityAccounts = await getEntityAccounts(
        registryClient.provider.connection,
      );
      dispatch({
        type: ActionType.RegistrySetEntities,
        item: {
          entities: entityAccounts,
        },
      });
			dispatch({
				type: ActionType.CommonAppDidStart,
				item: {},
			});
    };
    fetchEntityAccounts();
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
        const ownedTokenAccounts = await getOwnedTokenAccounts(
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
        const vestingAccounts = await getVestingAccounts(
          client.provider.connection,
          wallet.publicKey,
        );
        dispatch({
          type: ActionType.LockupSetVestings,
          item: {
            vestingAccounts,
          },
        });
      };

      await Promise.all([fetchOwnedTokenAccounts(), fetchVestingAccounts()]);
      enqueueSnackbar(`Connection established ${wallet.publicKey.toBase58()}`, {
        variant: 'success',
        autoHideDuration: 2500,
      });
    });
  }, [wallet, dispatch, enqueueSnackbar, client.provider.connection]);

  return isConnected ? (
    <Button color="inherit" onClick={disconnect}>
      Disconnect
    </Button>
  ) : (
    <Button color="inherit" onClick={connect}>
      Connect wallet
    </Button>
  );
}

export async function getOwnedTokenAccounts(
  connection: Connection,
  publicKey: PublicKey,
): Promise<ProgramAccount<TokenAccount>[]> {
  let filters = getOwnedAccountsFilters(publicKey);
  // @ts-ignore
  let resp = await connection._rpcRequest('getProgramAccounts', [
    TokenInstructions.TOKEN_PROGRAM_ID.toBase58(),
    {
      commitment: connection.commitment,
      filters,
    },
  ]);
  if (resp.error) {
    throw new Error(
      'failed to get token accounts owned by ' +
        publicKey.toBase58() +
        ': ' +
        resp.error.message,
    );
  }
  return (
    resp.result
      // @ts-ignore
      .map(({ pubkey, account: { data } }) => {
        data = bs58.decode(data);
        return {
          publicKey: new PublicKey(pubkey),
          account: parseTokenAccountData(data),
        };
      })
  );
}

export async function getVestingAccounts(
  connection: Connection,
  publicKey: PublicKey,
): Promise<ProgramAccount<accounts.Vesting>[]> {
  let filters = getVestingAccountsFilters(publicKey);

  // @ts-ignore
  let resp = await connection._rpcRequest('getProgramAccounts', [
    networks.devnet.programId.toBase58(),
    {
      commitment: connection.commitment,
      filters,
    },
  ]);
  if (resp.error) {
    throw new Error(
      'failed to get token accounts owned by ' +
        publicKey.toBase58() +
        ': ' +
        resp.error.message,
    );
  }

  return (
    resp.result
      // @ts-ignore
      .map(({ pubkey, account: { data } }) => {
        data = bs58.decode(data);
        return {
          publicKey: new PublicKey(pubkey),
          account: accounts.vesting.decode(data),
        };
      })
  );
}

function getVestingAccountsFilters(publicKey: PublicKey) {
  return [
    {
      memcmp: {
        // todo: update once we move the option around
        // @ts-ignore
        offset: 35, //accounts.vesting.VESTING_LAYOUT.offsetOf('beneficiary'),
        bytes: publicKey.toBase58(),
      },
    },
    {
      dataSize: accounts.vesting.SIZE,
    },
  ];
}

export async function getEntityAccounts(
  connection: Connection,
): Promise<ProgramAccount<registry.accounts.Entity>[]> {
  let filters = getEntityAccountsFilters();

  // @ts-ignore
  let resp = await connection._rpcRequest('getProgramAccounts', [
    registry.networks.devnet.programId.toBase58(),
    {
      commitment: connection.commitment,
      filters,
    },
  ]);
  if (resp.error) {
    throw new Error('failed to get entity accounts');
  }

  return (
    resp.result
      // @ts-ignore
      .map(({ pubkey, account: { data } }) => {
        data = bs58.decode(data);
        return {
          publicKey: new PublicKey(pubkey),
          account: registry.accounts.entity.decode(data),
        };
      })
  );
}

// All initialized entity accounts.
function getEntityAccountsFilters() {
  return [
    {
      memcmp: {
        offset: 0,
        bytes: '2',
      },
    },
    {
      dataSize: registry.accounts.entity.SIZE,
    },
  ];
}

// todo: remove
export const ACCOUNT_LAYOUT = BufferLayout.struct([
  BufferLayout.blob(32, 'mint'),
  BufferLayout.blob(32, 'owner'),
  BufferLayout.nu64('amount'),
  BufferLayout.blob(93),
]);
export const MINT_LAYOUT = BufferLayout.struct([
  BufferLayout.blob(44),
  BufferLayout.u8('decimals'),
  BufferLayout.blob(37),
]);

export function parseTokenAccountData(data: any) {
  // @ts-ignore
  let { mint, owner, amount } = ACCOUNT_LAYOUT.decode(data);
  return {
    mint: new PublicKey(mint),
    owner: new PublicKey(owner),
    amount,
  };
}

// @ts-ignore
export function parseMintData(data) {
  // @ts-ignore
  let { decimals } = MINT_LAYOUT.decode(data);
  return { decimals };
}

// @ts-ignore
export function getOwnedAccountsFilters(publicKey) {
  return [
    {
      memcmp: {
        // @ts-ignore
        offset: ACCOUNT_LAYOUT.offsetOf('owner'),
        bytes: publicKey.toBase58(),
      },
    },
    {
      dataSize: ACCOUNT_LAYOUT.span,
    },
  ];
}