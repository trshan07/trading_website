// frontend/src/pages/admin/FundingRequestsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Image,
  Descriptions,
  Badge,
  Tabs,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import { getUploadUrl, isPdfFile } from '../../utils/uploadUrl';
import moment from 'moment';

const { TabPane } = Tabs;

const FundingRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchRequests();
  }, [pagination.current, pagination.pageSize, activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await adminService.getFundingRequests({
        page: pagination.current,
        limit: pagination.pageSize,
        status: activeTab,
      });
      setRequests(data.requests);
      setPagination({ ...pagination, total: data.total });
    } catch (error) {
      message.error('Failed to fetch funding requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await adminService.approveFundingRequest(requestId);
      message.success('Request approved successfully');
      fetchRequests();
      setModalVisible(false);
    } catch (error) {
      message.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (values) => {
    try {
      await adminService.rejectFundingRequest(selectedRequest.id, values.reason);
      message.success('Request rejected');
      setModalVisible(false);
      form.resetFields();
      fetchRequests();
    } catch (error) {
      message.error('Failed to reject request');
    }
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontFamily: 'monospace' }}>#{id.slice(-6)}</span>,
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'deposit' ? '#52c41a' : '#f5222d'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          ${amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method) => method.toUpperCase(),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRequest(record);
              setModalVisible(true);
            }}
          >
            Review
          </Button>
          {activeTab === 'pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApproveRequest(record.id)}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setSelectedRequest(record);
                  form.setFieldsValue({ reason: '' });
                  Modal.confirm({
                    title: 'Reject Request',
                    content: (
                      <Form form={form}>
                        <Form.Item
                          name="reason"
                          label="Rejection Reason"
                          rules={[{ required: true, message: 'Please provide a reason' }]}
                        >
                          <Input.TextArea rows={4} placeholder="Enter reason for rejection" />
                        </Form.Item>
                      </Form>
                    ),
                    onOk: () => form.validateFields().then(values => handleRejectRequest(values)),
                  });
                }}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const proofUrl = getUploadUrl(selectedRequest?.proofImage);
  const proofIsPdf = isPdfFile(selectedRequest?.proofImage);

  return (
    <div>
      <Card 
        title="Funding Requests Management" 
        style={{ borderTop: '4px solid #FFD700' }}
        extra={
          <Button 
            icon={<DownloadOutlined />}
            onClick={() => adminService.exportFundingRequests(activeTab)}
          >
            Export
          </Button>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<Badge count={0}><span>Pending</span></Badge>} key="pending" />
          <TabPane tab="Approved" key="approved" />
          <TabPane tab="Rejected" key="rejected" />
          <TabPane tab="All" key="all" />
        </Tabs>
        
        <Table
          columns={columns}
          dataSource={requests}
          loading={loading}
          pagination={pagination}
          onChange={(newPagination) => setPagination(newPagination)}
          rowKey="id"
        />
      </Card>

      {/* Request Details Modal */}
      <Modal
        title="Funding Request Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedRequest && (
          <>
            <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Request ID" span={2}>
                {selectedRequest.id}
              </Descriptions.Item>
              <Descriptions.Item label="User Name">{selectedRequest.userName}</Descriptions.Item>
              <Descriptions.Item label="User Email">{selectedRequest.userEmail}</Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color={selectedRequest.type === 'deposit' ? '#52c41a' : '#f5222d'}>
                  {selectedRequest.type.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  ${selectedRequest.amount.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Method">{selectedRequest.method.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge 
                  status={
                    selectedRequest.status === 'approved' ? 'success' :
                    selectedRequest.status === 'rejected' ? 'error' : 'warning'
                  }
                  text={selectedRequest.status.toUpperCase()}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Created">{moment(selectedRequest.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label="Updated">{moment(selectedRequest.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              {selectedRequest.rejectionReason && (
                <Descriptions.Item label="Rejection Reason" span={2}>
                  <span style={{ color: '#f5222d' }}>{selectedRequest.rejectionReason}</span>
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {proofUrl && (
              <div style={{ marginBottom: 24 }}>
                <h4>Proof of Payment:</h4>
                {proofIsPdf ? (
                  <div style={{ textAlign: 'center', padding: 24, background: '#fff', border: '1px dashed #d9d9d9', borderRadius: 6 }}>
                    <FilePdfOutlined style={{ fontSize: 52, color: '#ff4d4f', display: 'block', marginBottom: 10 }} />
                    <p style={{ color: '#666', margin: '0 0 12px' }}>PDF proof document cannot be previewed inline</p>
                    <Button type="primary" icon={<EyeOutlined />} onClick={() => window.open(proofUrl, '_blank')}>
                      Open PDF
                    </Button>
                  </div>
                ) : (
                  <Image
                    src={proofUrl}
                    alt="Proof"
                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                  />
                )}
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={() => window.open(proofUrl, '_blank')}
                  style={{ marginTop: 8 }}
                >
                  Download Proof
                </Button>
              </div>
            )}
            
            {selectedRequest.status === 'pending' && (
              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                  <Button 
                    type="primary" 
                    icon={<CloseOutlined />} 
                    danger
                    onClick={() => {
                      form.setFieldsValue({ reason: '' });
                      Modal.confirm({
                        title: 'Reject Request',
                        content: (
                          <Form form={form}>
                            <Form.Item
                              name="reason"
                              label="Rejection Reason"
                              rules={[{ required: true }]}
                            >
                              <Input.TextArea rows={4} />
                            </Form.Item>
                          </Form>
                        ),
                        onOk: () => form.validateFields().then(values => handleRejectRequest(values)),
                      });
                    }}
                  >
                    Reject
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<CheckOutlined />}
                    onClick={() => handleApproveRequest(selectedRequest.id)}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Approve
                  </Button>
                </Space>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default FundingRequestsPage;
