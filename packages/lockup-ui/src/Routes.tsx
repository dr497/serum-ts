import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import NewVestingAccount from './pages/lockup/NewVestingAccount';
import VestingAccounts from './pages/lockup/VestingAccounts';
import NewEntity from './pages/registry/NewEntity';
import Entities from './pages/registry/Entities';
import Entity from './pages/registry/Entity';

export default function Routes() {
  return (
    <React.Fragment>
      <HashRouter basename={'/'}>
        <Layout>
          <Route exact path="/" component={VestingAccounts} />
          <Route exact path="/lockup" component={VestingAccounts} />
          <Route exact path="/lockup/vesting/new" component={NewVestingAccount} />
          <Route exact path="/registry/entities" component={Entities} />
          <Route exact path="/registry/entity/new" component={NewEntity} />
          <Route exact path="/registry/entity/:entityAddress" component={Entity} />
        </Layout>
      </HashRouter>
    </React.Fragment>
  );
}
