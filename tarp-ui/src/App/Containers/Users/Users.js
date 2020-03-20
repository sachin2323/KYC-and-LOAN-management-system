import React, { Component } from 'react'
import { Card, Table, Button, message } from 'antd';
import { list } from '../../Models/Users';
import { timeParser } from '../../Lib/Utils';
import AddUser from '../../Components/Users/AddUser';

const dataSource = [{
  key: '1',
  name: 'Mike',
  email: "admin@skcript.com",
  role: 'Admin'
}, {
  key: '2',
  name: 'John',
  email: "manager@skcript.com",
  role: 'Manager'
}, {
  key: '3',
  name: 'varun',
  email: "client@skcript.com",
  role: 'Client'
}];

export default class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      users: []
    }
    this.columns = [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    }, {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    }, {
      title: 'Aadhaar ID',
      dataIndex: 'national_id',
      render: (text) => {
        if (text) {
          return <span>{text}</span>
        } else {
          return <span><p>–</p></span>
        }

      }
    }, {
      title: 'Created at',
      dataIndex: 'createdAt',
      render: (text) => (
        <span>{timeParser(text)}</span>
      )
    }
    ];
  }

  componentDidMount() {
    this.list()
  }

  list = () => {
    message.loading("Fetching Users from Blockchain Ledger...", 0)
    this.setState({ loading: true })
    list({
      onSuccess: (data) => {
        console.log(data)
        this.setState({
          loading: false,
          users: data.response
        })
        message.destroy()
        message.success("Synced with Ledger!", 1)
      },
      onError: (data) => {
        this.setState({
          loading: false,
        })
        message.destroy()
        message.error('Unable to get users!', 1)
      }
    })
  }

  render() {
    return (
      <div>
        <Card title="List Of Users" extra={<AddUser list={this.list} />}>
          <Table loading={this.state.loading} dataSource={this.state.users} columns={this.columns} rowKey="id" />
        </Card>
      </div>
    )
  }
}
