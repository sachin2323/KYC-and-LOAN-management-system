import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { message, Row, Col, Form, Input, Button, DatePicker, Upload, Icon,} from "antd";
import { addKYC } from "../../Models/KYCRecords";
import { getCurrentUser } from "../../Models/Auth";
const { Dragger } = Upload;
const FormItem = Form.Item;
const BASE_URL = 'http://localhost:3000/api/';



class AddKYC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      newLink: null,
      currentUser: null,
//      images : [],
//      imageUrls:null,
//      message: '',
//      selectedFile: null
        fileList: [],
    };
  }
  componentDidMount() {
    const currentUser = getCurrentUser();
    this.setState({ currentUser });
  }
  handleSubmit = e => {
    console.log("came");
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const user = getCurrentUser();
        values.name = user.name;
        values.PPS_number = user.national_id;
        values.emailAddress = user.email;
        console.log("TCL: AddKYC -> values", values);
        this.addKYC(values);
      }
    });
  };

  onChangeHandler=event=>{
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
    })
  }

  onClickHandler = () => {
    const data = new FormData()
    data.append('file', this.state.selectedFile)
    axios.post("http://localhost:3000/api/upload", data, { 
       // receive two    parameter endpoint url ,form data
   })
 .then(res => { // then print response status
     console.log(res.statusText);
  })
 } 

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
/* 
  <div>
             <Dragger {...props}>
              <p className="ant-upload-drag-icon">
              <Icon type="upload" />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                band files
              </p>
            </Dragger>
      </div>


     
 
 */

  addKYC = values => {
    this.setState({ loading: true });
    addKYC({
      data: values,
      onSuccess: data => {
        message.success("KYC Record added successfully!");
        this.setState({
          loading: false,
          newLink: this.newLink()
        });
      },
      onError: data => {
        console.log(data);

        this.setState({
          loading: false
        });
        message.error("Unable to get KYC records!");
      }
    });
  };

  newLink = () => {
    const user = getCurrentUser();
    if (
      (user.role === "Admin" ||
        user.role === "Manager") &&
      (user.organizationType === "CentralBank")
    ) {
      return "/list-kycs";
    } else if (
      (user.role === "Admin" ||
        user.role === "Manager") &&
      (user.organizationType === "Bank")
    ) {
      return "/list-org-claims";
    } else if (
      (user.role === "Admin") &&
      (user.organizationType === "Buyer") 
    ) {
      return "/users";
    } else if (
      (user.role === "Admin") &&
      (user.organizationType === "Seller")
    ) {
      return "/users";
    }else{
      return "/client/kyc";
    }
  };

/*
selectImages = (event) => {
  let images = []
  for (var i = 0; i < event.target.files.length; i++) {
  images[i] = event.target.files.item(i);
  }
  images = images.filter(image => image.name.match(/\.(jpg|jpeg|png|gif)$/))
  let message = `${images.length} valid image(s) selected`
  this.setState({ images, message })
  }

uploadImages = () => {
  const uploaders = this.state.images.map(image => {
  const data = new FormData();
  data.append("image", image, image.name);
  return axios.post(BASE_URL + "upload", data)
  .then(response => {
  this.setState({
  imageUrls: [ response.data.imageUrl, ...this.state.imageUrls ]
  });
  })
  });

    
axios.all(uploaders).then(() => {
console.log('done');
}).catch(err => alert(err.message));
}
 */ 
