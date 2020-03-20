import React, { Component } from 'react'
import { Modal, Button, Table, message, Tag, Row, Col } from 'antd';
import { getInfo, processKYC } from '../../Models/KYCRecords';
import { getCurrentUser } from '../../Models/Auth';
const keyMaping = {
  name : 'Name',
  birth_marks: 'Birth Marks',
  card_information: 'Card Information',
  date_of_birth : 'Date of Birth',
  preferences: 'Preferences',
  nationality: 'Nationality',
  mothers_maiden_name : 'Mother\'s maiden name',
  aadharId: 'Aadhaar ID',
  phoneNumbers: 'Phone Number',
  drivers_license: 'Driver\'s License',
  email_address: 'E-mail',
  dateOfBirth: "Date Of Birth",
  passport: 'Passport',
  loyalty_cards: 'Loyalty Cards'
};
export default class InfoModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      info: null,
      records: null,
      spinner : false,
      
    }
    this.columns = [{
      title: 'Verification ID',
      dataIndex: 'id',
      key: 'id',
    }, {
      title: 'KYC ID',
      dataIndex: 'kycId',
      key: 'kycId',
    }, {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    }];
  }
  fetchInfo = () => {
    this.setState({spinner : true})
    getInfo({
      data: {
        aadhar_number: this.props.record.aadharId
      },
      onSuccess: (data) => {
        console.log(data.response[0].kyc_record)
        this.setState({
          info: data.response[0].kyc_record,
          records: this.parseRecords(data.response),
          spinner : false
        })
      },
      onError: (data) => {
        message.error("Unable to get KYC Info")
      }
    })
  }

  parseInfo = () => {
    var items = [];
    for (var key in this.props.record) {
      items.push(<p><strong>{keyMaping[key]}:</strong> {this.props.record[key]}</p>);
    }
    return items;
  }

  parseRecords = (response) => {
    let data = []
    for (let i = 0; i < response.length; i++) {
      if (!Object.keys(response[i].verification_record).length == 0 && (response[i].verification_record.organizationId !== getCurrentUser().organizationID))
        data.push(response[i].verification_record)
    }
    console.log("dataaaaa", data)
    return data
  }
  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  handleOk = (e) => {
    this.setState({
      visible: false,
    });
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
      info: null
    });
  }

  renderInfo = () => {
    return (
      <div>
        {this.parseInfo()}
      </div>
    )
  }

  // renderInfo = () => {
  //   console.log(this.state.info)
  //   return (
  //     <div>
  //       <Row type="flex" justify="start">
  //         <Col span={12}>
  //       {/* <h2>User Info</h2> */}
  //       <p><strong>Name: </strong>{this.state.info.name}</p>
  //       <p><strong>Aadhaar ID: </strong>{this.state.info.aadharId}</p>
  //       <p><strong>Phone Number: </strong>{this.state.info.phoneNumbers[0]}</p>
  //       </Col>
  //         <Col span={12}>
  //       {/* <h2>Address [{this.state.info.addresses[0].addressType}]</h2> */}
  //           <strong>Address [{this.state.info.addresses[0].addressType}]: </strong>
  //       <p>{this.state.info.addresses[0].addressLine1}</p>
  //       <p>{this.state.info.addresses[0].addressLine2}</p>
  //       <p>{this.state.info.addresses[0].addressLine3}</p>
  //           <p>{this.state.info.addresses[0].cityOrTownOrVillage}, {this.state.info.addresses[0].stateOrUT}, {this.state.info.addresses[0].postalCode}.</p>
  //         </Col>
  //       </Row>
  //       <h2>Verification records</h2>
  //       <Table style={{ marginTop: "15px" }} dataSource={this.state.records} columns={this.columns} loading={this.state.loading} rowKey="id" />
  //     </div>
  //   )
  // }

  render() {
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>Info</Button>
        <Modal
          title="KYC Info"
          visible={this.state.visible}
          okText="Process"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={800}
          footer={false}
        >
          {this.renderInfo()}
        </Modal>
      </div>
    );
  }
}
