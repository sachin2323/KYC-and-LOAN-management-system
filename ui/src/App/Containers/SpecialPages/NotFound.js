import React from 'react';
import MainHeader from '../../Components/Shared/Header';
import { Layout } from 'antd';
const { Content, Header } = Layout;

export default class NotFound extends React.Component {

  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header>
          <MainHeader />
        </Header>
        <Layout className="Main-Layout">
          <Content>
            <div className="Page-not-found">
              <h1>404 </h1>
              <h3>Page Not Found</h3>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}