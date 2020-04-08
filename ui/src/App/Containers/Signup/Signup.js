import React from "react";
import { Redirect, Link } from "react-router-dom";
import { signUp } from "../../Models/Auth";
import {addBuyer, addSeller} from "../../Models/Users";

import {
  Upload,
  message,
  Icon,
  Row,
  Col,
  Spin,
  Form,
  Input,
  Button,
  Checkbox,
  Modal,
  Divider,
} from "antd";
const FormItem = Form.Item;

const Dragger = Upload.Dragger;

class Signup extends React.Component {
  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      newLink: null,
      loading: false,
      visibleBuyer:false,
      visibleSeller:false,
      visibleBank:false,
    };
  };

  handleBuyer = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
    //if (!err) {
        this.submitBuyer(values)
    //}
    });

  };

  handleSeller = (e) => {
  e.preventDefault();
  this.props.form.validateFields((err, values) => {
  //if (!err) {
        this.submitSeller(values)
  // }
   });

  };

  showModalBuyer = () => {
    this.setState({
      visibleBuyer: true,
      loading: false
    });
  };

  showModalSeller = () => {
    this.setState({
      visibleSeller: true,
      loading: false
    });
  };

  showModalBank = () => {
    this.setState({
      visibleBank: true,
      loading: false
    });
  };

  handleCancel = (e) => {
    this.props.form.resetFields();
    this.setState({
      visibleBank: false,
      visibleBuyer:false,
      visibleSeller:false,
    });
  };

  handleSubmit = (e) => {
   e.preventDefault();
   this.props.form.validateFields((err, values) => {
  // if (!err) {
        this.submit(values);
 // }
  });
  };

  submit(values) {
    this.setState({
      loading: true
    });
    values["created_at"] = new Date();
    signUp({
      data: values,
      onSuccess: data => {
        this.setState({
          loading: false,
          newLink: "/login",
          visibleBank:false
        });
        message.success('User successfully registered! Card sent via mail')
      },
      onError: data => {
        this.setState({
          loading: false
        });
        message.error('Registraion Failed!')
        console.log(data);
      }
    });
  };


  submitBuyer(values){
    this.setState({
      loading: true
    })
    addBuyer({
      data: {
        name: values.name,
        email: values.email,
        role: "Client",
        PPSId: values.PPSId,
      },
      onSuccess: (data) => {
        console.log(data)
        this.setState({
          loading: false,
          visibleBuyer: false,
          newLink: "/login"
        })
        this.props.form.resetFields();
        message.success('Buyer successfully registered! Card Sent via mail')
      },
      onError: (data) => {
        this.setState({
          loading: false,
          visibleBuyer: false
        })
        this.props.form.resetFields();
        message.error('Registraion Failed!')
      }
    })
  };

  submitSeller(values){
    this.setState({
      loading: true
    })
    addSeller({
      data: {
        name: values.name ,
        email: values.email, 
        role:"Client",
        PPSId: values.PPSId,
      },
      onSuccess: (data) => {
        console.log(data)
        this.setState({
          loading: true,
          visibleSeller: false,
          newLink: "/login"
        })
        this.props.form.resetFields();
        message.success('Seller successfully registered! Card sent via mail',5)
      },
      onError: (data) => {
        this.setState({
          loading: false,
          visibleSeller: false
        })
        this.props.form.resetFields();
        message.error('Registration Failed!')
      }
    })
  };

  // Renderer
  render() {
    const { getFieldDecorator } = this.props.form;
    if (this.state.newLink) {
      return <Redirect to={this.state.newLink} />;
    };
    
    return (
      <div className="login-wrapper" align="center">
      <Row type="flex" justify="center" align="center">
        <Col md={15} sm={22} xs={22}>
          <div className="login-box" align="center">
            <div className="login-width" align="center">
              <div className="logo-wrapper" align="center">
                <h1>KYC and Loan Management System</h1>
                <h2>Tell us about yourself...</h2>
              </div>
    <div style={{ display: "flex"}}>
    <Button onClick={this.showModalBuyer} type="primary">Add New Buyer</Button>
        <Modal
          title="Add New Buyer"
          visible={this.state.visibleBuyer}
          onOk={this.handleBuyer}
          okText="Add"
          confirmLoading={this.state.loading}
          onCancel={this.handleCancel}
        >
          <Form onSubmit={this.handleBuyer} className="login-form-buyer">
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
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      loading={this.state.loading}
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                    >
                      Sign Up
                    </Button>
                  </div>
          </Form>
        </Modal>
      </div>
      <Divider type="horizontal" />
      <div style={{ display: "flex"}}>
      <Button onClick={this.showModalSeller} type="primary">Add New Seller</Button>
          <Modal
            title="Add New Seller"
            visible={this.state.visibleSeller}
            onOk={this.handleSeller}
            okText="Add"
            confirmLoading={this.state.loading}
            onCancel={this.handleCancel}
          >
            <Form onSubmit={this.handleSeller} className="login-form-seller">
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
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      loading={this.state.loading}
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                    >
                      Sign Up
                    </Button>
                  </div>
            </Form>
          </Modal>
        </div>
        <Divider type="horizontal" /> 
        <div style={{ display: "flex" }}>
        <Button onClick={this.showModalBank} type="primary" align="center">Add New Bank</Button>
                <Modal
                  title="Add New Bank"
                  visible={this.state.visibleBank}
                  confirmLoading={this.state.loading}
                  onCancel={this.handleCancel}
                  onOk={this.handleSubmit}
                  okText="Add"

                >
                <Form
                  onSubmit={this.handleSubmit}
                  className="login-form register-wrapper"
                  //style={{ flexDirection: "column" }}
                >
                  <FormItem label="Name">
                    {getFieldDecorator("name", {
                      rules: [
                        { required: true, message: "Please input your name!" }
                      ]
                    })(<Input placeholder="Name" />)}
                  </FormItem>
                  <FormItem label="E-mail">
                    {getFieldDecorator("email", {
                      rules: [
                        { required: true, message: "Please input your Email!" }
                      ]
                    })(<Input type="email" placeholder="Email" />)}
                  </FormItem>

                  <FormItem label="Organization-Type">
                    {getFieldDecorator("organization_type", {
                      rules: [
                        { required: true, message: "Please input your Organisation! [Buyer, Seller, Bank, CentralBank]" }
                      ]
                    })(<Input placeholder="Organization" />)}
                  </FormItem>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      loading={this.state.loading}
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                    >
                      Sign Up
                    </Button>
                  </div>
                </Form>
                </Modal>
            <p>&emsp;&emsp;&emsp;&emsp;</p>    <div className="register-wrapper">
                  <p>Already have an account?</p>
                  <Link to="/login">
                    <Button type="primary">Sign in</Button>
                  </Link>
                </div>
              </div>
            </div>
            </div>
          </Col>
        </Row>
    </div>
    );
  }
}

export default Form.create()(Signup);
