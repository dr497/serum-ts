import React, { useMemo, Suspense } from 'react';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from "@material-ui/core/styles";
import CssBaseline from '@material-ui/core/CssBaseline';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from '@material-ui/core/styles';
import { SnackbarProvider } from 'notistack';
import Routes from './Routes';
import { store } from './store';
import { WalletProvider } from './components/common/Wallet';

function App() {
	const theme = createMuiTheme({
		palette: {
			background: {
				default: "rgb(255,255,255)"
			}
		},
		typography: {
			fontFamily: ["Source Sans Pro", "sans-serif"].join(",")
		},
		overrides: {}
	});
  return (
		<Provider store={store}>
			<Suspense fallback={<div></div>}>
				<MuiThemeProvider theme={theme}>
					<CssBaseline />
          <SnackbarProvider maxSnack={5} autoHideDuration={8000}>
						<WalletProvider>
							<Routes />
						</WalletProvider>
					</SnackbarProvider>
				</MuiThemeProvider>
			</Suspense>
		</Provider>
  );
}

export default App;
