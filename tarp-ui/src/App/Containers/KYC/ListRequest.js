import React, { Component } from 'react'
import { Card, Table, Button, message, Tag, Modal, Checkbox, Row, Col, DatePicker, Form } from 'antd';
import moment from 'moment';
import { listRequest, approveRequest } from '../../Models/KYCRecords';
import InfoModal from '../../Components/KYC/InfoModal';
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;

class ListRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      KYC: [],
      visible : false,
      selectedRecord : null,
      confirmLoading : false,
      options : [
        { label: 'Name', value: 'Name' },
        { label: 'Aadhaar ID', value: 'AadharID' },
        { label: 'Phone Number', value: 'PhoneNumbers' },
        { label: 'Date Of Birth', value: 'DateOfBirth' },
        { label: 'Birth Marks', value: 'BirthMarks' },
        { label: 'Mother\'s Maiden Name', value: 'MothersMaidenName' },
        { label: 'Driver License', value: 'DriversLicense' },
        { label: 'Passport', value: 'Passport' },
        { label: 'Card Information', value: 'CardInformation' },
        { label: 'Nationality', value: 'Nationality' },
        { label: 'E-mail', value: 'EmailAddress' },
        { label: 'Loyalty Cards', value: 'LoyaltyCards' },
        { label: 'Preferences', value: 'Preferences' },
      ],
      allowed : []
    }
    this.columns = [{
      title: 'ID',
      dataIndex: 'bankID',
      key: 'bankID',
    }, {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: 'Actions',
      dataIndex: 'actions',
      render: (text, record, index) => {
        if (record.user_status !== "Request") {
          return record.user_status
        }
        return (
          <div style={{ display: "flex" }}>
            <Button type="primary" onClick={() => this.openModal(record)}>Approve</Button>
            {/* <Button type="primary" onClick={() => this.approveRequest(record, "Approved")}>Approve</Button> */}
            <Button type="danger" style={{ marginLeft: "15px" }} onClick={() => this.approveRequest(record, "Rejected")}>Reject</Button>
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
      visible : true,
      selectedRecord : record
    })
  }

  listRequest = () => {
    message.loading("Fetching request from Blockchain Ledger...", 0)
    this.setState({ loading: true })
    listRequest({
      onSuccess: (data) => {
        this.setState({
          loading: false,
          KYC: this.parseKYC(data.response.banks)
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

  handleCancel = () => {
    this.setState({
      visible : false,
      selectedRecord : null
    })
  }

  approveRequest = (record, status, timeLimit) => {
    this.setState({confirmLoading : true})
    message.loading('Action in progress..', 0);
    approveRequest({
      data: {
        "organization_id": record.bankID,
        "status": status,
        timeLimit : timeLimit ? timeLimit : '',
        allowed : this.state.allowed
      },
      onSuccess: (data) => {
        this.setState({ 
          visible : false,
          confirmLoading : false,
          allowed : [],
          selectedRecord : null
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

  parseKYC = (data) => {
    console.log(data)
    // let returnData = []
    // for (let i=0; i<data.length; i++) {
    //   if (data[i].user_status === "Request") {
    //     data[i]['key'] = i;
    //     returnData.push(data[i])
    //   }
    // }
    // return returnData
    return data
  }

  handleAllowedChange = (checkedValues) => {
    this.setState({allowed : checkedValues})
  }

  renderCheckbox = () => {
    let options = this.state.options.map((option, i) => {
      return <Col span={6}><Checkbox value={option.value} >{option.label}</Checkbox></Col>
    })
    return (
      <Checkbox.Group style={{ width: '100%' }} onChange={this.handleAllowedChange}>
      <Row display="flex">
        {options}
      </Row>
      </Checkbox.Group>
    )
    
  }

  renderContent = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <h3>Allowed fields</h3>
        {this.renderCheckbox()}
        <h3>Time Limit</h3>
        <FormItem>
          {getFieldDecorator('timeLimit', {
            rules: [{ required: true, message: 'Please input the time limit!' }],
          })(
            <DatePicker format={'DD/MM/YYYY'} placeholder="Time Limit" showToday={false} />
          )}
        </FormItem>
      </div>
    )
  }

  handleApprove = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.approveRequest(this.state.selectedRecord, "Approved", values.timeLimit)
      }
    });
  }
    
    
  render() {
    return (
      <div>
        <Card title="Bank Requesting For Your KYC">
          <Modal
            title={this.state.selectedRecord ? `${this.state.selectedRecord.name} [${this.state.selectedRecord.bankID}]` : null}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            okText={"Approve"}
            onOk={this.handleApprove}
            width={800}
            confirmLoading={this.state.requestLoader}
            confirmLoading={this.state.confirmLoading}
          >
            {this.renderContent()}
          </Modal>
          <Table dataSource={this.state.KYC} columns={this.columns} loading={this.state.loading} />
        </Card>
      </div>
    )
  }
}

export default Form.create()(ListRequest);
