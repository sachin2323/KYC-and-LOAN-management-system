import React, { Component } from 'react';
import { Card, Table, Button, message, Tag, Modal, Checkbox, Row, Col, DatePicker, Form } from 'antd';
import { listClientApprovedRequest, releaseRequest } from '../../Models/KYCRecords';
class ClientApprovedRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      KYC: [],
      visible: false,
      selectedRecord: null,
      confirmLoading: false,
    }
    this.columns = [{
      title: 'Aadhaar ID',
      dataIndex: 'aadharId',
      key: 'aadharId',
    }, {
      title: 'Bank Name',
      dataIndex: 'bankName',
      key: 'bankName',
    }
      , {
      title: 'Actions',
      dataIndex: 'actions',
      render: (text, record, index) => {
        if (record.user_status === "Request") {
          return "Waiting for user approval";
        } else if (record.user_status === "Rejected") {
          return "Rejected By User"
        } else if (record.bank_status === "Rejected") {
          return "Rejected By CB"
        } else if (record.bank_status === "Approved") {
          return "Approved";
        }
        return (
          <div style={{ display: "flex" }}>
            <Button type="primary" onClick={() => this.openModal(record)}>Release</Button>
            <Button type="danger" style={{ marginLeft: "15px" }} onClick={() => this.handleApprove(record, "Rejected")}>Reject</Button>
          </div>
        )
      }
    }
    ];
  }

  componentDidMount() {
    this.listRequest()
  }

  openModal = (record) => {
    this.setState({
      visible: true,
      selectedRecord: record
    })
  }

  handleCancel = () => {
    this.setState({
      visible: false,
      selectedRecord: null
    })
  }

  renderAllowed = () => {
    let options = this.state.selectedRecord.approvedInfos.map((option, i) => {
      return <p>{option}</p>
    })
    return (
        <Row display="flex">
          {options}
        </Row>
    )

  }

  renderContent = () => {
    return (
      <div>
        <h3>Allowed fields</h3>
        {this.state.selectedRecord ? this.renderAllowed() : null}
      </div>
    )
  }


  listRequest = () => {
    message.loading("Fetching request from Blockchain Ledger...", 0)
    this.setState({ loading: true })
    listClientApprovedRequest({
      onSuccess: (data) => {
        console.log("data", data.response)
        this.setState({
          loading: false,
          KYC: this.parseKYC(data.response)
        })
        message.destroy()
        // message.success("Synced with Ledger!")
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

  parseKYC = (users) => {
    let returnData = []
    for (let i=0; i<users.length; i++) {
      for (let k=0; k<users[i].banks.length; k++) {
        // if (users[i].banks[k].bank_status === "Request" && users[i].banks[k].user_status === "Approved") {
          returnData.push({
            key : Math.random(),
            aadharId: users[i].aadharRaw,
            bankName: users[i].banks[k].name,
            bankID: users[i].banks[k].bankID,
            userId: users[i].userId,
            bank_status: users[i].banks[k].bank_status,
            user_status: users[i].banks[k].user_status,
            approvedInfos: users[i].banks[k].approved_infos,
          })
        // }
      }
    }
    console.log("return", returnData)
    return returnData
  }

  handleApprove = (record, status) => {
    this.setState({ confirmLoading: true })
    message.loading('Action in progress..', 0);
    releaseRequest({
      data: {
        "organization_id": record.bankID,
        "status": status,
        "userId": record.userId
      },
      onSuccess: (data) => {
        this.setState({
          visible: false,
          confirmLoading: false,
          allowed: [],
          selectedRecord: null
        })
        message.destroy()
        message.success(`Request ${status}`)
        this.listRequest()
      },
      onError: (data) => {
        this.setState({
          confirmLoading: false,
        })
        message.destroy()
        message.error('Unable to Process')
      }
    })
  }

  render() {
    return (
      <div>
        <Card title="List of KYCs Requested By Bank">
          <Modal
            title={this.state.selectedRecord ? `${this.state.selectedRecord.bankName} [${this.state.selectedRecord.bankID}]` : null}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            okText={"Approve"}
            onOk={() => this.handleApprove(this.state.selectedRecord, "Approved")}
            width={800}
            confirmLoading={this.state.confirmLoading}
          >
            {this.renderContent()}
          </Modal>
          <Table dataSource={this.state.KYC} columns={this.columns} loading={this.state.loading} />
        </Card>
      </div>
    );
  }
}

export default ClientApprovedRequest;