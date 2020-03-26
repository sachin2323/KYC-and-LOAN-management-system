import React from 'react';
import {
  Route,
} from 'react-router-dom';
import MainHeader from '../Components/Shared/Header';
import Authenticator from './Authenticator';
import { Layout } from 'antd';
const { Content, Header } = Layout;
const PrivateRoute = ({ component: Component, ...rest , allowed}) => (
  <Route {...rest} render={props => (
    <Authenticator allowed={allowed}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header>
          <MainHeader />
        </Header>
          <Layout className="Main-Layout">
            <Content>
              <Component {...props} />
            </Content>
          </Layout>
      </Layout>
    </Authenticator>
  )}/>
)

export default PrivateRoute;
