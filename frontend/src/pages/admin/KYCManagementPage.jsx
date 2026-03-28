// frontend/src/pages/admin/KYCManagementPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Tag,
  Image,
  Descriptions,
  Timeline,
  Badge,
  Tabs,
  message,
  Input,
  Select,
  Upload,
  Tooltip,
  Progress,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileImageOutlined,
  IdcardOutlined,
  BankOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import moment from 'moment';

const { TabPane } = Tabs;
const { TextArea } = Input;

const KYCManagementPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchKYCSubmissions();
  }, [pagination.current, pagination.pageSize, activeTab]);

  const fetchKYCSubmissions = async () => {
    setLoading(true);
    try {
      const data = await adminService.getKYCSubmissions({
        page: pagination.current,
        limit: pagination.pageSize,
        status: activeTab,
      });
      setSubmissions(data.submissions);
      setPagination({ ...pagination, total: data.total });
    } catch (error) {
      message.error('Failed to fetch KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId) => {
    try {
      await adminService.approveKYC(submissionId);
      message.success('KYC approved successfully');
      fetchKYCSubmissions();
      setModalVisible(false);
    } catch (error) {
      message.error('Failed to approve KYC');
    }
  };

  const handleReject = async (submissionId) => {
    if (!rejectReason.trim()) {
      message.error('Please provide a rejection reason');
      return;
    }
    try {
      await adminService.rejectKYC(submissionId, rejectReason);
      message.success('KYC rejected');
      setModalVisible(false);
      setRejectReason('');
      fetchKYCSubmissions();
    } catch (error) {
      message.error('Failed to reject KYC');
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Document Type',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (type) => (
        <Tag icon={<IdcardOutlined />} color="blue">
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={
            status === 'approved' ? 'success' :
            status === 'rejected' ? 'error' : 'warning'
          }
          text={status?.toUpperCase()}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedSubmission(record);
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
                onClick={() => handleApprove(record.id)}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setSelectedSubmission(record);
                  setRejectReason('');
                  Modal.confirm({
                    title: 'Reject KYC Submission',
                    content: (
                      <div>
                        <p>Please provide a reason for rejection:</p>
                        <TextArea
                          rows={4}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Enter rejection reason..."
                        />
                      </div>
                    ),
                    onOk: () => handleReject(record.id),
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

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card 
        title="KYC Management" 
        style={{ borderRadius: '12px', borderTop: '4px solid #FFD700' }}
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchKYCSubmissions}
            loading={loading}
          >
            Refresh
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
          dataSource={submissions}
          loading={loading}
          pagination={pagination}
          onChange={(newPagination) => setPagination(newPagination)}
          rowKey="id"
        />
      </Card>

      {/* Review Modal */}
      <Modal
        title="KYC Document Review"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setRejectReason('');
        }}
        footer={null}
        width={800}
      >
        {selectedSubmission && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="User Name">{selectedSubmission.userName}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedSubmission.userEmail}</Descriptions.Item>
              <Descriptions.Item label="Document Type">{selectedSubmission.documentType?.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="Document Number">{selectedSubmission.documentNumber}</Descriptions.Item>
              <Descriptions.Item label="Submitted Date">
                {moment(selectedSubmission.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge 
                  status={
                    selectedSubmission.status === 'approved' ? 'success' :
                    selectedSubmission.status === 'rejected' ? 'error' : 'warning'
                  }
                  text={selectedSubmission.status?.toUpperCase()}
                />
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 24 }}>
              <h4>Front Side:</h4>
              <Image
                src={selectedSubmission.frontImage}
                alt="Document Front"
                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
                fallback="https://via.placeholder.com/400x300?text=No+Image"
              />
              <Button 
                icon={<DownloadOutlined />} 
                onClick={() => window.open(selectedSubmission.frontImage)}
                style={{ marginTop: 8 }}
              >
                Download Front
              </Button>
            </div>

            {selectedSubmission.backImage && (
              <div style={{ marginBottom: 24 }}>
                <h4>Back Side:</h4>
                <Image
                  src={selectedSubmission.backImage}
                  alt="Document Back"
                  style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
                  fallback="https://via.placeholder.com/400x300?text=No+Image"
                />
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={() => window.open(selectedSubmission.backImage)}
                  style={{ marginTop: 8 }}
                >
                  Download Back
                </Button>
              </div>
            )}

            {selectedSubmission.selfie && (
              <div style={{ marginBottom: 24 }}>
                <h4>Selfie with Document:</h4>
                <Image
                  src={selectedSubmission.selfie}
                  alt="Selfie"
                  style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
                  fallback="https://via.placeholder.com/400x300?text=No+Image"
                />
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={() => window.open(selectedSubmission.selfie)}
                  style={{ marginTop: 8 }}
                >
                  Download Selfie
                </Button>
              </div>
            )}

            {selectedSubmission.status === 'rejected' && selectedSubmission.rejectionReason && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ color: '#f5222d' }}>Rejection Reason:</h4>
                <p style={{ background: '#fff1f0', padding: '12px', borderRadius: '8px' }}>
                  {selectedSubmission.rejectionReason}
                </p>
              </div>
            )}

            {selectedSubmission.status === 'pending' && (
              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                  <Button 
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: 'Reject KYC Submission',
                        content: (
                          <div>
                            <p>Please provide a reason for rejection:</p>
                            <TextArea
                              rows={4}
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Enter rejection reason..."
                            />
                          </div>
                        ),
                        onOk: () => handleReject(selectedSubmission.id),
                      });
                    }}
                  >
                    Reject
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<CheckOutlined />}
                    onClick={() => handleApprove(selectedSubmission.id)}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Approve
                  </Button>
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default KYCManagementPage;