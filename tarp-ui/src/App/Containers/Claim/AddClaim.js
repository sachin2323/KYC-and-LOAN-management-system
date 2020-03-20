import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { message, Row, Col, Form, Input, Button} from "antd";
import { addClaim } from "../../Models/ClaimRecords";
import { getCurrentUser } from "../../Models/Auth";
const FormItem = Form.Item;

class AddClaim extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      newLink: null
    };
  }

  handleSubmit = e => {
    console.log("came");
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
        this.addClaim(values);
      }
    });
  };

  addClaim = values => {
    this.setState({ loading: true });
    addClaim({
      data: values,
      onSuccess: data => {
        message.success("Loan Application added successfully!");
        this.setState({
          loading: false,
          newLink: this.newLink()
        });
      },
      onError: data => {
        this.setState({
          loading: false
        });
        message.error("Organization not found!");
      }
    });
  };

  newLink = () => {
    if (
      (getCurrentUser().role === "Admin" ||
        getCurrentUser().role === "Manager") &&
      getCurrentUser().organizationType === "CentralBank"
    ) {
      return "/list-claims";
    } else if (
      (getCurrentUser().role === "Admin" ||
        getCurrentUser().role === "Manager") &&
      getCurrentUser().organizationType === "Bank"
    ) {
      return "/claim";
    } else {
      return "/list-client-claims";
    }
  };

  render() {
    if (this.state.newLink) {
      return <Redirect to={this.state.newLink} />;
    }
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="center-form">
        <Form
          onSubmit={this.handleSubmit}
          className="login-form add-claim-form"
        >
          <h1>Submit Loan Application</h1>
          <h2>Loan Info</h2>
          <Row type="flex" justify="start">
            <Col span={8}>
              <FormItem>
                {getFieldDecorator("description", {
                  rules: [
                    { required: true, message: "Please input the Description!" }
                  ]
                })(<Input placeholder="Description" />)}
              </FormItem>
              <FormItem>
                {getFieldDecorator("cost", {
                  rules: [
                    {
                      type: "string",
                      pattern: /^[1-9]{1}[0-9]{0,}$/g,
                      message: "The input is not valid numerics!"
                    },
                    {
                      required: true,
                      message: "Please input the cost!"
                    }
                  ]
                })(<Input placeholder="Cost" />)}
              </FormItem>
              <FormItem>
                {getFieldDecorator("organization_name", {
                  rules: [
                    {
                      required: true,
                      message: "Please input the organization name!"
                    }
                  ]
                })(<Input placeholder="Organization name" />)}
               
                </FormItem>

                <h3>Personal Info</h3>

                <FormItem>
                  {getFieldDecorator("surname", {
                    rules: [
                      {
                        required: false,
                        message: "Please input your surname!"
                      }
                    ]
                  })(<Input placeholder="Surname" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("first_name", {
                    rules: [
                      {
                        required: false,
                        message: "Please input your first name!"
                      }
                    ]
                  })(<Input placeholder="First name" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("gender", {
                    rules: [
                      {
                        required: false,
                        message: "Please input your gender!"
                      }
                    ]
                  })(<Input placeholder="Gender" />)}
                </FormItem>

                

                <FormItem>
                  {getFieldDecorator("address", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your address!"
                      }
                    ]
                  })(<Input placeholder="Address" />)}
                </FormItem> 

                <FormItem>
                  {getFieldDecorator("country", {
                    rules: [
                      {
                        required: false,
                        message: "Please input your country!"
                      }
                    ]
                  })(<Input placeholder="Country" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("eir_code", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your Eir Code!"
                      }
                    ]
                  })(<Input placeholder="EIR Code" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("phone_number", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your phone number!"
                      }
                    ]
                  })(<Input placeholder="Phone Number" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("email", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your Email!"
                      }
                    ]
                  })(<Input placeholder="Email" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("pps_number", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your pps number!"
                      }
                    ]
                  })(<Input placeholder="PPS Number" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("date_of_birth", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your Date of Birth!"
                      }
                    ]
                  })(<Input placeholder="Date Of Birth" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("martial_status", {
                    rules: [
                      {
                        required: false,
                        message: "Please input your martial status!"
                      }
                    ]
                  })(<Input placeholder="Martial Status" />)}
                </FormItem>

               
                <FormItem>
                  {getFieldDecorator("no_of_dependents", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the number of dependents!"
                      }
                    ]
                  })(<Input placeholder="Number of Dependents" />)}
                </FormItem>

                <h2>Accomodation Details</h2>  
                <FormItem>
                  {getFieldDecorator("owner_renting_living", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your status!"
                      }
                    ]
                  })(<Input placeholder="Status of Living" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("outstanding_balance", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your outstanding balance!"
                      }
                    ]
                  })(<Input placeholder="Outstanding Balance" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("current_value_property", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the current value of property!"
                      }
                    ]
                  })(<Input placeholder="Current Value of Property" />)}
                </FormItem>

                <h3>Employment Details</h3>
                
                <FormItem>
                  {getFieldDecorator("occupation", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your occupation!"
                      }
                    ]
                  })(<Input placeholder="Occupation" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("position", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your position!"
                      }
                    ]
                  })(<Input placeholder="Position" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("employer_name", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your employer name!"
                      }
                    ]
                  })(<Input placeholder="Employer Name" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("company_address", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the address of company!"
                      }
                    ]
                  })(<Input placeholder="Company Address" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("years_of_employment", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the number of years of employment!"
                      }
                    ]
                  })(<Input placeholder="Years of Employment" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("type_of_employment", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the type of employment!"
                      }
                    ]
                  })(<Input placeholder="Type of Employment" />)}
                </FormItem>
             
              <h3>Income Details </h3>

              <FormItem>
                  {getFieldDecorator("gross_basic_income", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your gross basic income per annum!"
                      }
                    ]
                  })(<Input placeholder="Gross  Basic Income per Annum" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("net_monthly_income", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input your net monthly income!"
                      }
                    ]
                  })(<Input placeholder="Net Monthly Income" />)}
                </FormItem>

                <h3>Mortrgage, Loan Details</h3>
               
                <FormItem>
                  {getFieldDecorator("purpose", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the purpose of loan!"
                      }
                    ]
                  })(<Input placeholder="Purpose of Loan" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("purchase_cost", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the purchase/building cost!"
                      }
                    ]
                  })(<Input placeholder="Purchase/Building Cost" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("repair_cost", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the repair cost!"
                      }
                    ]
                  })(<Input placeholder="Repair Cost" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("value_of_property", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the value of property!"
                      }
                    ]
                  })(<Input placeholder="Value of Property" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("professional_fees", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input professional fees!"
                      }
                    ]
                  })(<Input placeholder="Professional fees" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("funding", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the funding amount!"
                      }
                    ]
                  })(<Input placeholder="Funding Amount" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("agreed_price_of_sale", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the agreed price of sale!"
                      }
                    ]
                  })(<Input placeholder="Agreed Price of Sale" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("amount_of_loan_required", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the amount of loan required!"
                      }
                    ]
                  })(<Input placeholder="Amount of Loan required" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("mortgage_term", {
                    rules: [
                      {
                        type: "string",
                        required: false,
                        message: "Please input the term of mortgage in yeras!"
                      }
                    ]
                  })(<Input placeholder="Mortgage loan term (In Years)" />)}
                </FormItem>

            </Col>
          </Row>
          <Button
            loading={this.state.loading}
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Submit
          </Button>
        </Form>
      </div>
    );
  }
}

export default Form.create()(AddClaim);
