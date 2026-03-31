import React, { useState, useContext, useEffect } from 'react';
import { FaUser, FaLock, FaBell, FaPalette, FaCog, FaChevronLeft, FaSave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

const SettingsTab = () => {
    const { user, setUser } = useContext(AuthContext);
    const [activeView, setActiveView] = useState('overview'); // overview, profile, security, preferences, notifications
    const [loading, setLoading] = useState(false);
    
    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        country: user?.country || ''
    });

    // Security Form State
    const [securityForm, setSecurityForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                country: user.country || ''
            });
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await userService.updateProfile(profileForm);
            if (response.success) {
                // Update local auth context
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

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Security Card */}
            <div 
                onClick={() => setActiveView('security')}
                className="p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gold-500/50 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full translate-x-16 -translate-y-16 group-hover:bg-gold-500/5 transition-colors"></div>
                <FaLock className="text-slate-300 dark:text-slate-600 group-hover:text-gold-500 text-3xl mb-6 transition-colors" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">Security & Auth</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Protect your capital with 2FA and secure keys.</p>
                <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest flex items-center">
                    Manage Access <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </span>
            </div>

            {/* Profile Card */}
            <div 
                onClick={() => setActiveView('profile')}
                className="p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gold-500/50 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full translate-x-16 -translate-y-16 group-hover:bg-gold-500/5 transition-colors"></div>
                <FaUser className="text-slate-300 dark:text-slate-600 group-hover:text-gold-500 text-3xl mb-6 transition-colors" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">Personal Identity</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Update your bio, region, and KYC status.</p>
                <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest flex items-center">
                    Edit Bio <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </span>
            </div>

            {/* Appearance Card */}
            <div 
                onClick={() => setActiveView('preferences')}
                className="p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gold-500/50 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full translate-x-16 -translate-y-16 group-hover:bg-gold-500/5 transition-colors"></div>
                <FaPalette className="text-slate-300 dark:text-slate-600 group-hover:text-gold-500 text-3xl mb-6 transition-colors" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">Terminal Aesthetics</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Customize chart colors and grid density.</p>
                <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest flex items-center">
                    Customize <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </span>
            </div>

            {/* Notifications Card */}
            <div 
                onClick={() => setActiveView('notifications')}
                className="p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gold-500/50 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full translate-x-16 -translate-y-16 group-hover:bg-gold-500/5 transition-colors"></div>
                <FaBell className="text-slate-300 dark:text-slate-600 group-hover:text-gold-500 text-3xl mb-6 transition-colors" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">Alert Engine</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Configure push alerts for margin and volatility.</p>
                <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest flex items-center">
                    Setup Alerts <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </span>
            </div>
        </div>
    );

    const renderProfileForm = () => (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl transition-all animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-10">
                <button onClick={() => setActiveView('overview')} className="flex items-center text-[10px] font-black uppercase text-slate-400 hover:text-gold-500 transition-colors tracking-[0.2em]">
                    <FaChevronLeft className="mr-2" /> Back to Dashboard
                </button>
                <h3 className="text-xs font-black uppercase text-gold-500 tracking-[0.3em] italic">Identity Forge</h3>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Designation</label>
                        <input 
                            type="text"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-gold-500/10 transition-all placeholder:text-slate-300"
                            placeholder="Entrust your name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Family Lineage</label>
                        <input 
                            type="text"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-gold-500/10 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comms Protocol (Phone)</label>
                        <input 
                            type="text"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-gold-500/10 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Region</label>
                        <input 
                            type="text"
                            value={profileForm.country}
                            onChange={(e) => setProfileForm({...profileForm, country: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-gold-500/10 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4 pt-6">
                    <button 
                        type="submit"
                        disabled={loading}
                        className="flex-1 md:flex-none px-10 py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-slate-900/20 dark:shadow-gold-500/20 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? 'Encrypting Data...' : <><FaSave className="mr-3" /> Commit Changes</>}
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveView('overview')}
                        className="px-10 py-5 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        Dismiss
                    </button>
                </div>
            </form>
        </div>
    );

    const renderSecurityForm = () => (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl transition-all animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-10">
                <button onClick={() => setActiveView('overview')} className="flex items-center text-[10px] font-black uppercase text-slate-400 hover:text-gold-500 transition-colors tracking-[0.2em]">
                    <FaChevronLeft className="mr-2" /> Back to Dashboard
                </button>
                <h3 className="text-xs font-black uppercase text-rose-500 tracking-[0.3em] italic">Encryption Keys</h3>
            </div>

            <form onSubmit={handleSecuritySubmit} className="max-w-2xl space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Cipher</label>
                        <input 
                            type="password"
                            required
                            value={securityForm.currentPassword}
                            onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
                            placeholder="Verify your authority"
                        />
                    </div>
                    
                    <div className="h-[1px] w-full bg-slate-50 dark:bg-slate-800 my-4 transition-colors"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Protocol</label>
                            <input 
                                type="password"
                                required
                                value={securityForm.newPassword}
                                onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Protocol</label>
                            <input 
                                type="password"
                                required
                                value={securityForm.confirmPassword}
                                onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 p-6 rounded-3xl flex items-start space-x-4">
                    <FaExclamationCircle className="text-rose-500 mt-1" size={16} />
                    <div>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">High Security Area</p>
                        <p className="text-xs text-rose-400 font-medium">Changing your access key will terminate all other active terminal sessions instantly for your protection.</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 pt-6">
                    <button 
                        type="submit"
                        disabled={loading}
                        className="flex-1 md:flex-none px-10 py-5 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? 'Encrypting...' : 'Rotate Security Keys'}
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveView('overview')}
                        className="px-10 py-5 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        Dismiss
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter transition-colors">
                        Terminal <span className="text-gold-500">Core</span>
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-3 flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                        Profile Sync Active • System_v7.4
                    </p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 px-8 py-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl flex items-center space-x-8 transition-colors">
                    <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">KYC Status</p>
                        <div className="flex items-center text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">
                            <FaCheckCircle className="mr-2" size={10} /> Verified_A1
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Views */}
            <div className="transition-all duration-500">
                {activeView === 'overview' && renderOverview()}
                {activeView === 'profile' && renderProfileForm()}
                {activeView === 'security' && renderSecurityForm()}
                
                {(activeView === 'preferences' || activeView === 'notifications') && (
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-20 border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-8">
                            <FaCog className="text-slate-200 dark:text-slate-700 text-4xl animate-spin-slow" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-3 transition-colors">Module Integration Pending</h3>
                        <p className="text-sm text-slate-400 font-medium max-w-sm">This high-level preference module is currently being optimized for better terminal performance. Check back in the next version.</p>
                        <button onClick={() => setActiveView('overview')} className="mt-10 px-8 py-4 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                            Back to Core
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default SettingsTab;
