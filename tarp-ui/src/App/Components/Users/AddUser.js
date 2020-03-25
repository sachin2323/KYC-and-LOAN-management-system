import React, { Component } from 'react'
import { Button, Modal, Form, Input, Select, message, InputNumber } from 'antd';
import { addUser } from '../../Models/Users';

const FormItem = Form.Item;
const Option = Select.Option;

class AddUser extends Component {
  state = { visible: false }

  showModal = () => {
    this.setState({
      visible: true,
      userRole: 'Admin',
      loading: false
    });
  }

  handleOk = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.submit(values)
      }
    });

  }

  handleCancel = (e) => {
    this.props.form.resetFields();
    this.setState({
      visible: false,
    });
  }

  handleChange = (value) => {
    this.setState({ userRole: value })
  }

  submit = (values) => {
    this.setState({
      loading: true
    })
    addUser({
      data: {
        name: values.name,
        email: values.email,
        role: this.state.userRole,
        PPSId: values.PPSId ? values.PPSId : "",
        timestamp: new Date()
      },
      onSuccess: (data) => {
        console.log(data)
        this.setState({
          loading: false,
          visible: false
        })
        this.props.list()
        this.props.form.resetFields();
        message.success('User created successfully!')
      },
      onError: (data) => {
        this.setState({
          loading: false,
          visible: false
        })
        this.props.form.resetFields();
        message.error('Unable to create user!')
      }
    })
  }

  renderPPSIDInput = () => {
    const { getFieldDecorator } = this.props.form;
    if (this.state.userRole === "Client") {
      return (
        <div>
          <FormItem label="PPS ID">
            {getFieldDecorator('PPSId', {
              rules: [
                  {   
                      type:"string",
                      pattern:/^(\d{7})([A-Z]{1,2})$/i, 
                      message: "PPS ID is Invalid. Please Input the correct PPS ID!" 
                  },
                  {
                    
                      required: true,
                      message: "Please input the PPS ID!"
                  
                  }
              ],
            })(
              <Input placeholder="PPS ID" />
            )}
          </FormItem>
        </div>
      )
    } else {
      return null
    }

  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <Button onClick={this.showModal} type="primary">Add New User</Button>
        <Modal
          title="Add New User"
          visible={this.state.visible}
          onOk={this.handleOk}
          okText="Add"
          confirmLoading={this.state.loading}
          onCancel={this.handleCancel}
        >
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem label="Name">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: 'Please input your name!' }],
              })(
                <Input placeholder="Name" />
              )}
            </FormItem>
            <FormItem label="Email">
              {getFieldDecorator('email', {
                rules: [{ required: true, message: 'Please input your Email!' }],
              })(
                <Input type="email" placeholder="Email" />
              )}
            </FormItem>
            <FormItem label="Role">
              {getFieldDecorator('role', {
                initialValue: "Admin",
                rules: [{ required: true, message: 'Please input Role!' }],
              })(
                <Select onChange={this.handleChange.bind(this)}>
                  <Option value="Admin">Admin</Option>
                  <Option value="Client">Client</Option>
                 
                </Select>
              )}
            </FormItem>
            {this.renderPPSIDInput()}
          </Form>
        </Modal>
      </div>
    )
  }
}

export default Form.create()(AddUser);