import React, { Component } from 'react';
import { Button, Modal, Upload, Spin, Icon, message } from 'antd';
import { KYC_IMPORT } from '../../Config/Routes'
import { getCurrentUser } from '../../Models/Auth';
const Dragger = Upload.Dragger;

class ImportKYC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible : false,
      loading : false
    }
  }

  handleCancel = () => {
    this.setState({ visible : false })
  }

  openModal = () => {
    this.setState({ visible : true })
  }

  onUpload(info) {
    const status = info.file.status;

    if (status === 'uploading') {
      this.setState({ loading: true })
      return;
    }

    if (status === 'done') {
      // login({ data: info.file.response });
      this.setState({
        loading: false,
        visible : false
      });
      message.success(`KYC imported successfully!`);
      this.props.listKyc()
      return;

    } else if (status === 'error') {
      this.setState({ loading: false })
      message.error(`Unable to import KYC!`);
      return;
    }
  }

  renderUploadContainer = () => (
    <Dragger
      name='kyc'
      showUploadList={false}
      accept=".csv"
      headers={{
        token : getCurrentUser().token
      }}
      onChange={this.onUpload.bind(this)}
      action={KYC_IMPORT}
      >
      {this.renderUploadStatus()}
    </Dragger>
  )

  renderUploadStatus() {
    if (this.state.loading) {
      return <Spin />
    }
    return (
      <div>
        <p className="ant-upload-drag-icon">
          <Icon type="upload" />
        </p>
        <p className="ant-upload-text">Upload CSV to import KYC</p>
      </div>
    )
  }
  
  render() {
    return (
      <div>
        <Modal
          title="Import KYC"
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={false}
          confirmLoading={this.state.requestLoader}
        >
          {this.renderUploadContainer()}
        </Modal>
        <Button type="primary" onClick={this.openModal}>Import KYC</Button>
      </div>
    );
  }
}

export default ImportKYC;