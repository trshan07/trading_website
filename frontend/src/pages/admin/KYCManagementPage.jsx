// frontend/src/pages/admin/KYCManagementPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Modal, Tag, Descriptions,
  Badge, Tabs, message, Input, Tooltip, Image,
} from 'antd';
import {
  CheckOutlined, CloseOutlined, EyeOutlined, DownloadOutlined,
  IdcardOutlined, ReloadOutlined, FilePdfOutlined, FileImageOutlined,
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import { getUploadUrl, isPdfFile } from '../../utils/uploadUrl';
import moment from 'moment';

const { TabPane } = Tabs;
const { TextArea } = Input;

const RejectForm = ({ onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');

  return (
    <div style={{ marginBottom: 12, padding: 12, background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 6 }}>
      <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#cf1322' }}>Rejection Reason:</p>
      <TextArea
        rows={3} 
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Provide a clear reason for rejection..."
        style={{ marginBottom: 8 }}
        autoFocus
      />
      <Space>
        <Button size="small" onClick={onCancel}>Cancel</Button>
        <Button 
          size="small" 
          danger 
          type="primary"
          onClick={() => {
            if (!reason.trim()) { message.error('Please enter a rejection reason'); return; }
            onConfirm(reason);
          }}
        >
          Confirm Reject
        </Button>
      </Space>
    </div>
  );
};

const KYCManagementPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectDocId, setRejectDocId] = useState(null);

  useEffect(() => { fetchKYCSubmissions(); }, [activeTab]); // eslint-disable-line

  const fetchKYCSubmissions = async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const response = await adminService.getKYCSubmissions(params);
      // axios wraps in .data; backend sends { success, data: [...] }
      const list = response?.data?.data || response?.data || [];
      setSubmissions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('KYC fetch error:', err);
      message.error('Failed to fetch KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (docId, status, reason = null) => {
    try {
      await adminService.processKYC(docId, status, reason);
      message.success(`Document ${status} successfully`);
      setModalVisible(false);
      setRejectDocId(null);
      fetchKYCSubmissions();
    } catch (err) {
      console.error('KYC process error:', err);
      message.error(`Failed to ${status} document`);
    }
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{r.email}</div>
        </div>
      ),
    },
    {
      title: 'Documents',
      key: 'docs',
      render: (_, r) => (
        <Space wrap>
          {(r.kycDocs || []).map(doc => (
            <Tag key={doc.id} icon={<IdcardOutlined />} color="blue">
              {doc.label || doc.type}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'kycSubmitted',
      render: (d) => d ? moment(d).format('YYYY-MM-DD HH:mm') : '—',
    },
    {
      title: 'Status',
      dataIndex: 'kyc',
      render: (s) => (
        <Badge
          status={s === 'verified' || s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'warning'}
          text={s?.toUpperCase()}
        />
      ),
    },
    {
      title: 'Actions',
      render: (_, r) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => { setSelectedUser(r); setRejectDocId(null); setModalVisible(true); }}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        title="KYC Document Management"
        style={{ borderRadius: 12, borderTop: '4px solid #FFD700' }}
        extra={<Button icon={<ReloadOutlined />} onClick={fetchKYCSubmissions} loading={loading}>Refresh</Button>}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Pending" key="pending" />
          <TabPane tab="Approved" key="approved" />
          <TabPane tab="Rejected" key="rejected" />
          <TabPane tab="All" key="all" />
        </Tabs>
        <Table columns={columns} dataSource={submissions} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      {/* ── Review Modal ── */}
      <Modal
        title={`KYC Review — ${selectedUser?.name || ''}`}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setRejectDocId(null); }}
        footer={null}
        width={860}
        destroyOnClose
      >
        {selectedUser && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Name">{selectedUser.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
              <Descriptions.Item label="Submitted">
                {selectedUser.kycSubmitted ? moment(selectedUser.kycSubmitted).format('YYYY-MM-DD HH:mm') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Overall Status">
                <Badge
                  status={selectedUser.kyc === 'verified' || selectedUser.kyc === 'approved' ? 'success' : selectedUser.kyc === 'rejected' ? 'error' : 'warning'}
                  text={selectedUser.kyc?.toUpperCase()}
                />
              </Descriptions.Item>
            </Descriptions>

            {(selectedUser.kycDocs || []).length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No documents submitted yet.</div>
            )}

            {(selectedUser.kycDocs || []).map((doc) => {
              const fileUrl = getUploadUrl(doc.file);
              const docIsPdf = isPdfFile(doc.file);

              return (
                <div key={doc.id} style={{ marginBottom: 24, padding: 16, border: '1px solid #e8e8e8', borderRadius: 8, background: '#fafafa' }}>
                  {/* Doc header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <Space>
                      <Tag color="blue" icon={<IdcardOutlined />} style={{ fontSize: 13, padding: '4px 10px' }}>
                        {doc.label || doc.type?.toUpperCase()}
                      </Tag>
                      <Badge
                        status={doc.status === 'approved' || doc.status === 'verified' ? 'success' : doc.status === 'rejected' ? 'error' : 'warning'}
                        text={doc.status?.toUpperCase()}
                      />
                    </Space>
                    <Space>
                      {fileUrl && (
                        <Tooltip title="Open / download document">
                          <Button size="small" icon={<DownloadOutlined />} onClick={() => window.open(fileUrl, '_blank')}>
                            Open / Download
                          </Button>
                        </Tooltip>
                      )}
                      {doc.status === 'pending' && (
                        <>
                          <Button
                            size="small" type="primary" icon={<CheckOutlined />}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            onClick={() => handleProcess(doc.id, 'approved')}
                          >Approve</Button>
                          <Button size="small" danger icon={<CloseOutlined />}
                            onClick={() => { setRejectDocId(doc.id); }}
                          >Reject</Button>
                        </>
                      )}
                    </Space>
                  </div>

                  {/* Inline reject form */}
                  {rejectDocId === doc.id && (
                    <RejectForm 
                      onConfirm={(reason) => handleProcess(doc.id, 'rejected', reason)}
                      onCancel={() => setRejectDocId(null)}
                    />
                  )}

                  {/* Rejection reason display */}
                  {doc.status === 'rejected' && doc.rejectReason && (
                    <div style={{ background: '#fff1f0', padding: '8px 12px', borderRadius: 6, marginBottom: 12, border: '1px solid #ffa39e' }}>
                      <strong style={{ color: '#cf1322' }}>Rejected: </strong>{doc.rejectReason}
                    </div>
                  )}

                  {/* Document preview */}
                  {fileUrl ? (
                    docIsPdf ? (
                      <div style={{ textAlign: 'center', padding: 24, background: '#fff', border: '1px dashed #d9d9d9', borderRadius: 6 }}>
                        <FilePdfOutlined style={{ fontSize: 52, color: '#ff4d4f', display: 'block', marginBottom: 10 }} />
                        <p style={{ color: '#666', margin: '0 0 12px' }}>PDF Document — cannot be previewed inline</p>
                        <Button type="primary" icon={<EyeOutlined />} onClick={() => window.open(fileUrl, '_blank')}>
                          Open PDF
                        </Button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', background: '#fff', padding: 8, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <Image
                          src={fileUrl}
                          alt={doc.label || 'KYC Document'}
                          style={{ maxWidth: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 4 }}
                          fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMTgwIj48cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjEyMCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2Ugbm90IGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4="
                        />
                      </div>
                    )
                  ) : (
                    <div style={{ textAlign: 'center', padding: 24, background: '#fff', border: '1px dashed #d9d9d9', borderRadius: 6, color: '#bbb' }}>
                      <FileImageOutlined style={{ fontSize: 40, display: 'block', marginBottom: 8 }} />
                      No file attached
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default KYCManagementPage;
