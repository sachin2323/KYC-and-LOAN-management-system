import React, { Component } from "react";
import { Modal, Button, Table, message, Tag, Row, Col } from "antd";
import { getInfo, processKYC } from "../../Models/KYCRecords";
import { getCurrentUser } from "../../Models/Auth";
export default class InfoModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      info: null,
      records: null,
      processButton: false
    };
    this.columns = [
      {
        title: "Verification ID",
        dataIndex: "id",
        key: "id"
      },
      {
        title: "KYC ID",
        dataIndex: "kycId",
        key: "kycId"
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status"
      }
    ];
  }

  handleProcess = record => {
    this.setState({ processButton: true });
    processKYC({
      data: {
        kyc_id: this.props.record.id,
        status: "Processed",
        reference_verification_id: record ? record.id : "No reference ID"
      },
      onSuccess: data => {
        this.setState({
          processButton: false,
          visible: false
        });
        this.props.list();
        message.success("Successfully processed KYC!");
      },
      onError: data => {
        console.log(data);
        this.setState({ processButton: false, visible: false });
        message.error("Unable to process KYC");
      }
    });
  };
  fetchInfo = () => {
    getInfo({
      data: {
        aadhar_number: this.props.record.aadharId
      },
      onSuccess: data => {
        console.log("data", data.response);
        this.setState({
          info: data.response[0].kyc_record,
          records: this.parseRecords(data.response)
        });
      },
      onError: data => {
        message.error("Unable to get KYC Info");
      }
    });
  };

  parseRecords = response => {
    console.log("res", response);
    console.log(getCurrentUser());
    let data = [];
    for (let i = 0; i < response.length; i++) {
      console.log(response[i]);
      if (
        !Object.keys(response[i].verification_record).length == 0 &&
        response[i].verification_record.organizationId !==
          getCurrentUser().organizationID
      )
        console.log("came1");
      data.push(response[i].verification_record);
      if (!Object.keys(response[i].verification_record).length == 0) {
        this.setState({ processed: true });
        console.log("came");
      }
    }
    return data;
  };
  showModal = () => {
    this.fetchInfo();
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    this.setState({
      visible: false
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
      info: null
    });
  };

  renderInfo = () => {
    console.log(this.state.info);
    return (
      <div>
        <Row type="flex" justify="start">
          <Col span={12}>
            {/* <h2>User Info</h2> */}
            <p>
              <strong>Name: </strong>
              {this.state.info.name}
            </p>
            <p>
              <strong>Aadhaar ID: </strong>
              {this.state.info.aadharId}
            </p>
            <p>
              <strong>Phone Number: </strong>
              {this.state.info.phoneNumbers[0]}
            </p>
          </Col>
          <Col span={12}>
            {/* <h2>Address [{this.state.info.addresses[0].addressType}]</h2> */}
            <strong>
              Address [{this.state.info.addresses[0].addressType}]:{" "}
            </strong>
            <p>{this.state.info.addresses[0].addressLine1}</p>
            <p>{this.state.info.addresses[0].addressLine2}</p>
            <p>{this.state.info.addresses[0].addressLine3}</p>
            <p>
              {this.state.info.addresses[0].cityOrTownOrVillage},{" "}
              {this.state.info.addresses[0].stateOrUT},{" "}
              {this.state.info.addresses[0].postalCode}.
            </p>
          </Col>
        </Row>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div />
          {!this.state.processed ? (
            <Button
              type="primary"
              loading={this.state.processButton}
              onClick={this.handleProcess}
            >
              Process
            </Button>
          ) : (
            <b>Processed!</b>
          )}
        </div>
        {/* <Table style={{ marginTop: "15px" }} dataSource={this.state.records} columns={this.columns} loading={this.state.loading} rowKey="id" /> */}
      </div>
    );
  };

  render() {
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>
          Process
        </Button>
        <Modal
          title="KYC Info"
          visible={this.state.visible}
          okText="Process"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={800}
          footer={false}
        >
          {this.state.info ? this.renderInfo() : null}
        </Modal>
      </div>
    );
  }
}
