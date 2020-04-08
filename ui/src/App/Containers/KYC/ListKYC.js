import React, { Component } from 'react'
import { Card, Table, Button, message, Tag, Divider } from 'antd';
import { listKYCs, getKYCProof } from '../../Models/KYCRecords';
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
      title: 'PPS ID',
      dataIndex: 'PPSId',
      key: 'PPSId',
    }, {
      title: 'Phone Number',
      dataIndex: 'phone_numbers',
      render: (text, record) => {
        return (
          <span>{record.phoneNumbers[0]}</span>
        )
      }
    },{
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },{
      title: 'Suggestion',
      dataIndex: 'suggestion',
      key: 'suggestion',
    },{
      title: 'Actions',
      dataIndex: 'actions',
      render: (text, record, index) => {
        return (
          <div style={{ display: "flex" }}>
            {(<ProcessModal record={record} list={this.listKYCs}/>)}
          </div>
        )
      }
    }
    ];
  }
/*
  downloadProofs = record => {
    this.setState({ loading: true });
          const link = document.createElement("a");
          link.setAttribute("href", element.record.PPSIDUrl);
          link.setAttribute("target", "_blank");
          link.click();
        };
        //message.success("Successfully downloaded proof");
        this.setState({
          loading: false
        });
      },
      onError: data => {
        this.setState({
          loading: false
        });
        console.log(data);

        message.error("Unable to download proof");
      }
    });
  };
*/
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
        <Card title="List Of KYC" extra={<div style={{ display: "flex", justifyContent: "space-between" }}><ImportKYC listKyc={this.listKYCs}/></div>}>
          <Table dataSource={this.state.KYC} columns={this.columns} loading={this.state.loading} rowKey="id" />
        </Card>
      </div>
    )
  }
}