/*    
  renderContent=()=>{
    const props = {
      name: 'file',
      multiple: true,
      action: "http://localhost:3000/api/upload"
      onChange(info) {
        const { status } = info.file;
        if (status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (status === 'done') {
          message.success(`${info.file.name} file uploaded successfully.`);
          console.log(info.file);
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    }; return(
       <FormItem>
                {getFieldDecorator("PPS_number_url", {
                  rules: [
                    { required: true, type: "string", message: "Please input your PPS data!" }
                  ]
                })( <div> <input type="file" name="file" onChange={this.onChangeHandler}/> 
                    <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> 
                    </div>
                )}
              </FormItem>


      <div>
        <Upload {...props}>
          <Button>
            <Icon type="upload" /> Click to Upload
          </Button>
        </Upload>
      </div>
    )
  }
*/
  
  render() {
    if (this.state.newLink) {
      return <Redirect to={this.state.newLink} />;
    }
    // const { currentUser } = this.state;
    const currentUser = getCurrentUser();
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="center-form">
        <Form onSubmit={this.handleSubmit} className="login-form add-kyc-form">
          <h2>Submit KYC Record</h2>
          <h4>Personal Info</h4>
          <Row type="flex" justify="start">
            <Col span={8}>
              <FormItem>
                <Input
                  value={currentUser.name}
                  defaultValue={currentUser.name}
                  style={{ color: "blue" }}
                  readOnly
                  disabled={true}
                  name="name"
                />
              </FormItem>
              <FormItem>
                <Input
                  value={currentUser.email}
                  defaultValue={currentUser.email}
                  style={{ color: "blue" }}
                  readOnly
                  disabled={true}
                  name="emailAddress"
                />
              </FormItem>
              <FormItem>
                <Input
                  value={currentUser.national_id}
                  defaultValue={currentUser.national_id}
                  style={{ color: "blue" }}
                  readOnly
                  disabled={true}
                  name="PPS_number"
                />
              </FormItem>


            

            <FormItem
            label="Upload PPS Proof"
          > {getFieldDecorator("PPS_number_url", {
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
                {getFieldDecorator("phone_numbers", {
                  rules: [
                    { required: true, message: "Please input mobile number!" },
                    {
                      type: "string",
                      pattern: /[0-9]{10}/g,
                      // len: 10,
                      message: "Incorrect phone number"
                    }
                  ]
                })(<Input placeholder="Mobile Number" />)}
              </FormItem>
              <FormItem>
                {getFieldDecorator("dateOfBirth", {
                  rules: [
                    { required: true, message: "Please input Date of Birth!" }
                  ]
                })(
                  <DatePicker
                    defaultValue={moment("01/01/1995", "DD/MM/YYYY")}
                    format={"DD/MM/YYYY"}
                    placeholder="Date of Birth"
                    showToday={false}
                  />
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator("birthMarks", {
                  rules: [
                    { required: false, type: "string", message: "Please input your Birth mark!" }
                  ]
                })(<Input placeholder="Birth Mark" />)}
              </FormItem>
              <FormItem>
                {getFieldDecorator("mothersMaidenName", {
                  rules: [
                    {
                      required: false,
                      type: "string",
                      message: "Please input your Mother's maiden name!"
                    }
                  ]
                })(<Input placeholder="Mother's maiden name" />)}
              </FormItem>
              <FormItem>
                {getFieldDecorator("driversLicense", {
                  rules: [
                    {
                      required: false,
                      type: "string",
                      message: "Please input your Driver License!"
                    }
                  ]
                })(<Input placeholder="Driver License" />)}
              </FormItem>

              <FormItem
            label="Upload Driving License Proof"
          > {getFieldDecorator("driversLicense_url", {
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
                {getFieldDecorator("passport", {
                  rules: [
                    { required: false, type: "string", message: "Please input your Passport!" }
                  ]
                })(<Input placeholder="Passport" initialValue="hete" />)}
              </FormItem>

              <FormItem
            label="Upload Passport Proof"
          > {getFieldDecorator("passport_url", {
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
                {getFieldDecorator("identification_form", {
                  rules: [
                    {
                      type: "string",
                      required: false,
                      message: "Please input your Identification Form details!"
                    }
                  ]
                })(<Input placeholder="Identification Form" />)}
              </FormItem>

              <FormItem
            label="Upload Identification Form Proof"
          > {getFieldDecorator("identification_form_url", {
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
                {getFieldDecorator("nationality", {
                  rules: [
                    {
                      required: false,
                      type: "string",
                      message: "Please input your Nationality!"
                    }
                  ]
                })(<Input placeholder="Nationality" />)}
              </FormItem>

              <FormItem>
                {getFieldDecorator("national_age_card", {
                  rules: [
                    {
                      required: false,
                      type: "string",
                      message: "Please input your National Age Card details!"
                    }
                  ]
                })(<Input placeholder="National Age Card" />)}
              </FormItem>

              <FormItem
            label="Upload National Age Card Proof"
          > {getFieldDecorator("national_age_card_url", {
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
                {getFieldDecorator("utility_bills", {
                  rules: [
                    {
                      type: "string",
                      required: false,
                      message: "Please input your Utility Bills Details!"
                    }
                  ]
                })(<Input placeholder="Utility Bills" />)}
              </FormItem> 
          
              <FormItem
            label="Upload Utility Bills Proof"
          > {getFieldDecorator("utility_bills_url", {
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
                {getFieldDecorator("home_insurance", {
                  rules: [
                    {
                      type: "string",
                      required: false,
                      message: "Please input your Home Insurance Details!"
                    }
                  ]
                })(<Input placeholder="Home Insurance" />)}
              </FormItem>

              <FormItem
            label="Upload Home Insuarance Proof"
          > {getFieldDecorator("home_insurance_url", {
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
                {getFieldDecorator("car_insurance", {
                  rules: [
                    {
                      type: "string",
                      required: false,
                      message: "Please input your Car Insurance Details!"
                    }
                  ]
                })(<Input placeholder="Car Insurance" />)}
              </FormItem>      

              <FormItem
            label="Upload Car Insuarance Proof"
          > {getFieldDecorator("car_insurance_url", {
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
                {getFieldDecorator("tax_credit_certificate", {
                  rules: [
                    {
                      type: "string",
                      required: false,
                      message: "Please input your tax credit certificate details!"
                    }
                  ]
                })(<Input placeholder="Tax Credit Certificate Details" />)}
              </FormItem> 

              <FormItem
            label="Upload Tax Credit Certificate Proof"
          > {getFieldDecorator("tax_credit_certificate_url", {
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
                {getFieldDecorator("salary_certificate", {
                  rules: [
                    {
                      type: "string",
                      required: false,
                      message: "Please input your Salary Certificate Details!"
                    }
                  ]
                })(<Input placeholder="Salary Certificate" />)}
              </FormItem>

              <FormItem
            label="Upload Salary Cerificate Proof"
          > {getFieldDecorator("salary_certificate_url", {
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
                {getFieldDecorator("employee_pay_slip", {
                  rules: [
                    {
                      type: "string",
                      required: false,
                      message: "Please input your Employee Pay Slip!"
                    }
                  ]
                })(<Input placeholder="Employee Pay Slip" />)}
              </FormItem>

              <FormItem
            label="Upload Employee Pay Slip Proof"
          > {getFieldDecorator("employee_pay_slip_url", {
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
                {getFieldDecorator("bank_statement", {
                  rules: [
                    {
                      type: "string",
                      required: false,
                      message: "Please input your Bank Statement details!"
                    }
                  ]
                })(<Input placeholder="Bank Statement" />)}
              </FormItem>
     
              <FormItem
            label="Upload Bankstatement Proof"
          > {getFieldDecorator("bank_statement_url", {
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
                {getFieldDecorator("other", {
                  rules: [
                    {
                      type: "string",
                      required: false,
                      message: "Please input other details!"
                    }
                  ]
                })(<Input placeholder="Others" />)}
              </FormItem>


              <FormItem
            label="Upload any Other Proof"
          > {getFieldDecorator("other_url", {
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
          <h4>Address Info</h4>
          <Row type="flex" justify="start">
            <Col span={8}>
              {/* <FormItem>
            {getFieldDecorator('type', {
              rules: [{ required: true, message: 'Please input Address Type!' }],
            })(
              <Input type="text" placeholder="Address Type" />
            )}
          </FormItem> */}
              <FormItem>
                {getFieldDecorator("line1", {
                  rules: [
                    { required: false, message: "Please input address line1!" }
                  ]
                })(<Input type="text" placeholder="Address Line 1" />)}
              </FormItem>
              <FormItem>
                {getFieldDecorator("line2", {
                  rules: [
                    { required: false, message: "Please input address line2!" }
                  ]
                })(<Input type="text" placeholder="Address Line 2" />)}
              </FormItem>
              <FormItem>
                {getFieldDecorator("line3", {
                  rules: [
                    { required: false, message: "Please input address line3!" }
                  ]
                })(<Input type="text" placeholder="Address Line 3" />)}
              </FormItem>
            </Col>
            <Col style={{ marginLeft: "15px" }} span={8}>
              <FormItem>
                {getFieldDecorator("city_town_village", {
                  rules: [{ required: false, message: "Please input City!" }]
                })(<Input type="text" placeholder="City" />)}
              </FormItem>
              <FormItem>
                {getFieldDecorator("postal_code", {
                  rules: [
                    { required: false, message: "Please input postal code!" }
                  ]
                })(<Input placeholder="Postal Code" />)}
              </FormItem>
              <FormItem>
                {getFieldDecorator("state_ut", {
                  rules: [{ required: false, message: "Please input State!" }]
                })(<Input type="text" placeholder="State" />)}
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

export default Form.create()(AddKYC);
