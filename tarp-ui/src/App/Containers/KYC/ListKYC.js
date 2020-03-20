import React, { Component } from 'react'
import { Card, Table, Button, message, Tag } from 'antd';
import { listKYCs } from '../../Models/KYCRecords';
import { Link } from 'react-router-dom'
import ProcessModal from '../../Components/KYC/ProcessModal';
import ImportKYC from '../../Components/KYC/ImportKYC';
export default class ListKYC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      KYC: []
    }
    this.columns = [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: 'Aadhaar ID',
      dataIndex: 'aadharId',
      key: 'aadharId',
    }, {
      title: 'Phone Number',
      dataIndex: 'phone_numbers',
      render: (text, record) => {
        return (
          <span>{record.phoneNumbers[0]}</span>
        )
      }
    }, {
      title: 'Actions',
      dataIndex: 'actions',
      render: (text, record, index) => {
        return (
          <div style={{ display: "flex" }}>
            {record.status === "Unprocessed" ? (
              <ProcessModal record={record} list={this.listKYCs}/> ) : (
                "Processed"
              )}
          </div>
        )
      }
    }
    ];
  }

  componentDidMount() {
    this.listKYCs()
  }

  listKYCs = () => {
    message.loading("Fetching KYC records from Blockchain Ledger...", 0)
    this.setState({ loading: true })
    listKYCs({
      onSuccess: (data) => {
        this.setState({
          loading: false,
          KYC: data.response
        })
        message.destroy()
        message.success("Synced with Ledger!")
      },
      onError: (data) => {
        this.setState({
          loading: false,
        })
        message.destroy()
        // message.error('Unable to KYC')
      }
    })
  }
  render() {
    return (
      <div>
        <Card title="List Of KYC" extra={<div style={{ display: "flex", justifyContent: "space-between" }}><Link to="/client/kyc/add-kyc"><Button style={{marginRight : "15px"}} type="primary">Add KYC</Button></Link><ImportKYC listKyc={this.listKYCs}/></div>}>
          <Table dataSource={this.state.KYC} columns={this.columns} loading={this.state.loading} rowKey="id" />
        </Card>
      </div>
    )
  }
}
