import React, { Component } from 'react';
import { Button, Modal, Input, message, Spin, Row, Col, Alert, Form } from 'antd';
import { searchAadhaar, createRequest } from '../../Models/KYCRecords';
const Search = Input.Search;
const FormItem = Form.Item;

class SearchKYC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible : false,
      loading : false,
      info : null,
      notFound : false
    }
  }

  handleOk = () => {
    this.setState({ visible: true })
  }

  handleCancel = () => {
    this.props.form.resetFields()
    this.setState({
      visible : false,
      info : null,
      notFound : false,
      loading : false,
      requestLoader : false
    })
  }

  handleSearch = (value) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          loading : true,
          info : null
        })
        searchAadhaar({
          data: {
            aadhar_number: value
          },
          onSuccess: (data) => {
            if (!data.response.length) {
              this.setState({
                loading : false,
                notFound : true,
                info : data.response
              })
            } else {
              this.setState({
                info: data.response[0].kyc_record,
                loading : false
              })
            }
          },
          onError: (data) => {
            console.log("rror")
            this.setState({ loading: false })
          }
        })
      }
    })
  }

  handleRaiseRequest = () => {
    this.setState({requestLoader : true})
    createRequest({
      data: {
        "aadhar_number": this.state.info.aadharNumber
      },
      onSuccess: (data) => {
        this.setState({
          requestLoader: false,
          visible : false,
          info : null
        })
        message.success("Request raised!")
      },
      onError: (data) => {
        this.setState({
          requestLoader: false,
        })
        if (data.response.data.error === "Error: chaincode error (status: 500, message: Already applied for the user)") {
          message.warning("Already sent a request!")
        } else {
          message.error("Unable to raise request")
        }
      }
    })
  }

  renderLoader = () => {
    return (
      <div style={{display : "flex", justifyContent : "center", alignItems : "center", marginTop : "15px", flexDirection : "column"}}>
      <h3>Fetching from Blockchain...</h3><br />
        <Spin />
      </div>
    )
  }

  renderInfo = () => {
    if (this.state.info) {
      if (this.state.info.length !== 0) {
        return (
          <div style={{ marginTop: "20px" }}>
            <div className="Card-Title">
              <h3 >Search Result</h3>
            </div>
            <Row type="flex" justify="start">
              <Col span={12}>
                <p><strong>Name: </strong>{this.state.info.name}</p>
              </Col>
              <Col span={12}>
                <p><strong>Aadhaar ID: </strong>{this.state.info.aadharNumber}</p>
              </Col>
            </Row>
          </div>
        )
      } else if (this.state.notFound) {
        return (
          <div style={{ marginTop: "20px" }}>
            <Alert
              message="No records found!"
              type="warning"
              closable
            />
          </div>
        )
      }
    } else {
      return null;
    }
    
  }

  renderSearchContainer = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form >
          <FormItem>
            {getFieldDecorator('search', {
              rules: [{ required: true, message: 'Please Input Aadhaar ID!' }],
            })(
              <Search
                placeholder="Search KYC with Aadhaar ID"
                onSearch={value => this.handleSearch(value)}
                enterButton
              />
            )}
          </FormItem>
        </Form>
        {this.state.loading ? this.renderLoader() : this.renderInfo()}
      </div>
    )
  }
  
  render() {
    return (
      <div>
        <Modal
          title="Search KYC"
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onOk={this.handleRaiseRequest}
          okText="Request for KYC"
          width={800}
          footer={this.state.info && this.state.info.length}
          confirmLoading={this.state.requestLoader}
        >
          {this.renderSearchContainer()}
        </Modal>
        <Button type="primary" onClick={this.handleOk}>Search KYC</Button>
      </div>
    );
  }
}

export default Form.create()(SearchKYC);