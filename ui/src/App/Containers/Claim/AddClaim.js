import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { message, Row, Col, Form, Input, Button, Select, Icon, Upload,} from "antd";
import { addClaim } from "../../Models/ClaimRecords";
import { getCurrentUser } from "../../Models/Auth";
import {listSellers, listBanks} from "../../Models/Users";
const FormItem = Form.Item;
const Option = Select.Option;
//const currentUser = getCurrentUser();

class AddClaim extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      newLink: null,
      fileList: [],
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

  onRemove = (file) => {
    this.setState(({ fileList }) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      return {
        fileList: newFileList,
      }
    })
  };
  
  beforeUpload = (file) => {
    this.setState({
      fileList: [file],
    })
   // return false
  };

  handleChange = info => {
    let fileList = [...info.fileList];
  
    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    fileList = fileList.slice(-1);
  
    // 2. Read from response and show file link
    fileList = fileList.map(file => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response;
      }
      return file;
      
    });
  
    this.setState({ fileList});
  };
  
  normFile = (e) => {
    if (Array.isArray(e)) {
       return e
     }
     return e && e.fileList
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
                {getFieldDecorator("seller_name", {
                  rules: [
                    {
                      required: true,
                      message: "Please input the seller name!"
                    }
                  ]
                })(<Input placeholder="Seller name" />)}
               
                </FormItem>

                <FormItem>
                  {getFieldDecorator("seller_email", {
                    rules: [
                      {
                        type: "string",
                        required: true,
                        message: "Please input the  Seller Email-ID!"
                      }
                    ]
                  })(<Input placeholder="Seller Email-ID" />)}
                </FormItem>

              <FormItem>
                {getFieldDecorator("seller_PPS", {
                  rules: [
                    {
                      type: "string",
                      pattern:/^(\d{7})([A-Z]{1,2})$/i, 
                      message: "PPS ID is Invalid. Please Input the correct PPS ID!"
                      //pattern: /^[1-9]{1}[0-9]{0,}$/g,
                      //message: "The input is not valid numerics!"
                    },
                    {
                      required: true,
                      message: "Please input the Seller PPS Number!"
                    }
                  ]
                })(<Input placeholder="Seller PPS Number" />)}
              </FormItem>
              <FormItem>
                {getFieldDecorator("organization_name", {
                  rules: [
                    {
                      required: true,
                      message: "Please input the Bank Name!"
                    }
                  ]
                })(<Input placeholder="Bank Name" />)}
               
                </FormItem>

               

                <h3>Personal Info</h3>

                <FormItem>
                  {getFieldDecorator("pps_number", {
                    rules: [
                      {
                        type: "string",
                        pattern:/^(\d{7})([A-Z]{1,2})$/i, 
                        message: "PPS ID is Invalid. Please Input the correct PPS ID!"
                        //pattern: /^[1-9]{1}[0-9]{0,}$/g,
                        //message: "The input is not valid numerics!"
                      },
                      {
                        required: true,
                        message: "Please input your pps number!"
                      }
                    ]
                  })(<Input placeholder="PPS Number" />)}
                </FormItem>

              <FormItem
            label="Upload PPS Proof"
          > {getFieldDecorator("pps_number_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

          </FormItem>

              
                <FormItem>
                  {getFieldDecorator("surname", {
                    rules: [
                      {
                        required: true,
                        message: "Please input your surname!"
                      }
                    ]
                  })(<Input placeholder="Surname" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("first_name", {
                    rules: [
                      {
                        required: true,
                        message: "Please input your first name!"
                      }
                    ]
                  })(<Input placeholder="First name" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("gender", {
                    rules: [
                      {
                        required: true,
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
                        required: true,
                        message: "Please input your address!"
                      }
                    ]
                  })(<Input placeholder="Address" />)}
                </FormItem> 

                <FormItem>
                  {getFieldDecorator("country", {
                    rules: [
                      {
                        type: "string",
                        required: true,
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
                        required: true,
                        message: "Please input your Eir Code!"
                      }
                    ]
                  })(<Input placeholder="EIR Code" />)}
                </FormItem>

                <FormItem
            label="Upload EIR Proof"
          > {getFieldDecorator("eir_code_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

          </FormItem>

                <FormItem>
                  {getFieldDecorator("phone_number", {
                    rules: [
                      {
                        type: "string",
                        required: true,
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
                        required: true,
                        message: "Please input your Email!"
                      }
                    ]
                  })(<Input placeholder="Email" />)}
                </FormItem>
               

                <FormItem>
                  {getFieldDecorator("date_of_birth", {
                    rules: [
                      {
                        type: "string",
                        required: true,
                        message: "Please input your Date of Birth!"
                      }
                    ]
                  })(<Input placeholder="Date Of Birth" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("martial_status", {
                    rules: [
                      {
                        type: "string",
                        required: true,
                        message: "Please input your martial status!"
                      }
                    ]
                  })(<Input placeholder="Martial Status" />)}
                </FormItem>

                <FormItem
            label="Upload Martial Status Proof"
          > {getFieldDecorator("martial_status_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

          </FormItem>

               
                <FormItem>
                  {getFieldDecorator("no_of_dependents", {
                    rules: [
                      {
                        type: "string",
                        required: true,
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

                
                <FormItem
            label="Upload Outstanding Proof"
          > {getFieldDecorator("outstanding_balance_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

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

                <FormItem
            label="Upload Current Value of Property Proof"
          > {getFieldDecorator("current_value_property_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

          </FormItem>
                

                <h3>Employment Details</h3>

                
                <FormItem
            label="Upload Employment Details Proof"
          > {getFieldDecorator("job_profile_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

          </FormItem>
                
                
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

                  
                <FormItem
            label="Upload Purchase/Building Cost Proof"
          > {getFieldDecorator("purchase_cost_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

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

                <FormItem
            label="Upload Repair Cost Proof"
          > {getFieldDecorator("repair_cost_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

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

                <FormItem
            label="Upload Value of Property Proof"
          > {getFieldDecorator("value_of_property_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

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

                <FormItem
            label="Upload Professional Fees Proof"
          > {getFieldDecorator("professional_fees_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

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

                <FormItem
            label="Upload Funding Amount Proof"
          > {getFieldDecorator("funding_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

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

                <FormItem
            label="Upload Agreed Price of Sale Proof"
          > {getFieldDecorator("agreed_price_of_sale_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

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

                <FormItem
            label="Upload Mortgage Term Proof"
          > {getFieldDecorator("mortgage_term_url", {
            valuePropName: 'fileList',
            initialValue: this.state.fileList.response,
            getValueFromEvent: this.normFile,
             
          })
         ( //<div><input type="file" name="file" onChange={this.onChangeHandler}/>
          //<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> </div> 
              <Upload
              name="file"
              action="http://localhost:3000/api/upload"
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              onChange={this.handleChange}
              fileList={this.state.fileList}
            >
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </Upload>
          )}

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