import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLocationMarker, HiOutlineChatAlt2, HiArrowRight } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import Container from '../../components/layout/Container';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import contactBg from '../../assets/images/contact.jpeg';
import publicService from '../../services/publicService';

const ContactPage = () => {
    const [formData, setFormData] = React.useState({
        fullName: '',
        email: '',
        subject: 'Account Inquiry',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await publicService.submitContactForm(formData);
            if (response.success) {
                toast.success('Request Received. Our institutional desk will contact you shortly.');
                setFormData({
                    fullName: '',
                    email: '',
                    subject: 'Account Inquiry',
                    message: ''
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initiate request. Network protocol error.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactMethods = [
        {
            icon: <HiOutlineChatAlt2 className="w-8 h-8" />,
            title: "Live Support",
            detail: "Available 24/5 via Live Chat",
            label: "Chat Now",
            color: "gold"
        },
        {
            icon: <HiOutlineMail className="w-8 h-8" />,
            title: "Email Us",
            detail: "support@yourbrokerage.com",
            label: "Send Email",
            color: "blue"
        },
        {
            icon: <HiOutlineLocationMarker className="w-8 h-8" />,
            title: "Global Office",
            detail: "Business Bay, Dubai, UAE",
            label: "View Map",
            color: "purple"
        }
    ];

    return (
        <main className="bg-[#000F29] min-h-screen text-white font-sans selection:bg-gold/30 overflow-hidden relative">
            <Navbar />

            {/* Premium Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <img 
                    src={contactBg} 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#000F29]/90 via-[#000F29]/70 to-[#000F29]/95" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4" />
                <div className="absolute inset-0 bg-grid-slim opacity-[0.03]" />
            </div>

            <section className="relative pt-44 pb-24 md:pt-56 md:pb-40 z-10">
                <Container>
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                            
                            {/* Left Side: Content */}
                            <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={fadeInUp}
                                className="space-y-12"
                            >
                                <div>
                                    <motion.div 
                                        variants={fadeInUp}
                                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 mb-8"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                        <span className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase">Connect With Us</span>
                                    </motion.div>
                                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold mb-6 md:mb-8 leading-tight">
                                        Let's Start a <br />
                                        <span className="gradient-text italic">Conversation</span>
                                    </h1>
                                    <p className="text-base md:text-lg text-white/50 leading-relaxed font-medium max-w-md">
                                        Have questions about our institutional infrastructure or trading conditions? Our experts are here to help you navigate the markets.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {contactMethods.map((method, idx) => (
                                        <motion.div 
                                            key={idx}
                                            variants={fadeInUp}
                                            className="group flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-gold/30 transition-all duration-500"
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                                {method.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-1">{method.title}</h3>
                                                <p className="text-xl font-display font-bold text-white">{method.detail}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Right Side: Contact Form */}
                            <motion.div 
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative lg:mt-10"
                            >
                                <div className="absolute -inset-4 bg-gold/5 blur-2xl rounded-[2rem] md:rounded-[3rem] -z-10" />
                                <div className="glass-card p-8 md:p-14 rounded-[2rem] md:rounded-[3rem] border-white/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-5">
                                        <HiOutlineMail className="w-32 h-32" />
                                    </div>
                                    
                                    <h2 className="text-3xl font-display font-bold mb-10">Send a Message</h2>
                                    
                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest ml-4">Full Name</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                                    placeholder="John Doe" 
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold/50 transition-colors" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest ml-4">Email Address</label>
                                                <input 
                                                    type="email" 
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    placeholder="john@example.com" 
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold/50 transition-colors" 
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest ml-4">Subject</label>
                                            <select 
                                                value={formData.subject}
                                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold/50 transition-colors appearance-none"
                                            >
                                                <option className="bg-navy" value="Account Inquiry">Account Inquiry</option>
                                                <option className="bg-navy" value="Technical Support">Technical Support</option>
                                                <option className="bg-navy" value="Institutional Services">Institutional Services</option>
                                                <option className="bg-navy" value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest ml-4">Message</label>
                                            <textarea 
                                                rows="4" 
                                                required
                                                value={formData.message}
                                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                                placeholder="How can we help you?" 
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none"
                                            ></textarea>
                                        </div>

                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full btn-gold py-5 rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Synchronizing Service...' : 'Initiate Request'} 
                                            {!isSubmitting && <HiArrowRight className="group-hover:translate-x-2 transition-transform" />}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </Container>
            </section>

            <Footer />
        </main>
    );
};

export default ContactPage;
