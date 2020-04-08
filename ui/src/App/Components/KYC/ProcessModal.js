import React, { Component } from "react";
import { Modal, Button, Table, message, Tag, Row, Col, Input } from "antd";
import { getInfo, processKYC } from "../../Models/KYCRecords";
import { getCurrentUser } from "../../Models/Auth";
const { TextArea } = Input;
export default class InfoModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      info: null,
      records: null,
      processButton: false,
      rejectButton: false,
      value:null,
      status:null,
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
  };


  handleAccepted = (e) =>{
    this.setState({status:e});
    this.handleProcess();
  };

  handleRejected = (e) =>{
    this.setState({status:e});
    this.handleProcess();
  };

  handleChange = (e) =>{
    this.setState({value : e.target.value })
  };

  handleProcess = (record) => {
    this.setState({ processButton: true });
    processKYC({
      data: {
        kyc_id: this.props.record.id,
        status:this.state.status,
        reference_verification_id: record ? record.id : "No reference ID",
        suggestion: this.state.value
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
        PPS_number: this.props.record.PPSId
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
        this.setState({ processed: null });
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
              <strong>PPS ID: </strong>
              {this.state.info.PPSId}
            </p>
            <p>
              <strong>Phone Number: </strong>
              {this.state.info.phoneNumbers[0]}
            </p>
            <p>
              <strong>E-mail: </strong>
              {this.state.info.email_address}
            </p>
            <p>
              <strong>Date of Birth: </strong>
              {this.state.info.date_of_birth}
            </p>
            <p>
              <strong>Mother's maiden name: </strong>
              {this.state.info.mothers_maiden_name}
            </p>
            <p>
              <strong>Birth Marks: </strong>
              {this.state.info.birth_marks}
            </p>
            <p>
              <strong>Passport: </strong>
              {this.state.info.passport}
            </p>
            <p>
              <strong>Driver's License: </strong>
              {this.state.info.drivers_license}
            </p>
            <p>
              <strong>National Age Card: </strong>
              {this.state.info.national_age_card}
            </p>
            <p>
              <strong>Identification Form: </strong>
              {this.state.info.identificationForm}
            </p>
            <p>
              <strong>Utility Bills: </strong>
              {this.state.info.utilityBills}
            </p>
            <p>
              <strong>Home Insurance: </strong>
              {this.state.info.homeInsurance}
            </p>
            <p>
              <strong>Car Insurance: </strong>
              {this.state.info.carInsurance}
            </p>
            <p>
              <strong>Tax Credit Certificate: </strong>
              {this.state.info.taxCreditCertificate}
            </p>
            <p>
              <strong>Salary Certificate: </strong>
              {this.state.info.salaryCertificate}
            </p>
            <p>
              <strong>Employee Pay slip: </strong>
              {this.state.info.employeePayslip}
            </p>
            <p>
              <strong>Bank Statement: </strong>
              {this.state.info.bankStatement}
            </p>
            <p>
              <strong>Other: </strong>
              {this.state.info.other}
            </p>
            <p>
            <Button
                type="primary"
                href={this.state.info.PPSIDUrl}	
              >
                View PPS ID Proofs
              </Button></p>
              <p>
            <Button
                type="primary"
                href={this.state.info.driversLicenseUrl}	
              >
                View Driver License Proofs
              </Button></p>
              <p>
            <Button
                type="primary"
                href={this.state.info.passportUrl}	
              >
                View Passport Proofs
              </Button></p>
              <p>
            <Button
                type="primary"
                href={this.state.info.nationalAgeCardUrl}	
              >
                View National Age Card Proofs
              </Button></p>
              <p>
            <Button
                type="primary"
                href={this.state.info.identificationFormUrl}	
              >
                View Identification Form Proofs
              </Button></p>
           <p>   <Button
                type="primary"
                href={this.state.info.utilityBillsUrl}	
              >
                View Utility Bills Proofs
              </Button></p>
           <p>   <Button
                type="primary"
                href={this.state.info.homeInsuranceUrl}	
              >
                View Home Insurance Proofs
              </Button></p>
          <p>    <Button
                type="primary"
                href={this.state.info.carInsuranceUrl}	
              >
                View Car Insurance Proofs
              </Button></p>
          <p>     <Button
               type="primary"
               href={this.state.info.taxCreditCertificateUrl}	
             >
               View  Tax Credit Certificate Proofs
             </Button></p>
       <p>       <Button
              type="primary"
              href={this.state.info.salaryCertificateUrl}	
            >
              View Salary Certificate Proofs
            </Button></p>
      <p>       <Button
             type="primary"
             href={this.state.info.employeePayslipUrl}	
           >
             View Employee Pay Slip Proofs
           </Button></p>
      <p>      <Button
            type="primary"
            href={this.state.info.bankStatementUrl}	
          >
            View Bank Statement Proofs
          </Button></p>
     <p>      <Button
           type="primary"
           href={this.state.info.otherUrl}	
         >
           View Other Proofs
         </Button></p>
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
        {
             <TextArea autosize = {true}
             placeholder="Enter any suggestions"
             id = "suggestion"
             onChange = {this.handleChange}
             value = {this.state.value} 
             />
          }
          {!this.state.processed ? (
            <Button
              type="primary"
              loading={this.state.processButton}
              onClick={()=>{this.handleAccepted("Processed")}}
            >
              Process
            </Button>
          ) : (
            <b>Processed!</b>
          )}
            {!this.state.processed ? (
            <Button
              type="primary"
              loading={this.state.rejectButton}
              onClick={()=>{this.handleRejected("Rejected")}}
            >
              Reject
            </Button>
          ) : (
            <b>Rejected!</b>
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
