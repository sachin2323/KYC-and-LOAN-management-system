import React, { Component } from "react";
import {
  Card,
  Table,
  Button,
  message,
  Modal,
  Upload,
  Icon,
  Input,
  Form,
  Divider
} from "antd";
import { getUserClaims } from "../../Models/ClaimRecords";
import { getCurrentUser } from "../../Models/Auth";
import { getClaimProof } from "../../Models/ClaimRecords";
import { Link } from "react-router-dom";
import { BASE_URL } from "../../Config/Routes";
const { Dragger } = Upload;

export default class ListClaim extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      Claim: [],
      selectedRecord: null,
      visible: false
    };
    this.columns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id"
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description"
      },
      {
        title: "Seller PPS ID",
        dataIndex: "seller_PPS",
        key: "seller_PPS"
      },
      {
        title: "Bank Name",
        dataIndex: "insurerDetails.name",
        key: "insurerDetails.name"
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt"
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status"
      },
      {
        title: "Suggestion",
        dataIndex: "suggestion",
        key: "suggestion"
      }
    ];
  }

  downloadProofs = record => {
    this.setState({ loading: true });
    getClaimProof({
      claim_id: record.id,
      onSuccess: data => {
        data.response.forEach(element => {
          const link = document.createElement("a");
          link.setAttribute("href", element.record.url);
          link.setAttribute("target", "_blank");
          link.click();
        });
        message.success("Successfully downloaded proof");
        this.setState({
          loading: false
        });
      },
      onError: data => {
        this.setState({
          loading: false
        });
        console.log(data);

        message.error("Unable to download proof");
      }
    });
  };

  renderContent = () => {
    const props = {
      name: "image",
      multiple: true,
      action: BASE_URL + "/add-proof",
      headers: {
        token: getCurrentUser().token,
        claim_id: this.state.selectedRecord
          ? this.state.selectedRecord.id
          : null
      },
      onChange(info) {
        if (info.file.status !== "uploading") {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === "done") {
          message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === "error") {
          message.error(`${info.file.name} file upload failed.`);
        }
      }
    };
    return (
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
    );
  };

  openModal = record => {
    this.setState({
      visible: true,
      selectedRecord: record
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
      selectedRecord: null
    });
  };

  componentDidMount() {
    this.getUserClaims();
  }

  getUserClaims = () => {
    message.loading("Fetching applications from Blockchain Ledger...", 0);
    this.setState({ loading: true });
    getUserClaims({
      onSuccess: data => {
        this.setState({
          loading: false,
          Claim: data.response
        });
        message.destroy();
        message.success("Synced with Ledger!");
      },
      onError: data => {
        this.setState({
          loading: false
        });
        message.destroy();
        // message.error('Unable to Claim')
      }
    });
  };
  render() {
    return (
      <div>
        <Card
          title="List Of Applications"
          extra={
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Link to="/client/claim/add-claim">
                <Button style={{ marginRight: "15px" }} type="primary">
                  Add Loan Application
                </Button>
              </Link>
            </div>
          }
        >
          <Table
            dataSource={this.state.Claim}
            columns={this.columns}
            loading={this.state.loading}
            rowKey="id"
          />
          <Modal
            title="Add Proof"
            visible={this.state.visible}
            onCancel={this.handleCancel}
            okText={"Approve"}
            onOk={this.handleApprove}
            width={800}
            footer={null}
          >
            {this.renderContent()}
          </Modal>
        </Card>
      </div>
    );
  }
}
