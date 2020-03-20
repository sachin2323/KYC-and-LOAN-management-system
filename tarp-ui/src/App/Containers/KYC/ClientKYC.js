import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Button, message, Row, Col, Tag } from 'antd'
import { getCurrentUser } from '../../Models/Auth'
import { getClientKYC } from '../../Models/KYCRecords'

class ClientKYC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      KYC: null
    }
  }

  componentDidMount() {
    this.getClientKYC();
  }
  
  getClientKYC = () => {
    message.loading("Syncing with Ledger...", 0)
    this.setState({ loading: true })
    console.log(getCurrentUser().national_id)
    getClientKYC({
      data : {
        aadhaarId: getCurrentUser().national_id
      },
      onSuccess: (data) => {
        console.log(data)
        this.setState({
          loading: false,
          KYC: data.response.length ? data.response[0].kyc_record : data.response
        })
        message.destroy()
        message.success("Synced with Ledger!", 1)
      },
      onError: (data) => {
        this.setState({
          loading: false,
        })
        message.destroy()
        message.success("Synced with Ledger!", 1)
        // message.error('Unable to get KYC!')
      }
    })
  }

  renderStatus = () => {
    if (this.state.KYC.status === "Processed") {
      return <p><Tag color="#87d068">{this.state.KYC.status}</Tag></p>
    } else {
      return <p><Tag color="#f50">{this.state.KYC.status}</Tag></p>
    }
  }

  renderTitle = () => {
    return (
      <h3 style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>User Info</h3>
    )
  }

  renderUserInfo = () => {
    return (
      <div className="Assets-Card-Content">
        <ul>
          <Row type="flex" justify="start">
            <Col span={6}>
              <li>
                <b>Name</b>
                <p>{this.state.KYC.name}</p>
              </li>
            </Col>
            <Col span={6}>
              <li>
                <b>Aadhaar ID</b>
                <p>{this.state.KYC.aadharId}</p>
              </li>
            </Col>
            {console.log(this.state.KYC.phoneNumbers)}
            <Col span={6}>
              <li>
                <b>Phone Number</b>
                <p>{this.state.KYC.phoneNumbers[0]}</p>
              </li>
            </Col>
            <Col span={6}>
              <li>
                <b>Status</b>
                {this.renderStatus()}
              </li>
            </Col>
          </Row>
        </ul>
      </div>
    )
    
  }

  renderAddressInfo = () => {
    return (
      <div className="Assets-Card-Content">
        <ul>
          <Row type="flex" justify="start">
            <Col span={8}>
              <li>
                <b>Line 1</b>
                <p>{this.state.KYC.addresses[0].addressLine1}</p>
              </li>
            </Col>
            <Col span={8}>
              <li>
                <b>Line 2</b>
                <p>{this.state.KYC.addresses[0].addressLine2}</p>
              </li>
            </Col>
            <Col span={8}>
              <li>
                <b>Line 3</b>
                <p>{this.state.KYC.addresses[0].addressLine3}</p>
              </li>
            </Col>
            <Col span={8}>
              <li>
                <b>City/Town/Village</b>
                <p>{this.state.KYC.addresses[0].cityOrTownOrVillage}</p>
              </li>
            </Col>
            <Col span={8}>
              <li>
                <b>Postal Code</b>
                <p>{this.state.KYC.addresses[0].postalCode}</p>
              </li>
            </Col>
            <Col span={8}>
              <li>
                <b>State/Union Teritory</b>
                <p>{this.state.KYC.addresses[0].stateOrUT}</p>
              </li>
            </Col>
          </Row>
        </ul>
      </div>
    )

  }

  renderContent = () => {
    return (
      <div>
        <div className="Card-Title">
          <h3 >User Info</h3>
        </div>
        {this.state.KYC.length !== 0 ? this.renderUserInfo() : null}
        <div className="Card-Title">
          <h3>Address [{this.state.KYC.addresses[0].addressType}]</h3>
        </div>
        {this.state.KYC.length !== 0 ? this.renderAddressInfo() : null}
      </div>

    )
  }

  renderCard = () => {
    if (this.state.KYC === null) {
      return (
        <Card title="KYC Record" loading={true} >
        </Card>
      )
    } else if (this.state.KYC) {
      if (this.state.KYC.length !== 0) {
        return (
          <Card title="KYC Record" >
            <div className="Asset-Cards">
              <Row type="flex" justify="space-between" align="top">
                <Col lg={24} sm={24}>
                  <Card className="Asset-Details-Card" bordered={false} loading={this.state.loading}>
                    {this.state.KYC ? this.renderContent() : null}
                  </Card>
                </Col>
              </Row>
            </div>
          </Card>
        )
      } else {
        return (
          <Card title="KYC Record" extra={<Link to="/client/kyc/add-kyc"><Button type="primary">Add KYC</Button></Link>}>
            <h3 style={{ color: "#052B82", textAlign: "center" }}>No record found</h3>
          </Card>
        )
      }
      
    }
    
  }
  render() {
    return (
      <div>
      {this.renderCard()}
      </div>
    );
  }
}

export default ClientKYC;