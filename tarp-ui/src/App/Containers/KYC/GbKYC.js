import React, { Component } from 'react';
import { Card, Tag, Message, Table, message } from 'antd';
import SearchKYC from '../../Components/KYC/SearchKYC';
import { listApprovedKYCs } from '../../Models/KYCRecords'
import InfoModal from '../../Components/KYC/InfoModal';
class GbKYC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      KYC: []
    }
    this.columns = [{
      title: 'Name',
      dataIndex: 'name',
      render: (text, record) => {
        return (
          <span>{record.name ? record.name : "*Hidden*"}</span>
        )
      }
    }, {
      title: 'Aadhaar ID',
      dataIndex: 'aadharId',
        render: (text, record) => {
          return (
            <span>{record.aadharId ? record.aadharId : "*Hidden*"}</span>
          )
        }
    }, {
      title: 'Phone Number',
      dataIndex: 'phone_numbers',
      render: (text, record) => {
        return (
          <span>{record.phoneNumbers ? record.phoneNumbers[0] : "*Hidden*"}</span>
        )
      }
    }, {
      title: 'Actions',
      dataIndex: 'actions',
      render: (text, record, index) => {
        return (
          <div style={{ display: "flex" }}>
              <InfoModal record={record} list={this.listKYCs} />
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
    message.loading("Fetching Approved KYC from Blockchain Ledger...", 0)
    this.setState({ loading: true })
    listApprovedKYCs({
      onSuccess: (data) => {
        console.log(data)
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

  handleResponse = (data) => {
    let returnData = []
    for (let i = 0; i < data.approved_requests.length; i++) {
      returnData.push(data.approved_requests[i][0].kyc_record)
    }

    return returnData
  }
  
  render() {
    return (
      <div>
        <Card title="KYC" extra={<SearchKYC />}>
          <h3>Approved requests</h3>
          <Table dataSource={this.state.KYC} columns={this.columns} loading={this.state.loading} rowKey="id" />
        </Card>
      </div>
    );
  }
}

export default GbKYC;