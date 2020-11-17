import React from 'react';
import { useSelector } from 'react-redux';
import { useWallet } from '../../components/common/Wallet';
import { State as StoreState } from '../../store/reducer';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Link from '@material-ui/core/Link';
import ChartistGraph from 'react-chartist';
import { FixedScaleAxis, IChartOptions, Interpolation } from 'chartist';
import { Link as RouterLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import BN from 'bn.js';

export default function NewEntity() {
  const { wallet } = useWallet();
  const vestingAccounts = useSelector(
    (state: StoreState) => state.lockup.vestings,
  );

  return <div>NEW ENTITY</div>;
}
