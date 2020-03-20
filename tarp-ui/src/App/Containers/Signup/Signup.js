import React from "react";
import { Redirect, Link } from "react-router-dom";
import { signUp } from "../../Models/Auth";
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
  Checkbox
} from "antd";
const FormItem = Form.Item;

const Dragger = Upload.Dragger;

class Signup extends React.Component {
  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      newLink: null,
      loading: false
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.submit(values);
      }
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
          newLink: "/login"
        });
      },
      onError: data => {
        this.setState({
          loading: false
        });
        console.log(data);
      }
    });
  }

  // Renderer
  render() {
    const { getFieldDecorator } = this.props.form;
    if (this.state.newLink) {
      return <Redirect to={this.state.newLink} />;
    }

    return (
      <div className="login-wrapper">
        <Row type="flex" justify="center" align="center">
          <Col md={15} sm={22} xs={22}>
            <div className="login-box">
              <div className="login-width">
                <div className="logo-wrapper">
                  <h1>KYC and Loan Management System</h1>
                  <h2>Tell us about yourself...</h2>
                </div>
                <Form
                  onSubmit={this.handleSubmit}
                  className="login-form register-wrapper"
                  style={{ flexDirection: "column" }}
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
                <div className="register-wrapper">
                  <p>Already have an account?</p>
                  <Link to="/login">
                    <Button type="primary">Sign in</Button>
                  </Link>
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
