import React, { Component } from 'react';
import axios from 'axios';
import emailjs from 'emailjs-com';
import { Button, Modal, Input, message, Spin, Row, Col, Alert, Form, Checkbox } from 'antd';
import { searchPPS, createRequest } from '../../Models/KYCRecords';
const Search = Input.Search;
const FormItem = Form.Item;
const { TextArea } = Input;

class SearchKYC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible : false,
      loading : false,
      info : null,
      notFound : false,
      value:null,
      feedback: '', 
      name: 'Bank', 
      email: '',
    }
  }


  handleSubmit = (event) =>{
	const templateId = "template_6Zn9ZXpl";

	this.sendFeedback(templateId, {message_html: this.state.feedback, from_name: this.state.name, reply_to: this.state.email})
  }

  sendFeedback = (templateId, variables) => {
	window.emailjs.send(
  	'gmail', templateId,
  	variables
  	).then(res => {
      message.success("Email Sent!")
      console.log('Email successfully sent!');
      
  	})
  	// Handle errors here however you like, or use a React error boundary
  	.catch(err =>message.error("Unable to raise request"))
  }

//console.error('Oh well, you failed. Here some thoughts on the error that occured:', err)  
  handleChange = (e) =>{
    this.setState({value : e.target.value })
  } 

  handleFeedbackChange = (e) =>{
    this.setState({feedback : e.target.value })
  } 

  handleEmailChange = (e) =>{
    this.setState({email : e.target.value })
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
/*
  ContactUs = () => {

  sendEmail =(e) => {
    e.preventDefault();

    emailjs.sendForm("gmail", "template_6Zn9ZXpl", e.target, "user_EPcVsIpvwYB3du8KUTzKl")
      .then((result) => {
          console.log(result.text);
      }, (error) => {
          console.log(error.text);
      });
  }
  }

  return (
    <form className="contact-form" onSubmit={sendEmail}>
      <input type="hidden" name="contact_number" />
      <label>Name</label>
      <input type="text" name="user_name" />
      <label>Email</label>
      <input type="email" name="user_email" />
      <label>Message</label>
      <textarea name="message" />
      <input type="submit" value="Send" />
    </form>
  );
}*/

  handleSearch = (value) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          loading : true,
          info : null
        })
        searchPPS({
          data: {
            PPS_number: value
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
            console.log("error")
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
        "PPS_number": this.state.info.PPSNumber,
        required_documents: this.state.value
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
                <p><strong>PPS ID: </strong>{this.state.info.PPSNumber}</p>
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
            <p>{this.state.info}</p>
            <Form className="test-mailing">
    	      <h1>Let's see if it works</h1>
            <div>
            <h1>Email</h1>
            <Input type="email" 
            name="user_email"
            placeholder = "Email ID"
            onChange={this.handleEmailChange} 
            value = {this.state.email}
            />
              <TextArea
                id="test-mailing"
                name="test-mailing"
                onChange={this.handleFeedbackChange}
                placeholder="Post some lorem ipsum here"
                required
                value={this.state.feedback}
                style={{width: '100%', height: '150px'}}
              />
            </div>
            <Input type="button" value="Submit" className="btn btn--submit" onClick={this.handleSubmit} />
          </Form>
          </div>
        )
      }
    } else {
      return null;
    }
    
  }

  renderSearchContainer = (record) => {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form >
          <FormItem>
            {getFieldDecorator('search', {
              rules: [{ required: true, message: 'Please Input PPS ID!' }],
            })(
              <Search
                placeholder="Search KYC with PPS ID"
                onSearch={value => this.handleSearch(value)}
                enterButton
              />
            )}
            {
             <TextArea autosize = {true}
             placeholder="Enter the required documents needed"
             id = "required_documents"
             onChange = {this.handleChange}
             value = {this.state.value} 
             />
          }
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