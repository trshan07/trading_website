import React from 'react';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { HiOutlineMail, HiOutlineLocationMarker, HiOutlineChatAlt2 } from 'react-icons/hi';

const ContactPage = () => {
    return (
        <main className="bg-navy min-h-screen">
            <Navbar />
            <div className="pt-32 pb-24">
                <Container>
                    <SectionTitle
                        subtitle="Contact Us"
                        title="Global Support 24/7"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-4 space-y-8">
                            <Card className="p-8 flex items-center space-x-6">
                                <div className="text-4xl text-gold"><HiOutlineMail /></div>
                                <div>
                                    <div className="text-white/40 text-[10px] uppercase font-bold mb-1">Email Support</div>
                                    <div className="font-bold">support@rizalstrade.com</div>
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-8">
                            <Card className="p-12 !bg-navy-light/40">
                                <form className="space-y-8">
                                    <input type="text" placeholder="Full Name" className="w-full bg-navy border border-white/10 rounded-xl px-4 py-4 text-white" />
                                    <Button variant="gold" className="w-full">Send Message</Button>
                                </form>
                            </Card>
                        </div>
                    </div>
                </Container>
            </div>
            <Footer />
        </main>
    );
};

export default ContactPage;
