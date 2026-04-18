import React, { useState, useContext, useEffect } from 'react';
import { FaUser, FaLock, FaBell, FaPalette, FaCog, FaChevronLeft, FaSave, FaCheckCircle, FaExclamationCircle, FaShieldAlt, FaRegMoon, FaSun } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

const SettingsTab = () => {
    const { user, setUser } = useContext(AuthContext);
    const [activeView, setActiveView] = useState('overview');
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        country: user?.country || ''
    });

    const [securityForm, setSecurityForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [settingsForm, setSettingsForm] = useState({
        theme: 'dark',
        chartPreferences: {
            grid: true,
            labels: true,
            highDensity: true
        },
        notificationSettings: {
            email: true,
            push: true,
            marginCalls: true
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await userService.getSettings();
                if (res.success && res.data) {
                    setSettingsForm(res.data);
                }
            } catch (error) {
                console.error("Failed to sync settings");
            }
        };
        
        if (user) {
            setProfileForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                country: user.country || ''
            });
            fetchSettings();
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await userService.updateProfile(profileForm);
            if (response.success) {
                setUser({
                    ...user,
                    firstName: response.data.first_name,
                    lastName: response.data.last_name,
                    phone: response.data.phone,
                    country: response.data.country
                });
                toast.success('Profile updated successfully!');
                setActiveView('overview');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        if (securityForm.newPassword !== securityForm.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            const response = await userService.changePassword({
                currentPassword: securityForm.currentPassword,
                newPassword: securityForm.newPassword
            });
            if (response.success) {
                toast.success('Password changed successfully!');
                setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setActiveView('overview');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleSettingsSubmit = async () => {
        setLoading(true);
        try {
            const res = await userService.updateSettings(settingsForm);
            if (res.success) {
                toast.success('Terminal preferences synced');
                setActiveView('overview');
            }
        } catch (error) {
            toast.error('Failed to sync settings');
        } finally {
            setLoading(false);
        }
    };

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div onClick={() => setActiveView('security')} className="p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gold-500/50 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
                <FaLock className="text-slate-300 dark:text-slate-600 group-hover:text-gold-500 text-3xl mb-6 transition-colors" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">Security & Auth</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Protect your capital with secure keys.</p>
                <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest flex items-center">Manage Access →</span>
            </div>
            <div onClick={() => setActiveView('profile')} className="p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gold-500/50 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
                <FaUser className="text-slate-300 dark:text-slate-600 group-hover:text-gold-500 text-3xl mb-6 transition-colors" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">Personal Identity</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Update bio and KYC status.</p>
                <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest flex items-center">Edit Bio →</span>
            </div>
            <div onClick={() => setActiveView('preferences')} className="p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gold-500/50 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
                <FaPalette className="text-slate-300 dark:text-slate-600 group-hover:text-gold-500 text-3xl mb-6 transition-colors" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">Terminal Aesthetics</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Customize chart colors and grid density.</p>
                <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest flex items-center">Customize →</span>
            </div>
            <div onClick={() => setActiveView('notifications')} className="p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gold-500/50 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
                <FaBell className="text-slate-300 dark:text-slate-600 group-hover:text-gold-500 text-3xl mb-6 transition-colors" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">Alert Engine</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Configure push alerts and margin calls.</p>
                <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest flex items-center">Setup Alerts →</span>
            </div>
        </div>
    );

    const renderPreferencesForm = () => (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl transition-all animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-10">
                <button onClick={() => setActiveView('overview')} className="flex items-center text-[10px] font-black uppercase text-slate-400 hover:text-gold-500 transition-colors tracking-[0.2em]"><FaChevronLeft className="mr-2" /> Back</button>
                <h3 className="text-xs font-black uppercase text-gold-500 tracking-[0.3em] italic">Visual Matrix</h3>
            </div>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Color Protocol</label>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setSettingsForm({...settingsForm, theme: 'light'})}
                                className={`flex-1 p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${settingsForm.theme === 'light' ? 'border-gold-500 bg-gold-500/5 text-gold-500' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                            >
                                <FaSun size={20} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Slate Light</span>
                            </button>
                            <button 
                                onClick={() => setSettingsForm({...settingsForm, theme: 'dark'})}
                                className={`flex-1 p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${settingsForm.theme === 'dark' ? 'border-gold-500 bg-gold-500/5 text-gold-500' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                            >
                                <FaRegMoon size={20} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Gold Dark</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4 pt-6">
                    <button onClick={handleSettingsSubmit} disabled={loading} className="px-10 py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl disabled:opacity-50">
                        {loading ? 'Syncing...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Terminal <span className="text-gold-500">Core</span></h2>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-3">Profile Sync Active • System_v7.4</p>
                </div>
            </div>
            <div className="transition-all duration-500">
                {activeView === 'overview' && renderOverview()}
                {activeView === 'profile' && renderProfileForm()}
                {activeView === 'security' && renderSecurityForm()}
                {activeView === 'preferences' && renderPreferencesForm()}
                {(activeView === 'notifications') && (
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-20 border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center">
                        <FaCog className="text-slate-200 dark:text-slate-700 text-4xl animate-spin mb-8" />
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">Alert Module Calibration</h3>
                        <p className="text-sm text-slate-400 font-medium max-w-sm">Fine-tuning push notification latency for real-time market events.</p>
                        <button onClick={() => setActiveView('overview')} className="mt-10 px-8 py-4 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest">Back</button>
                    </div>
                )}
            </div>
        </div>
    );

    // Re-use existing renders from previous but with updated logic
    function renderProfileForm() {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-10">
                    <button onClick={() => setActiveView('overview')} className="flex items-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]"><FaChevronLeft className="mr-2" /> Back</button>
                    <h3 className="text-xs font-black uppercase text-gold-500 tracking-[0.3em] italic">Identity Forge</h3>
                </div>
                <form onSubmit={handleProfileSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <input type="text" value={profileForm.firstName} onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold placeholder:text-slate-300" placeholder="First Name" />
                        <input type="text" value={profileForm.lastName} onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold" placeholder="Last Name" />
                    </div>
                    <button type="submit" disabled={loading} className="px-10 py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase shadow-xl disabled:opacity-50">Commit Changes</button>
                </form>
            </div>
        );
    }

    function renderSecurityForm() {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                    <button onClick={() => setActiveView('overview')} className="flex items-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]"><FaChevronLeft className="mr-2" /> Back</button>
                    <h3 className="text-xs font-black uppercase text-rose-500 tracking-[0.3em] italic">Cipher Rotation</h3>
                </div>
                <form onSubmit={handleSecuritySubmit} className="space-y-8">
                    <input type="password" required value={securityForm.currentPassword} onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold" placeholder="Current Cipher" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <input type="password" required value={securityForm.newPassword} onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold" placeholder="New Protocol" />
                        <input type="password" required value={securityForm.confirmPassword} onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold" placeholder="Confirm Protocol" />
                    </div>
                    <button type="submit" disabled={loading} className="px-10 py-5 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl disabled:opacity-50">Rotate Keys</button>
                </form>
            </div>
        );
    }
};

export default SettingsTab;
