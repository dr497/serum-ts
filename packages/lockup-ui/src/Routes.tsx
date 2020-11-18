import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import NewVestingAccount from './pages/lockup/NewVestingAccount';
import VestingAccounts from './pages/lockup/VestingAccounts';
import Entities from './pages/registry/Entities';
import Entity from './pages/registry/Entity';

export default function Routes() {
  return (
    <React.Fragment>
      <HashRouter basename={'/'}>
        <Layout>
          <Route exact path="/" component={VestingAccounts} />
          <Route exact path="/lockup" component={VestingAccounts} />
          <Route
            exact
            path="/lockup/vesting/new"
            component={NewVestingAccount}
          />
          <Route exact path="/registry/entities" component={Entities} />
        </Layout>
      </HashRouter>
    </React.Fragment>
  );
}
